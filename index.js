import {
    getUnperfectPrize,
    calcBucketNumber,
    initBuckSize,
    initPrizes,
    spendLeftover,
} from './src/distribute.js';

export const finalCoinDistribution = function finalCoinDistribution(winners, coin, minCoin) {
    const prize1 = 0.22 * coin;

    const unperfectSize = getUnperfectPrize(winners, coin, prize1, minCoin);

    const numBucks = calcBucketNumber(winners);

    const bucketSizes = initBuckSize(winners, numBucks);

    const { prizes, leftover } = initPrizes(unperfectSize, bucketSizes);

    const { finalPrizes, finalBucketSizes } = spendLeftover(prizes, bucketSizes, leftover);

    const coinsDistributed = [];
    let from = 0;
    let to = 0;
    for (let i = 0; i < finalBucketSizes.length; i += 1) {
        const bucketObj = {};
        from = to + 1;
        if (finalBucketSizes[i] === 1) {
            to = from;
        } else {
            to = from + finalBucketSizes[i] - 1;
        }

        bucketObj.from = from;
        bucketObj.to = to;

        bucketObj.coins = finalPrizes[i];
        coinsDistributed.push(bucketObj);
    }

    return JSON.stringify(coinsDistributed);
};
