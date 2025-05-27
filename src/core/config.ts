import fs from 'fs/promises';
import path from 'path';
import { AdrConfig, AdrCheckerOptions } from '../types';

/**
 * Default configuration for ADR Checker
 */
export const DEFAULT_CONFIG: AdrConfig = {
  adrDir: 'docs/adr',
  sourceDir: 'src',
  languages: {
    javascript: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      commentPatterns: [
        // Single line comment
        '// ADR-\\d+',
        // Multi-line comment
        '/\\* ADR-\\d+ \\*/',
        // JSDoc style
        '\\* @adr ADR-\\d+',
      ],
    },
  },
  outputFormat: 'text',
  ignorePatterns: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
};

/**
 * Load configuration from a file or use defaults
 */
export async function loadConfig(options: AdrCheckerOptions): Promise<AdrConfig> {
  let config = { ...DEFAULT_CONFIG };
  
  // If config file is specified, load it
  if (options.config) {
    try {
      const configPath = path.resolve(process.cwd(), options.config);
      const fileContent = await fs.readFile(configPath, 'utf-8');
      const fileConfig = JSON.parse(fileContent);
      config = { ...config, ...fileConfig };
    } catch (error) {
      console.error(`Error loading config file: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Using default configuration');
    }
  }
  
  // Override with command line options
  if (options.adrDir) {
    config.adrDir = options.adrDir;
  }
  
  if (options.sourceDir) {
    config.sourceDir = options.sourceDir;
  }
  
  if (options.outputFormat) {
    config.outputFormat = options.outputFormat;
  }
  
  return config;
}

/**
 * Create a default configuration file
 */
export async function createDefaultConfig(filePath: string): Promise<void> {
  const configPath = path.resolve(process.cwd(), filePath);
  const configContent = JSON.stringify(DEFAULT_CONFIG, null, 2);
  
  try {
    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log(`Created default configuration at ${configPath}`);
  } catch (error) {
    console.error(`Error creating config file: ${error instanceof Error ? error.message : String(error)}`);
  }
}
