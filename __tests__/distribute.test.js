/**
 * Unit tests for Pool Payout Structure
 */

import { finalCoinDistribution } from '../index.js';
import {
    bisection,
    getUnperfectPrize,
    calcBucketNumber,
    initBuckSize,
    isNiceNum,
    getNiceNum,
    roundToNice,
    initPrizes,
    extendBuckets,
    removeSize,
    spendLeftover,
} from '../src/distribute.js';

describe('finalCoinDistribution', () => {
    test('returns valid JSON string', () => {
        const result = finalCoinDistribution(20, 5000, 50);
        expect(() => JSON.parse(result)).not.toThrow();
    });

    test('returns array of bucket objects', () => {
        const result = JSON.parse(finalCoinDistribution(20, 5000, 50));
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
    });

    test('bucket objects have correct structure', () => {
        const result = JSON.parse(finalCoinDistribution(20, 5000, 50));
        result.forEach(bucket => {
            expect(bucket).toHaveProperty('from');
            expect(bucket).toHaveProperty('to');
            expect(bucket).toHaveProperty('coins');
            expect(typeof bucket.from).toBe('number');
            expect(typeof bucket.to).toBe('number');
            expect(typeof bucket.coins).toBe('number');
        });
    });

    test('first bucket starts at rank 1', () => {
        const result = JSON.parse(finalCoinDistribution(20, 5000, 50));
        expect(result[0].from).toBe(1);
    });

    test('last bucket ends at total winners', () => {
        const winners = 50;
        const result = JSON.parse(finalCoinDistribution(winners, 10000, 50));
        const lastBucket = result[result.length - 1];
        expect(lastBucket.to).toBe(winners);
    });

    test('buckets cover all winners without gaps', () => {
        const result = JSON.parse(finalCoinDistribution(100, 20000, 50));
        for (let i = 1; i < result.length; i++) {
            expect(result[i].from).toBe(result[i - 1].to + 1);
        }
    });

    test('prizes decrease or stay same as rank increases', () => {
        const result = JSON.parse(finalCoinDistribution(50, 10000, 50));
        for (let i = 1; i < result.length; i++) {
            expect(result[i].coins).toBeLessThanOrEqual(result[i - 1].coins);
        }
    });

    test('all prizes are positive', () => {
        const result = JSON.parse(finalCoinDistribution(100, 50000, 100));
        result.forEach(bucket => {
            expect(bucket.coins).toBeGreaterThan(0);
        });
    });

    test('throws error when pool is too small', () => {
        expect(() => finalCoinDistribution(100, 1000, 100)).toThrow();
    });
});

describe('bisection', () => {
    test('finds root of simple function', () => {
        const f = x => x - 5;
        const result = bisection(f, 0, 10);
        expect(Math.abs(result - 5)).toBeLessThan(0.1);
    });

    test('finds root of quadratic', () => {
        const f = x => x * x - 4;
        const result = bisection(f, 0, 5);
        expect(Math.abs(result - 2)).toBeLessThan(0.1);
    });
});

describe('calcBucketNumber', () => {
    test('returns winner count for small numbers', () => {
        expect(calcBucketNumber(1)).toBe(1);
        expect(calcBucketNumber(2)).toBe(2);
        expect(calcBucketNumber(3)).toBe(3);
        expect(calcBucketNumber(4)).toBe(4);
    });

    test('returns reasonable bucket count for larger numbers', () => {
        const buckets = calcBucketNumber(100);
        expect(buckets).toBeGreaterThan(3);
        expect(buckets).toBeLessThan(100);
    });

    test('bucket count grows sublinearly', () => {
        const small = calcBucketNumber(50);
        const large = calcBucketNumber(500);
        expect(large).toBeLessThan(small * 10);
    });
});

describe('isNiceNum', () => {
    test('all single digits are nice', () => {
        for (let i = 1; i <= 9; i++) {
            expect(isNiceNum(i)).toBe(true);
        }
    });

    test('multiples of 5 in 10-99 range are nice', () => {
        expect(isNiceNum(10)).toBe(true);
        expect(isNiceNum(15)).toBe(true);
        expect(isNiceNum(50)).toBe(true);
        expect(isNiceNum(95)).toBe(true);
    });

    test('non-multiples of 5 in 10-99 range are not nice', () => {
        expect(isNiceNum(11)).toBe(false);
        expect(isNiceNum(23)).toBe(false);
        expect(isNiceNum(67)).toBe(false);
    });

    test('multiples of 25 in 100-249 range are nice', () => {
        expect(isNiceNum(100)).toBe(true);
        expect(isNiceNum(125)).toBe(true);
        expect(isNiceNum(200)).toBe(true);
    });

    test('multiples of 50 in 250+ range are nice', () => {
        expect(isNiceNum(250)).toBe(true);
        expect(isNiceNum(300)).toBe(true);
        expect(isNiceNum(500)).toBe(true);
        expect(isNiceNum(1000)).toBe(true);
    });

    test('zero is not nice', () => {
        expect(isNiceNum(0)).toBe(false);
    });

    test('negative numbers are not nice', () => {
        expect(isNiceNum(-5)).toBe(false);
    });
});

