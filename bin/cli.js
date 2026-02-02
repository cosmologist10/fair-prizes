#!/usr/bin/env node

import * as readline from 'readline';
import { finalCoinDistribution } from '../index.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function formatNumber(num) {
    return num.toLocaleString();
}

function formatRank(from, to) {
    if (from === to) {
        if (from === 1) return '1st';
        if (from === 2) return '2nd';
        if (from === 3) return '3rd';
        return `${from}th`;
    }
    return `${from}-${to}`;
}

function printDistribution(distribution, winners, pool, minCoins) {
    console.log('\n' + '='.repeat(55));
    console.log(`Prize Distribution for ${winners} winners | Pool: ${formatNumber(pool)} | Min: ${minCoins}`);
    console.log('='.repeat(55));
    console.log('');
    console.log('Rank'.padEnd(12) + 'Prize'.padEnd(12) + 'Winners'.padEnd(10) + 'Total Payout');
    console.log('-'.repeat(12) + '-'.repeat(12) + '-'.repeat(10) + '-'.repeat(12));

    let totalDistributed = 0;

    distribution.forEach((bucket) => {
        const rank = formatRank(bucket.from, bucket.to);
        const winnersInBucket = bucket.to - bucket.from + 1;
        const bucketTotal = bucket.coins * winnersInBucket;
        totalDistributed += bucketTotal;

        console.log(
            rank.padEnd(12) +
            formatNumber(bucket.coins).padEnd(12) +
            winnersInBucket.toString().padEnd(10) +
            formatNumber(bucketTotal)
        );
    });

    console.log('-'.repeat(46));
    console.log(`Total distributed: ${formatNumber(totalDistributed)}`);
    console.log(`Number of buckets: ${distribution.length}`);
    console.log('');
}

function printPresets() {
    console.log('\nPreset Examples:');
    console.log('  [1] Small Tournament  - 20 winners, 5,000 pool, 50 min');
    console.log('  [2] Medium Tournament - 100 winners, 25,000 pool, 100 min');
    console.log('  [3] Large Tournament  - 500 winners, 100,000 pool, 50 min');
    console.log('  [4] Lottery           - 1000 winners, 500,000 pool, 100 min');
    console.log('  [5] Custom            - Enter your own values');
    console.log('');
}

const presets = {
    1: { winners: 20, pool: 5000, min: 50 },
    2: { winners: 100, pool: 25000, min: 100 },
    3: { winners: 500, pool: 100000, min: 50 },
    4: { winners: 1000, pool: 500000, min: 100 },
};

async function main() {
    console.log('');
    console.log('='.repeat(55));
    console.log('   POOL PAYOUT STRUCTURE - Interactive Demo');
    console.log('   Fair prize distribution using Zipf distribution');
    console.log('='.repeat(55));

    printPresets();

    const choice = await question('Select an option [1-5]: ');

    let winners, pool, minCoins;

    if (choice >= '1' && choice <= '4') {
        const preset = presets[parseInt(choice, 10)];
        winners = preset.winners;
        pool = preset.pool;
        minCoins = preset.min;
        console.log(`\nUsing preset: ${winners} winners, ${formatNumber(pool)} pool, ${minCoins} minimum`);
    } else {
        console.log('\nEnter custom values:');
        winners = parseInt(await question('  Number of winners: '), 10);
        pool = parseInt(await question('  Total prize pool: '), 10);
        minCoins = parseInt(await question('  Minimum prize per winner: '), 10);
    }

    // Validate inputs
    if (isNaN(winners) || winners < 4) {
        console.log('\nError: Number of winners must be at least 4');
        rl.close();
        return;
    }

    if (isNaN(pool) || pool <= 0) {
        console.log('\nError: Prize pool must be positive');
        rl.close();
        return;
    }

    if (isNaN(minCoins) || minCoins <= 0) {
        console.log('\nError: Minimum prize must be positive');
        rl.close();
        return;
    }

    if (pool <= winners * minCoins) {
        console.log('\nError: Prize pool must be greater than (winners * minimum prize)');
        console.log(`       Need at least ${formatNumber(winners * minCoins + 1)} for ${winners} winners with ${minCoins} minimum`);
        rl.close();
        return;
    }

    console.log('\nCalculating distribution...');

    try {
        const result = finalCoinDistribution(winners, pool, minCoins);
        const distribution = JSON.parse(result);
        printDistribution(distribution, winners, pool, minCoins);

        // Show JSON output option
        const showJson = await question('Show raw JSON output? [y/N]: ');
        if (showJson.toLowerCase() === 'y') {
            console.log('\nJSON Output:');
            console.log(JSON.stringify(distribution, null, 2));
        }
    } catch (error) {
        console.log(`\nError: ${error.message}`);
    }

    rl.close();
}

// Handle command line arguments for non-interactive mode
const args = process.argv.slice(2);
if (args.length === 3) {
    const [winners, pool, minCoins] = args.map(Number);

    if (isNaN(winners) || isNaN(pool) || isNaN(minCoins)) {
        console.log('Usage: pool-payout <winners> <pool> <minCoins>');
        console.log('Example: pool-payout 100 10000 50');
        process.exit(1);
    }

    try {
        const result = finalCoinDistribution(winners, pool, minCoins);
        const distribution = JSON.parse(result);
        printDistribution(distribution, winners, pool, minCoins);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
} else if (args.length === 0) {
    main();
} else {
    console.log('Usage: pool-payout [winners] [pool] [minCoins]');
    console.log('       Run without arguments for interactive mode');
    console.log('Example: pool-payout 100 10000 50');
    process.exit(1);
}
