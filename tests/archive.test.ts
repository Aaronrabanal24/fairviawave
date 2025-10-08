import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createArchive, verifyArchiveSignature, extractArchiveMetadata } from '../lib/archive';
import { signArchive } from '../lib/cryptography';

// Mock the dependencies
vi.mock('../lib/cryptography', () => ({
  signArchive: vi.fn().mockResolvedValue('mock-signature'),
  verifySignature: vi.fn().mockResolvedValue(true)
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue(Buffer.from('mock-file-content')),
  writeFile: vi.fn().mockResolvedValue(undefined)
}));

describe('Archive functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createArchive', () => {
    it('should bundle files into an archive with metadata and sign it', async () => {
      const mockFiles = [
        { path: 'file1.txt', content: Buffer.from('content1') },
        { path: 'file2.txt', content: Buffer.from('content2') }
      ];
      
      const mockMetadata = {
        unitId: 'unit-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const result = await createArchive(mockFiles, mockMetadata);
      
      // Verify the archive contains files, metadata, and signature
      expect(result).toHaveProperty('archiveBuffer');
      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('metadata');
      expect(signArchive).toHaveBeenCalledTimes(1);
      expect(result.metadata).toEqual(mockMetadata);
    });
    
    it('should throw an error when file content cannot be read', async () => {
      const mockFiles = [
        { path: 'missing.txt', content: null }
      ];
      
      await expect(createArchive(mockFiles, {}))
        .rejects
        .toThrow('Failed to read file content');
    });
  });
  
  describe('verifyArchiveSignature', () => {
    it('should verify the signature of an archive', async () => {
      const mockArchive = Buffer.from('mock-archive-content');
      const mockSignature = 'mock-signature';
      
      const result = await verifyArchiveSignature(mockArchive, mockSignature);
      
      expect(result).toBe(true);
    });
    
    it('should return false for invalid signatures', async () => {
      vi.mocked(signArchive).mockResolvedValueOnce('different-signature');
      
      const mockArchive = Buffer.from('mock-archive-content');
      const mockSignature = 'invalid-signature';
      
      const result = await verifyArchiveSignature(mockArchive, mockSignature);
      
      expect(result).toBe(false);
    });
  });
  
  describe('extractArchiveMetadata', () => {
    it('should extract metadata from an archive', async () => {
      const mockMetadata = {
        unitId: 'unit-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const mockArchive = {
        metadata: JSON.stringify(mockMetadata)
      };
      
      const result = await extractArchiveMetadata(Buffer.from(JSON.stringify(mockArchive)));
      
      expect(result).toEqual(mockMetadata);
    });
    
    it('should throw an error for malformed archive data', async () => {
      const invalidArchive = Buffer.from('invalid-json');
      
      await expect(extractArchiveMetadata(invalidArchive))
        .rejects
        .toThrow('Failed to parse archive metadata');
    });
  });
});