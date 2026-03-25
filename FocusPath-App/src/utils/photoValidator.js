// Photo validation for habit verification
// In a production app, this would use AI Vision (Claude/OpenAI) to analyze the image.
// For now, we accept photos and trust the user — the photo serves as accountability.
// The before/after comparison is visible on the "Are you done?" screen.

export function validateHabitPhoto(category, habitName, timing) {
  // For now, all photos are accepted.
  // In production, you would:
  // 1. Upload the image to your backend
  // 2. Send it to Claude Vision / OpenAI Vision API
  // 3. Ask: "Does this image show someone doing [habitName] ([category] habit)?"
  // 4. Return valid/invalid based on the AI response

  return {
    valid: true,
    message: 'Photo accepted!',
  };
}
