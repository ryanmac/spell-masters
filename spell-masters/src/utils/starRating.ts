// src/utils/starRating.ts
export const getStarRating = (score: number, total: number) => {
  const percentage = (score / total) * 100
  if (percentage >= 100) return 3
  if (percentage >= 90) return 2
  if (percentage >= 80) return 1
  return 0
}