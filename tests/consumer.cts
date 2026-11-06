import {
  OnlineStatistics,
  summarize,
  quantile,
  type StatisticsOptions,
  type StatisticsSnapshot,
} from '@lp-labs/descriptive-statistics';
export type PublicTypes = [StatisticsOptions, StatisticsSnapshot];
void OnlineStatistics;
void summarize;
void quantile;
const summary: StatisticsSnapshot = summarize([1, 2, 3]);
const stats = new OnlineStatistics({ maxCount: 10 });
stats.add(2);
const q: number = quantile([1, 2], 0.5);
void summary;
void q;
// @ts-expect-error finite numeric observations required
stats.add('2');
