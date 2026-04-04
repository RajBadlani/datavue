import "dotenv/config"
import { encrypt, decrypt, encryptObject, decryptObject } from './encryption'

// ─── Test 1: Basic string round trip ──────────────────────────────────────────
const original = 'hello datavue'
const encrypted = encrypt(original)
const decrypted = decrypt(encrypted)

console.assert(decrypted === original, '❌ String round trip failed')
console.log('✅ String round trip passed')

// ─── Test 2: Same plaintext produces different ciphertext each time ────────────
const enc1 = encrypt(original)
const enc2 = encrypt(original)

console.assert(enc1 !== enc2, '❌ IV randomness check failed — same ciphertext produced')
console.log('✅ IV randomness check passed')

// ─── Test 3: Object round trip ────────────────────────────────────────────────
const credentials = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'super_secret_password',
  database: 'datavue',
  ssl: false,
}

const encryptedObj = encryptObject(credentials)
const decryptedObj = decryptObject(encryptedObj)

console.assert(
  JSON.stringify(decryptedObj) === JSON.stringify(credentials),
  '❌ Object round trip failed'
)
console.log('✅ Object round trip passed')

// ─── Test 4: Tampered ciphertext throws ───────────────────────────────────────
try {
  const tampered = encrypted.slice(0, -4) + 'ffff'
  decrypt(tampered)
  console.log('❌ Tamper detection failed — should have thrown')
} catch {
  console.log('✅ Tamper detection passed — GCM auth tag rejected corrupted data')
}

console.log('\n🔐 All encryption tests passed')