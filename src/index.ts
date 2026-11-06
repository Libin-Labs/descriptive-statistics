export interface StatisticsOptions {
  maxCount?: number;
}
export interface StatisticsSnapshot {
  count: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  populationVariance: number | null;
  sampleVariance: number | null;
}
export class OnlineStatistics {
  private count = 0;
  private mean = 0;
  private m2 = 0;
  private minimum = Infinity;
  private maximum = -Infinity;
  private readonly limit: number;
  constructor(options: StatisticsOptions = {}) {
    this.limit = options.maxCount ?? 1000000;
    if (!Number.isSafeInteger(this.limit) || this.limit < 1 || this.limit > Number.MAX_SAFE_INTEGER)
      throw new RangeError('Invalid maxCount');
  }
  add(value: number): void {
    if (!Number.isFinite(value)) throw new RangeError('Expected finite observation');
    if (this.count >= this.limit) throw new RangeError('Observation limit exceeded');
    const count = this.count + 1,
      delta = value - this.mean;
    const mean = this.count === 0 ? value : this.mean + delta / count;
    const m2 = this.count === 0 ? 0 : this.m2 + delta * (value - mean);
    if (!Number.isFinite(mean) || !Number.isFinite(m2)) throw new RangeError('Moment overflow');
    this.count = count;
    this.mean = mean;
    this.m2 = Math.max(0, m2);
    this.minimum = Math.min(this.minimum, value);
    this.maximum = Math.max(this.maximum, value);
  }
  snapshot(): StatisticsSnapshot {
    return {
      count: this.count,
      mean: this.count ? this.mean : null,
      min: this.count ? this.minimum : null,
      max: this.count ? this.maximum : null,
      populationVariance: this.count ? this.m2 / this.count : null,
      sampleVariance: this.count > 1 ? this.m2 / (this.count - 1) : null,
    };
  }
}
export function summarize(
  values: Iterable<number>,
  options: StatisticsOptions = {},
): StatisticsSnapshot {
  const statistics = new OnlineStatistics(options);
  for (const value of values) statistics.add(value);
  return statistics.snapshot();
}
export function quantile(values: readonly number[], probability: number): number {
  if (
    !Array.isArray(values) ||
    values.length < 1 ||
    values.length > 1000000 ||
    !Number.isFinite(probability) ||
    probability < 0 ||
    probability > 1
  )
    throw new RangeError('Invalid quantile input');
  const sorted = Array.from(values, (value) => {
    if (!Number.isFinite(value)) throw new RangeError('Expected finite observation');
    return value;
  }).sort((a, b) => a - b);
  const index = (sorted.length - 1) * probability,
    lower = Math.floor(index),
    fraction = index - lower;
  if (fraction === 0) return sorted[lower]!;
  const a = sorted[lower]!,
    b = sorted[lower + 1]!;
  const result =
    Math.sign(a) === Math.sign(b) ? a + (b - a) * fraction : a * (1 - fraction) + b * fraction;
  if (!Number.isFinite(result)) throw new RangeError('Quantile overflow');
  return result;
}
