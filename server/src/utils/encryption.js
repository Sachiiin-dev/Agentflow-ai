const crypto = require('crypto');
const config = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte Buffer key from the config key
 */
const getKeyBuffer = () => {
  const rawKey = config.encryption.key;
  if (rawKey.length === 64) {
    return Buffer.from(rawKey, 'hex');
  }
  // Hash to 32 bytes if string is not exact 64 hex chars
  return crypto.createHash('sha256').update(rawKey).digest();
};

/**
 * Encrypts a string or object using AES-256-GCM.
 * Output format: hex string composed of iv:tag:ciphertext
 */
const encrypt = (data) => {
  if (data === null || data === undefined) return null;
  const plaintext = typeof data === 'object' ? JSON.stringify(data) : String(data);
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts an AES-256-GCM encrypted payload.
 */
const decrypt = (encryptedPayload) => {
  if (!encryptedPayload) return null;
  
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }
    
    const [ivHex, tagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Attempt parsing JSON if object was serialized
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error('[Encryption] Decryption failed:', err.message);
    throw new Error('Failed to decrypt sensitive credential');
  }
};

module.exports = {
  encrypt,
  decrypt,
};
