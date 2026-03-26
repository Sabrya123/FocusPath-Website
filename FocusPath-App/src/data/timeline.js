// Personalized timeline based on how long the user has been vaping
// vapingYears: '<1', '1-2', '2-3', '3+'

const BASE_TIMELINE = [
  {
    time: 'First 24 Hours',
    dayThreshold: 0,
    difficulty: 'hard',
    difficultyLabel: 'Tough Start',
    variants: {
      '<1': {
        title: 'Nicotine Leaves Your System',
        desc: "You'll feel restless and irritable as nicotine wears off. Since you haven't been vaping long, your body will adjust faster than most. The cravings are real but they peak today — ride them out.",
        advice: "Drink lots of water. Every craving only lasts 3-5 minutes. Distract yourself with something physical — a walk, push-ups, anything to reset your brain.",
      },
      '1-2': {
        title: 'The First Battle',
        desc: "Withdrawal hits. You'll feel anxious, irritable, maybe get headaches. After 1-2 years of vaping, your brain is wired to expect nicotine — today you're breaking that pattern.",
        advice: "Your body has built a routine around vaping. Replace the hand-to-mouth habit with something else — chew gum, hold a pen, sip cold water. Keep your hands busy.",
      },
      '2-3': {
        title: 'Breaking the Chain',
        desc: "After 2-3 years, nicotine is deeply embedded in your daily routine. Expect strong cravings, mood swings, and difficulty concentrating. This is your body fighting back — it's a sign of healing.",
        advice: "Tell someone you trust that you're quitting today. Accountability makes a huge difference. Remove all vapes and pods from your space — don't keep 'just one' around.",
      },
      '3+': {
        title: 'The Hardest Day',
        desc: "After 3+ years of constant nicotine, your brain chemistry is significantly altered. Today will be brutal — intense cravings, anxiety, brain fog, irritability. This is the price of freedom, and you're paying it right now.",
        advice: "This is war. Plan your entire day in advance so there are no empty moments where cravings can creep in. Eat well, hydrate, and remember: millions of people have survived this exact day.",
      },
    },
  },
  {
    time: 'Days 2-3',
    dayThreshold: 2,
    difficulty: 'hard',
    difficultyLabel: 'Peak Withdrawal',
    variants: {
      '<1': {
        title: 'Peak Cravings',
        desc: "Cravings peak around day 2-3 for everyone. You might feel foggy or short-tempered. The good news: since you caught this early, your receptors will recover quickly.",
        advice: "When a craving hits, take 5 deep breaths. Inhale for 4 seconds, hold for 4, exhale for 6. This activates your parasympathetic nervous system and kills the urge.",
      },
      '1-2': {
        title: 'The Summit',
        desc: "This is statistically the hardest point. Your nicotine receptors are screaming for a hit. Headaches, poor sleep, and irritability are all normal. You're climbing the steepest part of the mountain.",
        advice: "Don't make any major decisions today. Your brain is in withdrawal mode and everything feels worse than it is. Just survive these 48 hours — it gets dramatically easier after.",
      },
      '2-3': {
        title: 'The Wall',
        desc: "After years of use, days 2-3 feel like hitting a wall. Your brain had hundreds of thousands of nicotine hits and now it's getting zero. Sleep disruption, irritability, and intense cravings are expected.",
        advice: "Exercise is your best weapon right now. Even a 15-minute walk releases endorphins that directly counter withdrawal symptoms. Your body knows how to heal — let it.",
      },
      '3+': {
        title: 'Surviving the Storm',
        desc: "For heavy long-term users, days 2-3 are the storm. Your brain built thousands of neural pathways around nicotine. Expect severe cravings, insomnia, anxiety, and emotional volatility. This is temporary.",
        advice: "Consider nicotine replacement if the withdrawal is unbearable — patches or gum can take the edge off without the harmful chemicals from vaping. No shame in using tools to win.",
      },
    },
  },
  {
    time: 'Days 4-7',
    dayThreshold: 4,
    difficulty: 'medium',
    difficultyLabel: 'Getting Easier',
    variants: {
      '<1': {
        title: 'Turning the Corner',
        desc: "Physical withdrawal is fading fast. Cravings are shorter and less intense. Since your addiction was caught early, your brain is already starting to rewire itself.",
        advice: "Start noticing the improvements — better taste, better smell, more energy. These are real and they'll keep getting better. Write down three things that are already better.",
      },
      '1-2': {
        title: 'Over the Hump',
        desc: "The worst is behind you. Physical symptoms are easing. You'll still get cravings but they feel more manageable. Your body is starting to clean out the damage.",
        advice: "This is where many people relapse because the pain fades and they think 'just one won't hurt.' It will. One hit resets all your progress. Stay focused.",
      },
      '2-3': {
        title: 'The Fog Lifts',
        desc: "Physical symptoms start to ease, but after 2-3 years of use, psychological cravings remain strong. You'll notice moments where you automatically reach for something that isn't there anymore.",
        advice: "Start building replacement habits NOW. The habit loop (trigger → routine → reward) still exists — you just need a new routine. When you feel the urge, do your Unclouded habits instead.",
      },
      '3+': {
        title: 'First Signs of Freedom',
        desc: "Physical withdrawal is easing but after 3+ years, your brain has deeply ingrained patterns. You may feel emotionally flat or have vivid dreams. These are signs your brain is actively rewiring.",
        advice: "Be patient with yourself. Long-term users take longer to recover but they DO recover fully. Your brain has incredible plasticity — it's already building new pathways right now.",
      },
    },
  },
  {
    time: 'Week 2',
    dayThreshold: 8,
    difficulty: 'medium',
    difficultyLabel: 'Improving',
    variants: {
      '<1': {
        title: 'Breathing Easy',
        desc: "Your lung function is already improving. Sleep quality is better. You're past the hard part — the cravings that come now are mostly habitual, not chemical.",
        advice: "Pay attention to your triggers — stress, boredom, social situations. Now that the physical addiction is fading, it's the habits and triggers you need to manage.",
      },
      '1-2': {
        title: 'Building Momentum',
        desc: "Sleep is improving, breathing is easier, and energy levels are rising. Cravings still come but they're shorter and less intense. Your body is healing rapidly.",
        advice: "Start exercising if you haven't already. Your lungs can handle more now. Even light cardio will accelerate recovery and give you a natural endorphin boost that replaces nicotine.",
      },
      '2-3': {
        title: 'Real Progress',
        desc: "Two weeks in after years of vaping is a huge achievement. Your circulation is improving, your lungs are clearing out built-up damage, and your taste buds are waking up.",
        advice: "Calculate how much money you've saved in 2 weeks. Put that money toward something you want. Giving yourself tangible rewards reinforces the decision to quit.",
      },
      '3+': {
        title: 'The Body Remembers Health',
        desc: "After 3+ years of damage, your body is working overtime to repair itself. Cilia in your lungs are regrowing, blood pressure is normalising, and your immune system is strengthening. You may cough more — that's your lungs cleaning out years of residue.",
        advice: "The increased coughing is actually a GOOD sign — your lungs are clearing themselves out. Stay hydrated, consider steam inhalation, and know this phase passes within a few weeks.",
      },
    },
  },
  {
    time: 'Weeks 3-4',
    dayThreshold: 15,
    difficulty: 'medium',
    difficultyLabel: 'Stay Alert',
    variants: {
      '<1': {
        title: 'Almost a Month',
        desc: "Physical symptoms are essentially gone. The cravings that remain are purely psychological — triggered by situations, not chemistry. You're building a new identity.",
        advice: "Watch out for the 'I've already beaten it' trap. Staying aware of triggers is key. Celebrate this milestone — you've proven you don't need nicotine.",
      },
      '1-2': {
        title: 'Watch for Ambush Cravings',
        desc: "Physical symptoms are mostly gone, but after 1-2 years of vaping, certain situations will trigger strong cravings — stress at work, hanging with friends who vape, celebrations.",
        advice: "Have a plan for every trigger. If your friends vape, tell them you quit and ask them not to offer. If stress triggers you, have a go-to coping method ready. Preparation beats willpower.",
      },
      '2-3': {
        title: 'The Psychological Battle',
        desc: "The physical fight is largely won. But after 2-3 years, vaping became tied to your emotions — stress relief, celebration, boredom cure. Untangling these associations takes conscious effort.",
        advice: "When you crave, ask yourself: 'What am I actually feeling right now?' Usually it's stress, boredom, or loneliness — not a need for nicotine. Address the real feeling, not the fake solution.",
      },
      '3+': {
        title: 'Rewiring Deep Patterns',
        desc: "After 3+ years, vaping was woven into the fabric of your daily life. Morning vape, after-meal vape, stress vape. Each of these was a deeply grooved habit. You're now consciously reshaping all of them.",
        advice: "This is where your Unclouded habits matter most. You're not just removing a habit — you're replacing a lifestyle. Every positive habit you build fills the void that nicotine left behind.",
      },
    },
  },
  {
    time: 'Month 2',
    dayThreshold: 30,
    difficulty: 'easy',
    difficultyLabel: 'Feels Easier',
    variants: {
      '<1': {
        title: 'New Normal',
        desc: "Vaping feels like a distant memory. Your body has fully recovered from the short exposure. Energy is higher, breathing is clear, and you're saving money every day.",
        advice: "You caught it early and won. Use this experience as armour — if anyone ever offers you a vape in the future, remember how it felt to be dependent and say no with confidence.",
      },
      '1-2': {
        title: 'Transformation Underway',
        desc: "Your brain is actively rewiring. The automatic urges are fading. You have more energy, better taste and smell, and you're starting to forget what it felt like to need nicotine.",
        advice: "Notice how much better you feel compared to day 1. Write it down. On tough days in the future, this will be your evidence that quitting was the right call.",
      },
      '2-3': {
        title: 'Healing Accelerates',
        desc: "After 2-3 years of damage, your body needs more time but it IS healing. Lung capacity is measurably improved. Your skin looks better. The 'vaper's cough' is fading or gone.",
        advice: "Challenge yourself physically. Try running, swimming, or anything that makes you breathe hard. You'll be amazed at how much better your lungs perform now compared to when you vaped.",
      },
      '3+': {
        title: 'Deep Recovery',
        desc: "Your body is doing the heavy lifting now — repairing years of damage to your lungs, throat, and cardiovascular system. You may notice your skin clearing, your stamina improving, and your mind getting sharper.",
        advice: "Consider getting a health check-up. Seeing measurable improvements in your lung function or blood pressure can be incredibly motivating and validates every hard day you pushed through.",
      },
    },
  },
  {
    time: 'Month 3',
    dayThreshold: 60,
    difficulty: 'easy',
    difficultyLabel: 'Smooth Sailing',
    variants: {
      '<1': {
        title: 'Fully Free',
        desc: "At 3 months, your body has completely recovered from a short vaping period. Lung function is back to normal. Cravings are essentially non-existent. You've won.",
        advice: "Stay humble and stay aware. Many people relapse months later because they think they're 'cured' and can have 'just one.' You can never have just one. Stay Unclouded.",
      },
      '1-2': {
        title: 'Strength & Clarity',
        desc: "Lung capacity has improved significantly. Cravings are rare and manageable. You've gone from someone who needed nicotine to someone who doesn't even think about it most days.",
        advice: "Start helping others. When you see someone trying to quit, share what worked for you. Teaching reinforces your own commitment and gives meaning to your struggle.",
      },
      '2-3': {
        title: 'The Person You Were Meant To Be',
        desc: "After 2-3 years of vaping, reaching 3 months clean is a genuine accomplishment. Your lung capacity may have improved by up to 30%. Brain fog is gone. You think clearer and feel stronger.",
        advice: "Reflect on who you were 3 months ago vs. who you are now. That growth is permanent — as long as you never go back. Every day forward gets easier.",
      },
      '3+': {
        title: 'Reclaiming Your Body',
        desc: "Three months after quitting a 3+ year habit — your body has made remarkable progress. Lung function is significantly improved, circulation is better, and your brain chemistry is rebalancing. The hardest part is behind you.",
        advice: "The improvements you see at 3 months are just the beginning. Your body will continue healing for months and even years. You've built the discipline — now let time do the rest.",
      },
    },
  },
  {
    time: 'Month 6',
    dayThreshold: 180,
    difficulty: 'victory',
    difficultyLabel: 'Major Milestone',
    variants: {
      '<1': {
        title: 'Half Year Champion',
        desc: "Six months free. Your body has zero trace of the damage from your brief vaping period. You made the smartest decision of your life by quitting early.",
        advice: "Be proud of your discipline. Many people vape for years before quitting. You saw the trap and walked away. That's rare strength.",
      },
      '1-2': {
        title: 'Half Year Milestone',
        desc: "Your immune system is significantly stronger. Most people at this stage rarely think about vaping. You've proven that 1-2 years of addiction couldn't define you.",
        advice: "Look at your streak. Look at your points. Look at your habits. You built all of this from scratch. You're not just someone who quit vaping — you're someone who transformed their life.",
      },
      '2-3': {
        title: 'Six Months of Freedom',
        desc: "After 2-3 years of vaping, reaching 6 months clean means your body has reversed most of the damage. Your risk of respiratory infections has dropped significantly. You rarely think about vaping anymore.",
        advice: "Celebrate this properly. You fought through years of chemical dependency and won. Treat yourself to something meaningful — you've earned it with every craving you conquered.",
      },
      '3+': {
        title: 'The Comeback',
        desc: "Six months after quitting a 3+ year habit. Your body has done extraordinary repair work. Lung tissue is regenerating, cardiovascular health is markedly improved, and your brain's reward system is functioning normally again.",
        advice: "Think about what you would tell your past self — the version of you that thought quitting was impossible. You did it. Remember this feeling on the rare days when temptation whispers.",
      },
    },
  },
  {
    time: '1 Year',
    dayThreshold: 365,
    difficulty: 'victory',
    difficultyLabel: 'Victory',
    variants: {
      '<1': {
        title: 'One Year Free',
        desc: "A full year without nicotine. Your body is in peak recovery. Heart disease risk has dropped. You barely remember what it was like to vape. You're Unclouded.",
        advice: "You've proven that you have the discipline to overcome anything. Take this energy and apply it to every area of your life. You are capable of extraordinary things.",
      },
      '1-2': {
        title: 'One Year Victory',
        desc: "365 days clean after 1-2 years of vaping. Your lungs have healed dramatically, your heart disease risk has dropped significantly, and you've saved hundreds in money. You are free.",
        advice: "This anniversary matters. Mark it. Remember it. On your hardest days in life, remember that you quit nicotine for an entire year. Nothing is impossible for you.",
      },
      '2-3': {
        title: 'The Full Recovery',
        desc: "One year after quitting a 2-3 year habit. Your body has reversed the vast majority of damage. Lung function is near-normal, cardiovascular risk has plummeted, and you've saved thousands.",
        advice: "You've done something most people only talk about. You took on a multi-year addiction and won. Let this victory fuel everything else you do in life. You are Unclouded.",
      },
      '3+': {
        title: 'Reborn',
        desc: "One full year after ending a 3+ year addiction. Your heart disease risk has dropped dramatically. Lung capacity is vastly improved. You've saved thousands of dollars. Your brain's reward system has fully recalibrated. You are a completely different person.",
        advice: "You fought the longest battle and won. After 3+ years of dependency, you proved that no addiction is permanent. You are living proof that change is possible. Stay Unclouded forever.",
      },
    },
  },
];

export function getPersonalizedTimeline(vapingYears) {
  // Map vapingYears to the closest key
  let key = '<1';
  if (vapingYears === '1-2') key = '1-2';
  else if (vapingYears === '2-3') key = '2-3';
  else if (vapingYears === '3+' || vapingYears === '3-5' || vapingYears === '5+') key = '3+';
  else if (vapingYears === '<1' || vapingYears === '<6m' || vapingYears === '6-12m') key = '<1';

  return BASE_TIMELINE.map(item => {
    const variant = item.variants[key] || item.variants['<1'];
    return {
      time: item.time,
      dayThreshold: item.dayThreshold,
      difficulty: item.difficulty,
      difficultyLabel: item.difficultyLabel,
      title: variant.title,
      desc: variant.desc,
      advice: variant.advice,
    };
  });
}

// Fallback for backward compatibility
export const TIMELINE_DATA = getPersonalizedTimeline('<1');
