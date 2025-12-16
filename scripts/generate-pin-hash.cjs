/**
 * Generate SHA-256 hash for a PIN
 *
 * Usage:
 *   node scripts/generate-pin-hash.cjs YOUR_PIN
 *
 * Example:
 *   node scripts/generate-pin-hash.cjs 7326
 *
 * Then add the output to your .env file:
 *   VITE_VOLUNTEER_PIN_HASH=your_hash_here
 */

const crypto = require('crypto');

const pin = process.argv[2];

if (!pin) {
  console.log('Usage: node scripts/generate-pin-hash.cjs YOUR_PIN');
  console.log('Example: node scripts/generate-pin-hash.cjs 7326');
  process.exit(1);
}

if (!/^\d{4}$/.test(pin)) {
  console.log('Error: PIN must be exactly 4 digits');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(pin).digest('hex');

console.log('\n========================================');
console.log('PIN Hash Generator');
console.log('========================================\n');
console.log(`PIN: ${pin}`);
console.log(`Hash: ${hash}\n`);
console.log('Add this to your .env file for production:\n');
console.log(`VITE_VOLUNTEER_PIN_HASH=${hash}`);
console.log('\n(Remove VITE_VOLUNTEER_PIN when using the hash)\n');
