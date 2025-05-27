#!/usr/bin/env node

import { createProgram } from './cli';

// Create the CLI program
const program = createProgram();

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
