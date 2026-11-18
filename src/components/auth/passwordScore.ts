export type StrengthLevel = "weak" | "fair" | "strong";

// One point each: 8+ chars, 12+ chars, upper and lower case, a digit, a symbol
export const scorePassword = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export const strengthLevel = (password: string): StrengthLevel => {
  const score = scorePassword(password);
  if (score >= 4) return "strong";
  if (score === 3) return "fair";
  return "weak";
};
