// Ensure that we have the right interval
export const bisection = function bisection(fun, a, b) {
    while (fun(a) * fun(b) > 0) {
        b += 1;
    }
    let c = (a + b) / 2.0;
    while (Math.abs(fun(c)) > 0.01) {
        if (fun(a) * fun(c) < 0) {
            b = c;
        } else {
            a = c;
        }
        c = (a + b) / 2.0;
    }
    return c;
};

export const getUnperfectPrize = function getUnperfectPrize(totalWinners, totalCoins, prize1, minCoins) {
    // prize_pool > num_wins * entry_fee
    // price1 < prize_pool
    const unperfectPrizes = [];

    if (totalCoins <= totalWinners * minCoins) {
        throw new Error('Wrong choice of parameters, prize_pool must be increased.');
    }

    const getAlpha = function fToOptimize(alpha) {
        let count = 0;
        for (let i = 1; i < totalWinners + 1; i += 1) {
            count += 1 / (i ** alpha);
        }
        return (totalCoins - totalWinners * minCoins - (prize1 - minCoins) * count);
    };
    const b = 1 - Math.log((totalCoins - (totalWinners * minCoins)) / (prize1 - minCoins)) / Math.log(totalWinners);
    const alpha = bisection(getAlpha, 0, b);
    for (let i = 1; i < totalWinners + 1; i += 1) {
        unperfectPrizes.push(minCoins + (prize1 - minCoins) / (i ** alpha));
    }

    return unperfectPrizes;
};

export const calcBucketNumber = function calcBucketNumber(totalWinners) {
    const expBeta = 2.5;
    let numBucks = 3;
    const initialBuckVal = 1;
    let bucketVal = Math.ceil(initialBuckVal * expBeta);
    if (totalWinners <= 4) {
        numBucks = totalWinners;
    } else {
        while (totalWinners > (bucketVal + numBucks)) {
            if (bucketVal + numBucks <= totalWinners) {
                numBucks += 1;
            }

            bucketVal = Math.ceil(expBeta * bucketVal);
        }
    }
    return numBucks;
};

export const extendBuckets = function extendBuckets(bucketSizes, numBucks) {
    const numBuckToAdd = numBucks - bucketSizes.length;
    // First try to extend with ones.
    const onesToAdd = [];
    for (let i = 0; i < numBuckToAdd; i += 1) {
        onesToAdd.push(1);
    }
    return [...bucketSizes.slice(0, 4), ...onesToAdd, ...bucketSizes.slice(4)];
};

export const removeSize = function removeSize(bucketSizes, toRemove) {
    // There's two things that can happen: length(bucket_sizes) < num_buck

    if (bucketSizes.length === 0) {
        return [];
    }
    let idx = bucketSizes.length - 1;

    while (toRemove > 0) {
        // Backward and Forward pass
        const diff = bucketSizes[idx] - bucketSizes[idx - 1];
        if (diff >= toRemove) {
            bucketSizes[idx] -= toRemove;
            toRemove = 0;
        } else {
            bucketSizes[idx] -= diff;
            toRemove -= diff;
            idx -= 1;
        }
    }
    if (toRemove !== 0) {
        removeSize(bucketSizes, toRemove);
    }
    return bucketSizes;
};

export const initBuckSize = function initBuckSize(numWins, numBucks) {
    let bucketSizes = [];

    // Must be at least 3 winners
    if (numWins < 4) {
        return bucketSizes;
    }
    // Must be more or an equal number of winners than the number of buckets.
    if (numWins < numBucks) {
        return bucketSizes;
    }
    // First 3 buckets of size 1
    for (let i = 0; i < 3; i += 1) {
        bucketSizes.push(1);
    }

    let bucketSizeSum = bucketSizes.reduce((a, b) => a + b, 0);

    if ((numWins - bucketSizeSum) === 1) {
        // Size of bucket 4 = 1
        bucketSizes.push(1);
        return bucketSizes;
    }

    if (numWins === numBucks) {
        for (let i = 1; i < numWins - 3; i += 1) {
            bucketSizes.push(1);
        }
        return bucketSizes;
    }

    // This is for the first 3 buckets size = 1
    const getBeta = function bToOptimize(beta) {
        let count = 0;
        for (let i = 1; i < numBucks - 2; i += 1) {
            count += beta ** i;
        }
        return count - numWins + 3;
    };

    const beta = bisection(getBeta, -1, 2);

    let sumBuck = 4;
    let i = 1;

    while (sumBuck <= numWins) {
        const thisBuckSize = Math.ceil(beta ** i);
        bucketSizes.push(thisBuckSize);
        sumBuck += thisBuckSize;
        i += 1;
    }
    bucketSizeSum = bucketSizes.reduce((a, b) => a + b, 0);
    let toRemove = bucketSizeSum - numWins;
    // We need to decrease some sizes
    if (toRemove > 0) {
        bucketSizes = removeSize(bucketSizes, toRemove);
    }
    if (bucketSizes.length < numBucks) {
        bucketSizes = extendBuckets(bucketSizes, numBucks);
    }
    bucketSizeSum = bucketSizes.reduce((a, b) => a + b, 0);
    toRemove = bucketSizeSum - numWins;
    if (toRemove > 0) {
        bucketSizes = removeSize(bucketSizes, toRemove);
    }
    return bucketSizes;
};

