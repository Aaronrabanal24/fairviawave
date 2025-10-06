export type ActivityLevel = 'low' | 'medium' | 'high';

export function scoreBucket(countLast24h: number): ActivityLevel {
  if (countLast24h >= 20) return 'high';
  if (countLast24h >= 6) return 'medium';
  return 'low';
}