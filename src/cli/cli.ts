import { Command } from 'commander';
import path from 'path';
import { loadConfig, createDefaultConfig } from '../core/config';
import { scanProject } from '../core/scanner';
import { generateReport } from '../core/reporter';
import { AdrCheckerOptions } from '../types';
import chalk from 'chalk';

// Package information
const packageJson = require('../../package.json');

/**
 * Create and configure the CLI program
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('adr-checker')
    .description('CLI tool to track and validate Architecture Decision Records (ADRs) in projects')
    .version(packageJson.version);

  program
    .command('scan')
    .description('Scan project for ADR references and validate against ADR documents')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('-a, --adr-dir <path>', 'Path to ADR documents directory')
    .option('-s, --source-dir <path>', 'Path to source code directory')
    .option('-o, --output <path>', 'Path to output report file')
    .option('-f, --format <format>', 'Output format (text, json, html)', 'text')
    .action(async (options) => {
      try {
        console.log(chalk.blue('🔍 Scanning project for ADR references...'));
        
        const config = await loadConfig(options as AdrCheckerOptions);
        const result = await scanProject(config);
        
        const format = options.format as 'text' | 'json' | 'html';
        const report = await generateReport(result, format, options.output);
        
        if (!options.output) {
          console.log(report);
        }
        
        const issueCount = result.issues.length;
        if (issueCount > 0) {
          console.log(chalk.yellow(`Found ${issueCount} issues. See report for details.`));
          process.exit(1);
        } else {
          console.log(chalk.green('✅ No issues found!'));
          process.exit(0);
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  program
    .command('init')
    .description('Initialize a new ADR checker configuration file')
    .option('-p, --path <path>', 'Path to create configuration file', '.adr-checker.json')
    .action(async (options) => {
      try {
        await createDefaultConfig(options.path);
        console.log(chalk.green(`✅ Configuration file created at ${options.path}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  program
    .command('validate-docs')
    .description('Validate ADR documents for common issues')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('-a, --adr-dir <path>', 'Path to ADR documents directory')
    .option('-o, --output <path>', 'Path to output report file')
    .option('-f, --format <format>', 'Output format (text, json, html)', 'text')
    .action(async (options) => {
      try {
        console.log(chalk.blue('📝 Validating ADR documents...'));
        
        const config = await loadConfig(options as AdrCheckerOptions);
        const result = await scanProject(config);
        
        // Filter only document-related issues
        const docIssues = result.issues.filter(issue => 
          ['missing_metadata', 'broken_link', 'outdated_decision'].includes(issue.type)
        );
        
        // Create a new result with only document issues
        const docResult = {
          references: result.references,
          documents: result.documents,
          issues: docIssues,
        };
        
        const format = options.format as 'text' | 'json' | 'html';
        const report = await generateReport(docResult, format, options.output);
        
        if (!options.output) {
          console.log(report);
        }
        
        const issueCount = docIssues.length;
        if (issueCount > 0) {
          console.log(chalk.yellow(`Found ${issueCount} issues in ADR documents. See report for details.`));
          process.exit(1);
        } else {
          console.log(chalk.green('✅ No issues found in ADR documents!'));
          process.exit(0);
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  return program;
}
