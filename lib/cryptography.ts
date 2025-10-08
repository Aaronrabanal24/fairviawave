import crypto from 'crypto';

/**
 * Signs an archive buffer using HMAC SHA-256
 * 
 * In a real-world implementation, this would use a proper key management system
 * and likely asymmetric cryptography. For this demo, we use a simple HMAC with a fixed key.
 * 
 * @param archiveBuffer - Buffer to sign
 * @returns Promise resolving to signature string
 */
export async function signArchive(archiveBuffer: Buffer): Promise<string> {
  // In production, this key would be loaded from a secure key management system
  const signingKey = process.env.ARCHIVE_SIGNING_KEY || 'fairvia-demo-signing-key-2025';
  
  const hmac = crypto.createHmac('sha256', signingKey);
  hmac.update(archiveBuffer.toString('binary'), 'binary');
  return hmac.digest('hex');
}

/**
 * Verifies a signature against an archive buffer
 * 
 * @param archiveBuffer - Buffer that was signed
 * @param signature - Signature to verify
 * @returns Promise resolving to boolean indicating whether signature is valid
 */
export async function verifySignature(
  archiveBuffer: Buffer, 
  signature: string
): Promise<boolean> {
  try {
    const computedSignature = await signArchive(archiveBuffer);
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Generates a SHA-256 hash for a buffer
 * 
 * @param buffer - Buffer to hash
 * @returns Hash string (hex encoded)
 */
export function generateHash(buffer: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(buffer.toString('binary'), 'binary');
  return hash.digest('hex');
}

/**
 * Creates a trust badge object with verification details
 * 
 * @param unitId - ID of the unit
 * @param archiveHash - Hash of the archive
 * @param verificationUrl - URL for verifying the badge
 * @returns Trust badge object
 */
export function createTrustBadge(
  unitId: string,
  archiveHash: string,
  verificationUrl: string
): object {
  return {
    type: 'FairviaVerified',
    version: '1.0',
    unitId,
    archiveHash,
    issuedAt: new Date().toISOString(),
    verificationUrl: `${verificationUrl}?hash=${archiveHash}&unit=${unitId}`
  };
}