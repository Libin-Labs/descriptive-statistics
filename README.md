# @lp-labs/descriptive-statistics

Bounded finite descriptive statistics using Welford moments and exact sorted quantiles. Zero runtime and peer dependencies. MIT. Node.js 18+; ES2022-compatible browser runtimes with BigInt where used. No browser globals accessed at import.

## Install

```sh
npm install @lp-labs/descriptive-statistics
```

## Quick start

```js
import { summarize, quantile } from '@lp-labs/descriptive-statistics';
console.log(summarize([1, 2, 3]).sampleVariance); // 1
console.log(quantile([1, 2, 3, 4], 0.5)); // 2.5
```

ES modules use named imports above. CommonJS uses `const { OnlineStatistics, summarize, quantile } = require('@lp-labs/descriptive-statistics');`. Both formats ship declarations.

## Public API and customization

- `StatisticsOptions`: `maxCount?`, positive safe integer, default 1,000,000.
- `StatisticsSnapshot`: `count`, `mean`, `min`, `max`, `populationVariance`, `sampleVariance`. Empty statistics use null; sample variance requires at least two observations.
- `OnlineStatistics(options?)`: `add(value): void`, `snapshot(): StatisticsSnapshot`, online Welford updates with fresh snapshots.
- `summarize(values: Iterable<number>,options?): StatisticsSnapshot`.
- `quantile(values: readonly number[], probability): number`: copied sorted sample, linear interpolation at (n-1)p (type 7), p in [0,1]. Exact sample ordering, not a population-confidence statement.

All runtime exports and public declaration types are listed above. Options are per call/instance; no global configuration.

## Errors, ownership and limits

RangeError for nonfinite observations/probabilities, empty or over-1,000,000-element quantile samples, invalid limits, exhausted observation limit or numerical overflow. Failed updates preserve state. Online add O(1), summarize O(n)/O(1) storage, quantile O(n log n)/O(n). Stable moments reduce cancellation but doubles still round; no exact floating arithmetic, inference, confidence intervals, missing-value filtering or weighted moments.

Algorithms are synchronous and CPU/memory bounded by the stated limits, not cancellable or real-time. Validation does not sandbox hostile getters, proxies, callbacks or infinite iterables. TypeScript signatures are the supported input contract. No I/O, network, persistence or cryptographic guarantees.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

Strict TypeScript, ESM/CommonJS, bare installed-package consumers with negative type assertions, and deterministic reference-oracle tests are included. Only TypeScript and Prettier are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