/**
 * (num) -> bool
 * Return True if num is a nice number, otherwise return False
 */
export const isNiceNum = function isNiceNum(num) {
    let n = num;
    while (n > 1000) {
        n /= 10;
    }
    if (n >= 250) {
        return (n % 50 === 0);
    } if (n >= 100) {
        return (n % 25 === 0);
    } if (n >= 10) {
        return (n % 5 === 0);
    } if (n > 0) {
        return Number.isInteger(n);
    }
    return false;
};

/**
 * (num) -> list
 * Return a list of sorted list of nice numbers
 * @param maxNum
 */
export const getNiceNum = function getNiceNum(maxNum) {
    const niceNumbers = [];
    for (let i = 1; i < parseInt(maxNum, 10) + 1; i += 1) {
        const res = isNiceNum(i);
        if (res) {
            niceNumbers.push(i);
        }
    }
    return niceNumbers;
};

export const roundToNice = function roundToNice(numToRound, niceNumbers) {
    if (niceNumbers.length === 0) {
        return 0;
    }
    if (numToRound >= niceNumbers[niceNumbers.length - 1]) {
        return niceNumbers[niceNumbers.length - 1];
    }
    if (numToRound < niceNumbers[0]) {
        return 0;
    }
    let minIdx = 0;
    let maxIdx = niceNumbers.length - 1;
    let idx = Math.floor((maxIdx + minIdx) / 2);
    let currVal = niceNumbers[idx];
    let nextVal = niceNumbers[idx + 1];
    while (currVal > numToRound || numToRound >= nextVal) {
        // Increase the index.
        if (currVal < numToRound) {
            minIdx = idx;
        } else if (currVal > numToRound) {
            maxIdx = idx;
        }
        idx = Math.floor((maxIdx + minIdx) / 2);
        currVal = niceNumbers[idx];
        nextVal = niceNumbers[idx + 1];
    }
    return currVal;
};

/**
 * Need to check if sum(bucketSizes) == len(unperfectPrize)
 * @param unperfectPrize
 * @param bucketSizes
 */
export const initPrizes = function initPrizes(unperfectPrize, bucketSizes) {
    let bucketSizeSum = bucketSizes.reduce((a, b) => a + b, 0);

    if (bucketSizeSum !== unperfectPrize.length) {
        throw new Error('Bucket sizes is incompatible with the number of prizes');
    }
    // Take the first unperfectPrize and generate nice numbers list
    const nice = getNiceNum(unperfectPrize[0]);
    // Will contains the first attempt of good prizes
    const prizes = [];
    let leftover = 0;
    let pos = 0;
    bucketSizes.forEach((eachBucketSize) => {
        // rounding the first tentative prize to nearest nice number
        const unperfectSizeSum = unperfectPrize.slice(pos, pos + eachBucketSize);
        bucketSizeSum = unperfectSizeSum.reduce((a, b) => a + b, 0);

        const currNum = (bucketSizeSum + leftover) / eachBucketSize;
        const currNice = roundToNice(currNum, nice);
        prizes.push(currNice);
        // Then compute leftover
        leftover = (currNum - currNice) * eachBucketSize;
        pos += eachBucketSize;
    });
    return { prizes, leftover };
};

/**
 * Return the finale prizes list along with the bucket_sizes and leftover when all the leftover is spend.
 */
export const spendLeftover = function spendLeftover(prizes, bucketSizes, leftover) {
    const niceNumbers = getNiceNum(prizes[0]);
    let bucketNum = null;
    // First : Spend as much of possible leftover on singleton bucket 2 through 4.
    for (let i = 1; i < 4; i += 1) {
        const minVal = Math.min(prizes[i] + leftover, (prizes[i - 1] + prizes[i]) / 2);
        const niceVal = roundToNice(minVal, niceNumbers);
        leftover += prizes[i] - niceVal;
        prizes[i] = niceVal;
        // Could choose another value
        if (leftover === 0) {
            return { finalPrizes: prizes, finalBucketSizes: bucketSizes, finalLeftover: leftover };
        }
        //  Otherwise, we try to adjust starting form the final bucket.
        bucketNum = bucketSizes.length - 1;
    }
    while (bucketNum > 0) {
        while (leftover >= bucketSizes[bucketNum]) {
            // Could lead to nice number violations
            prizes[bucketNum] += 1;
            leftover -= bucketSizes[bucketNum];
            // Could choose another value
            if (leftover === 0) {
                return { finalPrizes: prizes, finalBucketSizes: bucketSizes, finalLeftover: leftover };
            }
        }
        bucketNum -= 1;
        if (leftover % prizes[bucketNum] === 0) {
            // number of winners increase
            bucketSizes[bucketNum] += leftover / prizes[bucketNum];
        }
    }
    return { finalPrizes: prizes, finalBucketSizes: bucketSizes, finalLeftover: leftover };
};
