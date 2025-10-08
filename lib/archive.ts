import { readFile, writeFile } from 'fs/promises';
import { signArchive } from './cryptography';

/**
 * Interface for a file to be included in an archive
 */
export interface ArchiveFile {
  path: string;
  content: Buffer | null;
}

/**
 * Interface for archive metadata
 */
export interface ArchiveMetadata {
  unitId?: string;
  timestamp?: string;
  version?: string;
  [key: string]: any;
}

/**
 * Result of creating an archive
 */
export interface ArchiveResult {
  archiveBuffer: Buffer;
  signature: string;
  metadata: ArchiveMetadata;
}

/**
 * Creates an archive bundle from files with metadata and signs it
 * 
 * @param files - Files to include in the archive
 * @param metadata - Metadata to attach to the archive
 * @returns Promise resolving to archive buffer, signature and metadata
 */
export async function createArchive(
  files: ArchiveFile[], 
  metadata: ArchiveMetadata
): Promise<ArchiveResult> {
  // Validate inputs
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('At least one file must be provided');
  }

  // Process files
  const processedFiles: Record<string, string> = {};
  
  for (const file of files) {
    if (!file.content) {
      throw new Error('Failed to read file content');
    }
    
    processedFiles[file.path] = file.content.toString('base64');
  }

  // Create archive structure
  const archive = {
    files: processedFiles,
    metadata: JSON.stringify(metadata),
    createdAt: new Date().toISOString()
  };

  // Convert to buffer
  const archiveBuffer = Buffer.from(JSON.stringify(archive));

  // Sign the archive
  const signature = await signArchive(archiveBuffer);

  return {
    archiveBuffer,
    signature,
    metadata
  };
}

/**
 * Verifies the signature of an archive
 * 
 * @param archiveBuffer - Archive buffer to verify
 * @param signature - Signature to verify against
 * @returns Promise resolving to boolean indicating whether signature is valid
 */
export async function verifyArchiveSignature(
  archiveBuffer: Buffer,
  signature: string
): Promise<boolean> {
  try {
    const expectedSignature = await signArchive(archiveBuffer);
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying archive signature:', error);
    return false;
  }
}

/**
 * Extracts metadata from an archive
 * 
 * @param archiveBuffer - Archive buffer to extract metadata from
 * @returns Promise resolving to extracted metadata
 */
export async function extractArchiveMetadata(
  archiveBuffer: Buffer
): Promise<ArchiveMetadata> {
  try {
    const archive = JSON.parse(archiveBuffer.toString());
    
    if (!archive.metadata) {
      throw new Error('Archive does not contain metadata');
    }
    
    return JSON.parse(archive.metadata);
  } catch (error) {
    throw new Error(`Failed to parse archive metadata: ${(error as Error).message}`);
  }
}

/**
 * Saves an archive to disk
 * 
 * @param archiveResult - Archive result containing buffer and signature
 * @param outputPath - Path to save archive to
 * @returns Promise resolving when archive is saved
 */
export async function saveArchive(
  archiveResult: ArchiveResult,
  outputPath: string
): Promise<void> {
  try {
    // Write archive file
    await writeFile(outputPath, archiveResult.archiveBuffer.toString('binary'), 'binary');
    
    // Write signature file
    await writeFile(`${outputPath}.sig`, archiveResult.signature);
    
    // Write metadata file (for easy reference)
    await writeFile(
      `${outputPath}.meta.json`, 
      JSON.stringify(archiveResult.metadata, null, 2)
    );
  } catch (error) {
    throw new Error(`Failed to save archive: ${(error as Error).message}`);
  }
}

/**
 * Loads an archive from disk
 * 
 * @param archivePath - Path to archive file
 * @param signaturePath - Path to signature file (defaults to archivePath + .sig)
 * @returns Promise resolving to loaded archive result
 */
export async function loadArchive(
  archivePath: string,
  signaturePath?: string
): Promise<ArchiveResult> {
  try {
    // Read archive file
    const archiveBuffer = await readFile(archivePath);
    
    // Read signature file
    const signature = await readFile(
      signaturePath || `${archivePath}.sig`, 
      'utf8'
    );
    
    // Extract metadata
    const metadata = await extractArchiveMetadata(archiveBuffer);
    
    return {
      archiveBuffer,
      signature,
      metadata
    };
  } catch (error) {
    throw new Error(`Failed to load archive: ${(error as Error).message}`);
  }
}