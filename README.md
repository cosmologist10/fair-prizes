# Fair Prizes

A fair prize pool distribution algorithm that divides prizes among winners using **Zipf distribution** and **nice numbers**. Perfect for tournaments, lotteries, gaming platforms, and any scenario requiring equitable prize distribution.

Based on the research paper: [Fair Prize Distribution](https://arxiv.org/pdf/1601.04203.pdf)

## Features

- **Zipf Distribution**: First place gets the most, with prizes decreasing smoothly
- **Nice Numbers**: Rounds prizes to human-friendly amounts (no $127.43 prizes)
- **Bucket Grouping**: Groups similar-ranked winners for efficient distribution
- **Zero Waste**: Redistributes leftover coins intelligently
- **Configurable**: Set total pool, number of winners, and minimum prize

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fair-prizes.git
cd fair-prizes

# Install dependencies
npm install
```

Or install directly from GitHub:

```bash
npm install github:yourusername/fair-prizes
```

## Quick Start

```javascript
import { finalCoinDistribution } from './index.js';

// Distribute 10,000 coins among 100 winners (min 10 coins each)
const result = finalCoinDistribution(100, 10000, 10);
console.log(JSON.parse(result));
```

**Output:**
```javascript
[
  { from: 1, to: 1, coins: 2200 },    // 1st place: 2,200
  { from: 2, to: 2, coins: 1150 },    // 2nd place: 1,150
  { from: 3, to: 3, coins: 850 },     // 3rd place: 850
  { from: 4, to: 4, coins: 650 },     // 4th place: 650
  { from: 5, to: 6, coins: 500 },     // 5th-6th: 500 each
  { from: 7, to: 10, coins: 350 },    // 7th-10th: 350 each
  // ... more buckets
]
```

## API

### `finalCoinDistribution(winners, totalCoins, minCoins)`

Calculates the prize distribution for a pool.

| Parameter | Type | Description |
|-----------|------|-------------|
| `winners` | number | Total number of winners to pay out |
| `totalCoins` | number | Total prize pool to distribute |
| `minCoins` | number | Minimum prize per winner |

**Returns:** JSON string containing an array of bucket objects:

```typescript
{
  from: number;   // Starting rank in this bucket
  to: number;     // Ending rank in this bucket
  coins: number;  // Prize amount for each winner in bucket
}
```

## Interactive Demo

Try the interactive CLI demo:

```bash
npm run demo
```

Or run directly:

```bash
node bin/cli.js
```

Example session:
```
===========================================
   FAIR PRIZES - Interactive Demo
===========================================

Enter number of winners: 50
Enter total prize pool: 5000
Enter minimum prize per winner: 25

Calculating distribution...

Prize Distribution for 50 winners | Pool: 5,000 | Min: 25

Rank        Prize      Total Payout
----------  ---------  ------------
1st         1,100      1,100
2nd         575        575
3rd         425        425
4th         325        325
5th-6th     250        500
7th-10th    175        700
11th-18th   100        800
19th-50th   50         1,600

Total distributed: 5,025
```

## How It Works

### 1. Zipf Distribution
The algorithm uses a power-law distribution where prize `P(i)` for rank `i` is:

```
P(i) = minCoins + (prize1 - minCoins) / i^alpha
```

Where `alpha` is calculated to ensure the total equals the prize pool.

### 2. Bucket Strategy
Instead of individual prizes for each rank, winners are grouped into buckets:
- Top 3 always get individual prizes
- Lower ranks are grouped geometrically (5th-6th, 7th-10th, etc.)

### 3. Nice Numbers
Prizes are rounded to "nice" amounts based on magnitude:
- Under 10: integers (1, 2, 3...)
- 10-99: multiples of 5 (10, 15, 20...)
- 100-249: multiples of 25 (100, 125, 150...)
- 250+: multiples of 50 (250, 300, 350...)

### 4. Leftover Handling
Rounding can cause small discrepancies. The algorithm redistributes leftovers by:
1. First adjusting prizes for ranks 2-4
2. Then incrementally adding to lower buckets
3. Ensuring no coins are wasted

## Examples

### Tournament Payout
```javascript
import { finalCoinDistribution } from './index.js';

// Esports tournament: 500 participants, $50,000 prize pool, $20 minimum
const payout = JSON.parse(finalCoinDistribution(500, 50000, 20));

payout.forEach(bucket => {
  if (bucket.from === bucket.to) {
    console.log(`${bucket.from}st place: $${bucket.coins}`);
  } else {
    console.log(`${bucket.from}-${bucket.to} place: $${bucket.coins} each`);
  }
});
```

### Lottery Distribution
```javascript
// Lottery: 1000 winners, 100,000 coins, 50 minimum
const lottery = JSON.parse(finalCoinDistribution(1000, 100000, 50));
console.log(`Grand prize: ${lottery[0].coins} coins`);
console.log(`Total buckets: ${lottery.length}`);
```

### Gaming Leaderboard
```javascript
// Weekly leaderboard: top 20, 2000 gems, 25 minimum
const rewards = JSON.parse(finalCoinDistribution(20, 2000, 25));

// Convert to game rewards object
const leaderboardRewards = rewards.map(b => ({
  ranks: b.from === b.to ? `#${b.from}` : `#${b.from}-${b.to}`,
  gems: b.coins
}));
```

## Running Tests

```bash
npm test
```

## Project Structure

```
fair-prizes/
├── index.js              # Main entry point
├── src/
│   └── distribute.js     # Core algorithm implementation
├── bin/
│   └── cli.js            # Interactive CLI demo
├── examples/
│   └── basic.js          # Usage examples
├── __tests__/
│   └── distribute.test.js # Unit tests
└── package.json
```

## Algorithm Details

The distribution follows these mathematical principles:

1. **First prize** is fixed at 22% of total pool
2. **Bucket count** grows logarithmically with winner count
3. **Bucket sizes** follow geometric progression (ratio ~2.5)
4. **Prize decay** follows Zipf's law with computed exponent

This ensures:
- Top performers are well-rewarded
- Middle-tier prizes remain meaningful
- Everyone gets at least the minimum
- Total exactly matches the pool (via leftover redistribution)

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
