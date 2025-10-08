/**
 * Score buckets for different metrics
 */
export const SCORE_BUCKETS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

type ScoreBucket = typeof SCORE_BUCKETS[keyof typeof SCORE_BUCKETS];

/**
 * Calculate the score bucket based on a value and thresholds
 * @param value The value to evaluate
 * @param thresholds Object containing thresholds for medium and high scores
 * @returns Score bucket (low, medium, or high)
 */
export function scoreBucket(
  value: number,
  thresholds: { medium: number; high: number }
): ScoreBucket {
  if (value >= thresholds.high) {
    return SCORE_BUCKETS.HIGH;
  }
  if (value >= thresholds.medium) {
    return SCORE_BUCKETS.MEDIUM;
  }
  return SCORE_BUCKETS.LOW;
}