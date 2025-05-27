/**
 * Types for ADR Checker
 */

export interface AdrReference {
  id: string;
  file: string;
  line: number;
  column: number;
  commentType: string;
}

export interface AdrDocument {
  id: string;
  title: string;
  path: string;
  status: string;
  date?: string;
  tags?: string[];
  content: string;
  references: AdrReference[];
}

export interface AdrScanResult {
  references: AdrReference[];
  documents: AdrDocument[];
  issues: AdrIssue[];
}

export interface AdrIssue {
  type: AdrIssueType;
  message: string;
  file?: string;
  line?: number;
  adrId?: string;
}

export enum AdrIssueType {
  MISSING_DOCUMENT = 'missing_document',
  UNUSED_DOCUMENT = 'unused_document',
  CONFLICTING_REFERENCE = 'conflicting_reference',
  BROKEN_LINK = 'broken_link',
  MISSING_METADATA = 'missing_metadata',
  OUTDATED_DECISION = 'outdated_decision',
}

export interface LanguageParser {
  name: string;
  extensions: string[];
  parseFile(filePath: string, content: string): Promise<AdrReference[]>;
}

export interface AdrConfig {
  adrDir: string;
  sourceDir: string;
  languages: {
    [key: string]: {
      extensions: string[];
      commentPatterns: string[];
    };
  };
  outputFormat: 'text' | 'json' | 'html';
  ignorePatterns: string[];
}

export interface AdrCheckerOptions {
  config?: string;
  adrDir?: string;
  sourceDir?: string;
  outputFormat?: 'text' | 'json' | 'html';
}
