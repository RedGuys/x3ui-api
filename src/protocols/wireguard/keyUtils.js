/**
 * WireGuard key utilities
 * Pure JavaScript implementation of Curve25519 for WireGuard key generation
 */

const crypto = require('crypto');

/**
 * Generate a new WireGuard private key
 * @returns {string} Base64-encoded private key
 */
function generatePrivateKey() {
    const key = crypto.randomBytes(32);
    return key.toString('base64');
}

/**
 * Generate a new WireGuard pre-shared key
 * @returns {string} Base64-encoded pre-shared key
 */
function generatePresharedKey() {
    const key = crypto.randomBytes(32);
    return key.toString('base64');
}

/**
 * Derive a public key from a private key using Curve25519
 * @param {string} privateKeyBase64 Base64-encoded private key
 * @returns {string} Base64-encoded public key
 */
function derivePublicKey(privateKeyBase64) {
    const privateKey = Buffer.from(privateKeyBase64, 'base64');
    const publicKey = crypto.createPublicKey({
        key: crypto.createPrivateKey({
            key: Buffer.concat([
                Buffer.from('302e020100300506032b656e04220420', 'hex'),
                privateKey
            ]),
            format: 'der',
            type: 'pkcs8'
        }),
        format: 'der',
        type: 'spki'
    }).export({ format: 'der', type: 'spki' });

    // Extract the raw public key bytes
    return publicKey.slice(-32).toString('base64');
}

/**
 * Generate a new WireGuard key pair
 * @returns {Object} Object containing privateKey and publicKey in base64 format
 */
function generateKeyPair() {
    const privateKey = generatePrivateKey();
    const publicKey = derivePublicKey(privateKey);
    return { privateKey, publicKey };
}

/**
 * Validate a WireGuard private key
 * @param {string} privateKeyBase64 Base64-encoded private key
 * @returns {boolean} True if valid, false otherwise
 */
function isValidPrivateKey(privateKeyBase64) {
    try {
        const buf = Buffer.from(privateKeyBase64, 'base64');
        return buf.length === 32;
    } catch {
        return false;
    }
}

/**
 * Validate a WireGuard public key
 * @param {string} publicKeyBase64 Base64-encoded public key
 * @returns {boolean} True if valid, false otherwise
 */
function isValidPublicKey(publicKeyBase64) {
    try {
        const buf = Buffer.from(publicKeyBase64, 'base64');
        return buf.length === 32;
    } catch {
        return false;
    }
}

module.exports = {
    generatePrivateKey,
    generatePresharedKey,
    derivePublicKey,
    generateKeyPair,
    isValidPrivateKey,
    isValidPublicKey
};
