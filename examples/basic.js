/**
 * Fair Prizes - Usage Examples
 *
 * Run with: node examples/basic.js
 */

import { finalCoinDistribution } from '../index.js';

// Helper function to display results nicely
function displayResults(title, distribution) {
    console.log('\n' + '='.repeat(50));
    console.log(title);
    console.log('='.repeat(50));

    let total = 0;
    distribution.forEach(bucket => {
        const count = bucket.to - bucket.from + 1;
        const bucketTotal = bucket.coins * count;
        total += bucketTotal;

        if (bucket.from === bucket.to) {
            console.log(`  Rank #${bucket.from}: ${bucket.coins.toLocaleString()} coins`);
        } else {
            console.log(`  Rank #${bucket.from}-${bucket.to}: ${bucket.coins.toLocaleString()} coins each (${count} winners)`);
        }
    });
    console.log('-'.repeat(50));
    console.log(`  Total: ${total.toLocaleString()} coins | Buckets: ${distribution.length}`);
}

// ============================================
// Example 1: Small Tournament
// ============================================
console.log('\n### Example 1: Small Tournament ###');
console.log('20 winners competing for 5,000 coins (min 50 each)');

const smallTournament = JSON.parse(
    finalCoinDistribution(20, 5000, 50)
);
displayResults('Small Tournament Results', smallTournament);

// ============================================
// Example 2: Medium Tournament
// ============================================
console.log('\n### Example 2: Medium Tournament ###');
console.log('100 winners competing for 50,000 coins (min 100 each)');

const mediumTournament = JSON.parse(
    finalCoinDistribution(100, 50000, 100)
);
displayResults('Medium Tournament Results', mediumTournament);

// ============================================
// Example 3: Large Lottery
// ============================================
console.log('\n### Example 3: Large Lottery ###');
console.log('1000 winners sharing 1,000,000 coins (min 200 each)');

const largeLottery = JSON.parse(
    finalCoinDistribution(1000, 1000000, 200)
);
displayResults('Large Lottery Results', largeLottery);

// ============================================
// Example 4: Gaming Leaderboard Rewards
// ============================================
console.log('\n### Example 4: Gaming Leaderboard ###');
console.log('Top 50 players get gems from weekly pool of 10,000 gems');

const leaderboard = JSON.parse(
    finalCoinDistribution(50, 10000, 50)
);

// Transform to game-friendly format
const gameRewards = leaderboard.map(bucket => ({
    ranks: bucket.from === bucket.to
        ? `#${bucket.from}`
        : `#${bucket.from}-${bucket.to}`,
    gems: bucket.coins,
    players: bucket.to - bucket.from + 1
}));

console.log('\nLeaderboard Rewards:');
gameRewards.forEach(reward => {
    console.log(`  ${reward.ranks.padEnd(10)} -> ${reward.gems} gems`);
});

// ============================================
// Example 5: Custom Analysis
// ============================================
console.log('\n### Example 5: Distribution Analysis ###');

const analysis = JSON.parse(finalCoinDistribution(100, 100000, 100));

// Calculate statistics
const firstPrize = analysis[0].coins;
const lastPrize = analysis[analysis.length - 1].coins;
const totalWinners = analysis.reduce((sum, b) => sum + (b.to - b.from + 1), 0);
const totalPayout = analysis.reduce((sum, b) => sum + b.coins * (b.to - b.from + 1), 0);

console.log('\nDistribution Statistics:');
console.log(`  First Place Prize: ${firstPrize.toLocaleString()} coins`);
console.log(`  Last Place Prize:  ${lastPrize.toLocaleString()} coins`);
console.log(`  Prize Ratio (1st/last): ${(firstPrize / lastPrize).toFixed(1)}x`);
console.log(`  Number of Buckets: ${analysis.length}`);
console.log(`  Total Winners: ${totalWinners}`);
console.log(`  Total Payout: ${totalPayout.toLocaleString()} coins`);

// ============================================
// Example 6: API Response Format
// ============================================
console.log('\n### Example 6: API Response Format ###');
console.log('Raw JSON output suitable for API responses:\n');

const apiResponse = finalCoinDistribution(10, 1000, 25);
console.log(apiResponse);

console.log('\n' + '='.repeat(50));
console.log('Examples completed!');
console.log('='.repeat(50) + '\n');