describe('getNiceNum', () => {
    test('returns array of nice numbers', () => {
        const nice = getNiceNum(100);
        expect(Array.isArray(nice)).toBe(true);
        nice.forEach(n => {
            expect(isNiceNum(n)).toBe(true);
        });
    });

    test('returns numbers up to max', () => {
        const nice = getNiceNum(50);
        nice.forEach(n => {
            expect(n).toBeLessThanOrEqual(50);
        });
    });

    test('returns sorted array', () => {
        const nice = getNiceNum(200);
        for (let i = 1; i < nice.length; i++) {
            expect(nice[i]).toBeGreaterThan(nice[i - 1]);
        }
    });
});

describe('roundToNice', () => {
    test('rounds down to nearest nice number', () => {
        const nice = getNiceNum(100);
        expect(roundToNice(17, nice)).toBe(15);
        expect(roundToNice(23, nice)).toBe(20);
        expect(roundToNice(99, nice)).toBe(95);
    });

    test('returns exact value if already nice', () => {
        const nice = getNiceNum(100);
        expect(roundToNice(50, nice)).toBe(50);
        expect(roundToNice(25, nice)).toBe(25);
    });

    test('returns 0 for empty nice numbers array', () => {
        expect(roundToNice(50, [])).toBe(0);
    });

    test('returns largest nice number if input exceeds max', () => {
        const nice = getNiceNum(100);
        expect(roundToNice(150, nice)).toBe(100);
    });
});

describe('initBuckSize', () => {
    test('returns empty array for less than 4 winners', () => {
        expect(initBuckSize(3, 3)).toEqual([]);
        expect(initBuckSize(2, 2)).toEqual([]);
    });

    test('first three buckets have size 1', () => {
        const sizes = initBuckSize(20, 5);
        expect(sizes[0]).toBe(1);
        expect(sizes[1]).toBe(1);
        expect(sizes[2]).toBe(1);
    });

    test('bucket sizes sum to winner count', () => {
        const winners = 50;
        const numBucks = calcBucketNumber(winners);
        const sizes = initBuckSize(winners, numBucks);
        const sum = sizes.reduce((a, b) => a + b, 0);
        expect(sum).toBe(winners);
    });

    test('bucket sizes are non-decreasing (mostly)', () => {
        const sizes = initBuckSize(100, 8);
        // First 3 should be 1
        expect(sizes[0]).toBe(1);
        expect(sizes[1]).toBe(1);
        expect(sizes[2]).toBe(1);
    });
});

describe('getUnperfectPrize', () => {
    test('returns array with correct length', () => {
        const prizes = getUnperfectPrize(20, 5000, 1100, 50);
        expect(prizes.length).toBe(20);
    });

    test('first prize equals specified prize1', () => {
        const prize1 = 1000;
        const prizes = getUnperfectPrize(20, 5000, prize1, 50);
        expect(prizes[0]).toBeCloseTo(prize1, 0);
    });

    test('prizes are in decreasing order', () => {
        const prizes = getUnperfectPrize(50, 10000, 2200, 50);
        for (let i = 1; i < prizes.length; i++) {
            expect(prizes[i]).toBeLessThanOrEqual(prizes[i - 1]);
        }
    });

    test('all prizes are at least minCoins', () => {
        const minCoins = 100;
        const prizes = getUnperfectPrize(50, 20000, 4400, minCoins);
        prizes.forEach(p => {
            expect(p).toBeGreaterThanOrEqual(minCoins);
        });
    });

    test('throws error when pool is insufficient', () => {
        expect(() => getUnperfectPrize(100, 1000, 220, 100)).toThrow();
    });
});

describe('integration tests', () => {
    test('handles various pool sizes', () => {
        const pools = [1000, 10000, 100000, 1000000];
        pools.forEach(pool => {
            const result = JSON.parse(finalCoinDistribution(50, pool, Math.floor(pool / 100)));
            expect(result.length).toBeGreaterThan(0);
        });
    });

    test('handles various winner counts', () => {
        const winners = [10, 50, 100, 500];
        winners.forEach(w => {
            const result = JSON.parse(finalCoinDistribution(w, w * 100, 10));
            expect(result.length).toBeGreaterThan(0);
            expect(result[result.length - 1].to).toBe(w);
        });
    });

    test('first prize is approximately 22% of pool', () => {
        const pool = 100000;
        const result = JSON.parse(finalCoinDistribution(100, pool, 100));
        const firstPrize = result[0].coins;
        const expectedFirstPrize = pool * 0.22;
        // Allow some variance due to nice number rounding
        expect(firstPrize).toBeGreaterThan(expectedFirstPrize * 0.8);
        expect(firstPrize).toBeLessThan(expectedFirstPrize * 1.2);
    });
});
