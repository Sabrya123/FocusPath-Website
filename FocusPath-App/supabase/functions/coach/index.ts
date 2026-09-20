// Unclouded AI coach.
//
// One function, two modes:
//   mode: "ask"      -> conversational Q&A from the Ask AI tab
//   mode: "overseer" -> an unprompted recommendation from the user's progress
//
// The Anthropic API key lives ONLY here. It must never reach the app bundle —
// anything in a React Native build is extractable.
//
// Streaming is server-side only. The Edge Function streams from Claude (which
// keeps long replies from hitting the request timeout) and returns complete
// JSON, because React Native's fetch cannot consume a streaming response body.

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isCrisis, CRISIS_REPLY } from "./crisis.ts";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Kept byte-stable so it can be prompt-cached. Anything that varies per user
// belongs in the messages array, after the cache breakpoint — one changed byte
// in the prefix invalidates the whole cache.
const COACH_SYSTEM = `You are the coach inside Unclouded, an app that helps people quit vaping.

You are talking to someone who is actively quitting. Speak to them like a
knowledgeable friend who has seen this many times: warm, direct, and specific.

HOW TO RESPOND
- Keep replies short. Two or three short paragraphs at most. This is a phone screen.
- Use their actual numbers. "You're 78 days in and your longest streak was 31"
  lands; "keep up the good work" does not.
- Give one concrete action they can take today, not a list of five.
- Never open with "Great question" or similar filler. Answer the thing.
- Cravings peak around 3-5 minutes. If they are in one right now, say so and
  point them at the Emergency button in the app.

WHAT YOU ARE NOT
- You are not a doctor. For anything about nicotine replacement dosing, drug
  interactions, medication, chest pain, or breathing difficulty, say plainly
  that this needs a pharmacist or GP, and stop there. Do not estimate doses.
- Do not invent statistics. If you are not sure of a number, describe the effect
  without a figure.
- Do not moralise about relapse. A relapse is data, not a verdict. Ask what the
  trigger was and help them plan around it.

SAFETY
If the person expresses intent to harm themselves, or hopelessness that sounds
like more than withdrawal, stop coaching. Tell them plainly that this is bigger
than vaping, that help exists, and give them a crisis line for their region
(988 in the US, 116 123 in the UK, 13 11 14 in Australia). Do not continue the
cessation conversation until they are safe.`;

// The deterministic crisis short-circuit lives in crisis.ts so it can be
// exercised on its own: node scripts/check-crisis-patterns.js
// It runs before the model and replaces the reply entirely.

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function daysSince(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

/**
 * A compact prose summary beats a JSON dump: fewer tokens, and the model
 * reasons over it better.
 *
 * `profile` is authoritative (server-read, so the client can't inflate it).
 * `local` carries things that only exist on the device — habits, identity,
 * recent Emergency presses.
 */
function buildContext(
  profile: Record<string, unknown> | null,
  local: Record<string, unknown>,
): string {
  const lines: string[] = [];

  const quitDays = daysSince(profile?.quit_date as string);
  if (quitDays !== null) lines.push(`Days since quitting: ${quitDays}`);
  if (profile?.points != null) lines.push(`Points: ${profile.points}`);
  if (profile?.streak_days != null) lines.push(`Current streak: ${profile.streak_days} days`);

  if (typeof local.rank === "string") lines.push(`Rank: ${local.rank}`);
  if (typeof local.longestStreak === "number") lines.push(`Longest streak: ${local.longestStreak} days`);
  if (typeof local.identity === "string" && local.identity.trim()) {
    lines.push(`Who they want to become: "${local.identity.trim().slice(0, 300)}"`);
  }
  if (Array.isArray(local.habits) && local.habits.length) {
    const summary = local.habits
      .slice(0, 8)
      .map((h: { name?: string; done?: number; target?: number }) =>
        `${h.name ?? "habit"} ${h.done ?? 0}/${h.target ?? 7}`)
      .join(", ");
    lines.push(`Habits this week: ${summary}`);
  }
  if (typeof local.emergencyPresses7d === "number") {
    lines.push(`Emergency button presses in the last 7 days: ${local.emergencyPresses7d}`);
  }

  return lines.length ? lines.join("\n") : "No progress data recorded yet.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    // verify_jwt is on, but we still resolve the user so we read THEIR row and
    // never trust a user id sent from the client.
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Not signed in." }, 401);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "overseer" ? "overseer" : "ask";
    const question = String(body.question ?? "").slice(0, 2000);
    const local = (body.local ?? {}) as Record<string, unknown>;

    // Last 10 turns is plenty of memory for this and bounds the token spend.
    const history = (Array.isArray(body.history) ? body.history : [])
      .slice(-10)
      .filter((m: { role?: string; content?: string }) =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, 4000),
      }));

    if (mode === "ask") {
      if (!question.trim()) return json({ error: "Ask me something." }, 400);
      if (isCrisis(question)) return json({ reply: CRISIS_REPLY, crisis: true });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, streak_days, points, quit_date")
      .eq("id", user.id)
      .maybeSingle();

    const context = buildContext(profile, local);

    const task = mode === "overseer"
      ? "Look at their progress above and give one specific observation and one " +
        "concrete suggestion for today. Three sentences maximum. Do not greet them."
      : question;

    const stream = anthropic.messages.stream({
      model: "claude-opus-5",
      // A ceiling, not a target — the system prompt keeps replies short. Adaptive
      // thinking spends from this same budget, so a tight cap can end the turn
      // before any reply text is written.
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: COACH_SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [
        { role: "user", content: `<user_progress>\n${context}\n</user_progress>` },
        { role: "assistant", content: "Understood — I have their progress in mind." },
        ...history,
        { role: "user", content: task },
      ],
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return json({
        reply: "I can't help with that one. Try asking me about cravings, " +
               "triggers, withdrawal, or how to handle a specific situation.",
      });
    }

    const reply = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!reply) {
      console.error("coach produced no text, stop_reason:", message.stop_reason);
      return json({ error: "The coach didn't finish its answer. Try again." }, 502);
    }

    return json({
      reply,
      usage: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
        cacheRead: message.usage.cache_read_input_tokens ?? 0,
      },
    });
  } catch (err) {
    // Typed first, so retryable and non-retryable failures stay distinguishable.
    if (err instanceof Anthropic.RateLimitError) {
      return json({ error: "Busy right now — try again in a moment." }, 429);
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("ANTHROPIC_API_KEY missing or invalid");
      return json({ error: "Coach is not configured yet." }, 500);
    }
    // Out of prepaid credits. This account has received it as a 400
    // invalid_request_error ("Your credit balance is too low…") and the API also
    // documents a 402 billing_error; the 400 form is only distinguishable from
    // other bad requests by its message.
    if (err instanceof Anthropic.APIError &&
        (err.status === 402 || /credit balance/i.test(err.message))) {
      console.error("Anthropic account is out of credits:", err.message);
      return json({ error: "Coach is out of API credits." }, 402);
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return json({ error: "Couldn't reach the coach. Try again." }, 502);
    }
    console.error("coach failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
});
