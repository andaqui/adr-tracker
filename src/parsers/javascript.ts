import { AdrReference } from '../types';

/**
 * Parse a JavaScript/TypeScript file for ADR references
 */
export async function parseJavaScriptFile(filePath: string, content: string): Promise<AdrReference[]> {
  const references: AdrReference[] = [];
  const lines = content.split('\n');
  
  // Regular expressions for different comment styles
  const patterns = [
    // Single line comment: // ADR-0001
    /\/\/\s*ADR-(\d+)/,
    // Multi-line comment: /* ADR-0001 */
    /\/\*\s*ADR-(\d+)\s*\*\//,
    // JSDoc style: * @adr ADR-0001
    /\*\s*@adr\s*ADR-(\d+)/,
  ];
  
  lines.forEach((line, lineIndex) => {
    patterns.forEach(pattern => {
      const match = line.match(pattern);
      if (match) {
        const id = match[1].padStart(4, '0');
        const column = match.index || 0;
        
        references.push({
          id: `ADR-${id}`,
          file: filePath,
          line: lineIndex + 1,
          column,
          commentType: pattern.toString(),
        });
      }
    });
  });
  
  return references;
}
