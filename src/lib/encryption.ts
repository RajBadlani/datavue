import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits — GCM standard
const KEY_LENGTH = 32; // 256 bits — AES-256

function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) throw new Error("ENCRYPTION_KEY env is not set");
  const keyBuffer = Buffer.from(keyHex, "hex");
  if (keyBuffer.length !== KEY_LENGTH)
    throw new Error(
      `ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters). Got ${keyBuffer.length} bytes.`,
    );

  return keyBuffer;
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Store as iv:authTag:ciphertext — all hex
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

// ─── Decrypt ──────────────────────────────────────────────────────────────────
// Accepts the iv:authTag:ciphertext format produced by encrypt()
export function decrypt(encryptedString: string): string {
  const key = getEncryptionKey();

  const parts = encryptedString.split(":");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted string format. Expected iv:authTag:ciphertext",
    );
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// ─── Encrypt JSON object directly ─────────────────────────────────────────────
// Convenience wrapper — most callers pass a credentials object, not a string
export function encryptObject(obj: Record<string, unknown>): string {
  return encrypt(JSON.stringify(obj));
}

// ─── Decrypt back to typed object ─────────────────────────────────────────────
export function decryptObject<T = Record<string, unknown>>(
  encryptedString: string,
): T {
  return JSON.parse(decrypt(encryptedString)) as T;
}
