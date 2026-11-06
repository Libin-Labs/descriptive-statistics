import test from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../dist/esm/index.js';
function random(seed = 123456789) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test('known population and sample moments', () => {
  const r = lib.summarize([2, 4, 4, 4, 5, 5, 7, 9]);
  assert.equal(r.mean, 5);
  assert.equal(r.populationVariance, 4);
  assert.equal(r.sampleVariance, 32 / 7);
  assert.equal(r.min, 2);
  assert.equal(r.max, 9);
});
test('empty and singleton semantics', () => {
  assert.equal(lib.summarize([]).mean, null);
  assert.equal(lib.summarize([]).populationVariance, null);
  assert.equal(lib.summarize([3]).sampleVariance, null);
  assert.equal(lib.summarize([3]).populationVariance, 0);
});
test('linear interpolated exact sample quantiles', () => {
  const a = [8, 2, 4, 6];
  assert.equal(lib.quantile(a, 0.5), 5);
  assert.equal(lib.quantile(a, 0.25), 3.5);
  assert.equal(lib.quantile(a, 0), 2);
  assert.equal(lib.quantile(a, 1), 8);
  assert.deepEqual(a, [8, 2, 4, 6]);
  assert.equal(lib.quantile([-Number.MAX_VALUE, Number.MAX_VALUE], 0.5), 0);
});
test('stable shifted moments and snapshot ownership', () => {
  const s = new lib.OnlineStatistics();
  [1e12 + 1, 1e12 + 2, 1e12 + 3].forEach((x) => s.add(x));
  const r = s.snapshot();
  assert.equal(r.sampleVariance, 1);
  r.count = 99;
  assert.equal(s.snapshot().count, 3);
});
test('validation bounded updates and overflow atomicity', () => {
  const s = new lib.OnlineStatistics({ maxCount: 1 });
  s.add(1);
  assert.throws(() => s.add(2), RangeError);
  assert.throws(() => lib.quantile([], 0), RangeError);
  assert.throws(() => lib.quantile([1], 2), RangeError);
  assert.throws(() => lib.summarize([NaN]), RangeError);
  const big = new lib.OnlineStatistics();
  big.add(Number.MAX_VALUE);
  assert.throws(() => big.add(-Number.MAX_VALUE), RangeError);
  assert.equal(big.snapshot().count, 1);
});
test('seeded two-pass mean variance and quantile oracle', () => {
  const rng = random();
  for (let t = 0; t < 100; t++) {
    const values = Array.from(
        { length: 1 + Math.floor(rng() * 50) },
        () => Math.floor(rng() * 1000) - 500,
      ),
      mean = values.reduce((a, b) => a + b, 0) / values.length,
      variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length,
      r = lib.summarize(values);
    assert.ok(Math.abs(r.mean - mean) < 1e-10);
    assert.ok(Math.abs(r.populationVariance - variance) < 1e-8);
    const sorted = [...values].sort((a, b) => a - b);
    for (const p of [0, 0.1, 0.25, 0.5, 0.75, 1]) {
      const x = (values.length - 1) * p,
        lo = Math.floor(x),
        hi = Math.ceil(x),
        q = sorted[lo] * (1 - (x - lo)) + sorted[hi] * (x - lo);
      assert.ok(Math.abs(lib.quantile(values, p) - q) < 1e-10);
    }
  }
});
