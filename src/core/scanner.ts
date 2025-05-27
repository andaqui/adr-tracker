import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { AdrConfig, AdrReference, AdrDocument, AdrScanResult, AdrIssue, AdrIssueType } from '../types';
import { parseJavaScriptFile } from '../parsers/javascript';
import { parseAdrDocument } from '../parsers/adr';

/**
 * Scan for ADR references in source code and validate against ADR documents
 */
export async function scanProject(config: AdrConfig): Promise<AdrScanResult> {
  const result: AdrScanResult = {
    references: [],
    documents: [],
    issues: [],
  };

  // Scan for ADR documents
  const documents = await scanAdrDocuments(config);
  result.documents = documents;

  // Scan for ADR references in source code
  const references = await scanSourceFiles(config);
  result.references = references;

  // Validate references against documents
  result.issues = validateReferences(references, documents);

  return result;
}

/**
 * Scan for ADR documents in the ADR directory
 */
async function scanAdrDocuments(config: AdrConfig): Promise<AdrDocument[]> {
  const adrDir = path.resolve(process.cwd(), config.adrDir);
  const adrFiles = await glob(`${adrDir}/**/*.md`);
  
  const documents: AdrDocument[] = [];
  
  for (const filePath of adrFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const document = await parseAdrDocument(filePath, content);
      documents.push(document);
    } catch (error) {
      console.error(`Error parsing ADR document ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return documents;
}

/**
 * Scan for ADR references in source code
 */
async function scanSourceFiles(config: AdrConfig): Promise<AdrReference[]> {
  const sourceDir = path.resolve(process.cwd(), config.sourceDir);
  const references: AdrReference[] = [];
  
  // Build a pattern for all supported file extensions
  const extensions = Object.values(config.languages)
    .flatMap(lang => lang.extensions)
    .map(ext => ext.startsWith('.') ? ext.substring(1) : ext);
  
  const extensionPattern = extensions.length > 0 ? `*.{${extensions.join(',')}}` : '*.{js,jsx,ts,tsx}';
  
  // Build ignore patterns
  const ignorePatterns = config.ignorePatterns || [];
  
  // Find all matching files
  const files = await glob(`${sourceDir}/**/${extensionPattern}`, {
    ignore: ignorePatterns,
  });
  
  for (const filePath of files) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const extension = path.extname(filePath);
      
      // Choose the appropriate parser based on file extension
      let fileReferences: AdrReference[] = [];
      
      if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
        fileReferences = await parseJavaScriptFile(filePath, content);
      }
      // Add more language parsers here as they are implemented
      
      references.push(...fileReferences);
    } catch (error) {
      console.error(`Error parsing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return references;
}

/**
 * Validate ADR references against ADR documents
 */
function validateReferences(references: AdrReference[], documents: AdrDocument[]): AdrIssue[] {
  const issues: AdrIssue[] = [];
  
  // Create a map of document IDs for quick lookup
  const documentMap = new Map<string, AdrDocument>();
  documents.forEach(doc => documentMap.set(doc.id, doc));
  
  // Check for missing documents
  const referencedIds = new Set<string>();
  references.forEach(ref => {
    referencedIds.add(ref.id);
    
    if (!documentMap.has(ref.id)) {
      issues.push({
        type: AdrIssueType.MISSING_DOCUMENT,
        message: `Referenced ADR ${ref.id} does not exist`,
        file: ref.file,
        line: ref.line,
        adrId: ref.id,
      });
    }
  });
  
  // Check for unused documents
  documents.forEach(doc => {
    if (!referencedIds.has(doc.id)) {
      issues.push({
        type: AdrIssueType.UNUSED_DOCUMENT,
        message: `ADR ${doc.id} is not referenced in any source file`,
        file: doc.path,
        adrId: doc.id,
      });
    }
  });
  
  // Check for conflicting references (multiple ADRs on the same line)
  const lineMap = new Map<string, string[]>();
  references.forEach(ref => {
    const key = `${ref.file}:${ref.line}`;
    const ids = lineMap.get(key) || [];
    ids.push(ref.id);
    lineMap.set(key, ids);
  });
  
  lineMap.forEach((ids, key) => {
    if (ids.length > 1) {
      const [file, line] = key.split(':');
      issues.push({
        type: AdrIssueType.CONFLICTING_REFERENCE,
        message: `Multiple ADRs referenced on the same line: ${ids.join(', ')}`,
        file,
        line: parseInt(line, 10),
      });
    }
  });
  
  return issues;
}
