import { describe, it, expect } from 'vitest';
import { scanProject } from '../core/scanner';
import { AdrConfig, AdrIssueType } from '../types';
import path from 'path';

describe('ADR Scanner', () => {
  const testConfig: AdrConfig = {
    adrDir: path.resolve(__dirname, '../../docs/adr'),
    sourceDir: path.resolve(__dirname, '../../src/example'),
    languages: {
      javascript: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        commentPatterns: [
          '// ADR-\\d+',
          '/\\* ADR-\\d+ \\*/',
          '\\* @adr ADR-\\d+',
        ],
      },
    },
    outputFormat: 'text',
    ignorePatterns: ['node_modules/**', 'dist/**'],
  };

  it('should find ADR references in source code', async () => {
    const result = await scanProject(testConfig);
    
    // Should find references to ADR-0001, ADR-0002, and ADR-0003
    expect(result.references.length).toBeGreaterThan(0);
    
    // Check if we found specific ADRs
    const adrIds = result.references.map(ref => ref.id);
    expect(adrIds).toContain('ADR-0001');
    expect(adrIds).toContain('ADR-0002');
    expect(adrIds).toContain('ADR-0003');
  });

  it('should detect missing ADR documents', async () => {
    const result = await scanProject(testConfig);
    
    // Should detect that ADR-0003 is missing
    const missingDocs = result.issues.filter(
      issue => issue.type === AdrIssueType.MISSING_DOCUMENT
    );
    
    expect(missingDocs.length).toBeGreaterThan(0);
    expect(missingDocs.some(issue => issue.adrId === 'ADR-0003')).toBe(true);
  });
});
