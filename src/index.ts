/**
 * ADR Checker - A tool to track and validate Architecture Decision Records
 */

// Export core functionality
export { scanProject } from './core/scanner';
export { loadConfig, createDefaultConfig } from './core/config';
export { generateReport } from './core/reporter';

// Export types
export * from './types';

// Export parsers
export { parseJavaScriptFile } from './parsers/javascript';
export { parseAdrDocument, validateAdrDocument } from './parsers/adr';

// Export CLI (for programmatic usage)
export { createProgram } from './cli/cli';
