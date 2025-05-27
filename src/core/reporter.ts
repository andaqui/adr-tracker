import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { AdrScanResult, AdrIssueType } from '../types';

/**
 * Generate a report from scan results in the specified format
 */
export async function generateReport(
  result: AdrScanResult, 
  format: 'text' | 'json' | 'html' = 'text',
  outputPath?: string
): Promise<string> {
  let report = '';
  
  switch (format) {
    case 'json':
      report = generateJsonReport(result);
      break;
    case 'html':
      report = generateHtmlReport(result);
      break;
    case 'text':
    default:
      report = generateTextReport(result);
      break;
  }
  
  // If output path is provided, write the report to a file
  if (outputPath) {
    const fullPath = path.resolve(process.cwd(), outputPath);
    await fs.writeFile(fullPath, report, 'utf-8');
    console.log(`Report written to ${fullPath}`);
  }
  
  return report;
}

/**
 * Generate a text report with colored output
 */
function generateTextReport(result: AdrScanResult): string {
  const { references, documents, issues } = result;
  
  let report = '\n';
  
  // Summary section
  report += chalk.bold.blue('=== ADR Tracker Summary ===\n\n');
  report += `${chalk.green('✓')} Found ${chalk.bold(documents.length.toString())} ADR documents\n`;
  report += `${chalk.green('✓')} Found ${chalk.bold(references.length.toString())} ADR references in code\n`;
  report += `${chalk.yellow('!')} Detected ${chalk.bold(issues.length.toString())} issues\n\n`;
  
  // Issues section
  if (issues.length > 0) {
    report += chalk.bold.yellow('=== Issues ===\n\n');
    
    // Group issues by type
    const issuesByType = issues.reduce((acc, issue) => {
      const type = issue.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(issue);
      return acc;
    }, {} as Record<string, typeof issues>);
    
    // Report missing documents
    const missingDocs = issuesByType[AdrIssueType.MISSING_DOCUMENT] || [];
    if (missingDocs.length > 0) {
      report += chalk.bold.red(`Missing ADR Documents (${missingDocs.length}):\n`);
      missingDocs.forEach(issue => {
        report += `  ${chalk.red('✗')} ${issue.adrId} referenced in ${issue.file}:${issue.line}\n`;
      });
      report += '\n';
    }
    
    // Report unused documents
    const unusedDocs = issuesByType[AdrIssueType.UNUSED_DOCUMENT] || [];
    if (unusedDocs.length > 0) {
      report += chalk.bold.yellow(`Unused ADR Documents (${unusedDocs.length}):\n`);
      unusedDocs.forEach(issue => {
        report += `  ${chalk.yellow('!')} ${issue.adrId} is not referenced in any source file\n`;
      });
      report += '\n';
    }
    
    // Report conflicting references
    const conflictingRefs = issuesByType[AdrIssueType.CONFLICTING_REFERENCE] || [];
    if (conflictingRefs.length > 0) {
      report += chalk.bold.red(`Conflicting ADR References (${conflictingRefs.length}):\n`);
      conflictingRefs.forEach(issue => {
        report += `  ${chalk.red('✗')} Multiple ADRs referenced at ${issue.file}:${issue.line}: ${issue.message}\n`;
      });
      report += '\n';
    }
    
    // Report other issues
    const otherIssues = issues.filter(issue => 
      ![AdrIssueType.MISSING_DOCUMENT, AdrIssueType.UNUSED_DOCUMENT, AdrIssueType.CONFLICTING_REFERENCE].includes(issue.type as AdrIssueType)
    );
    
    if (otherIssues.length > 0) {
      report += chalk.bold.yellow(`Other Issues (${otherIssues.length}):\n`);
      otherIssues.forEach(issue => {
        report += `  ${chalk.yellow('!')} ${issue.message}${issue.file ? ` in ${issue.file}` : ''}${issue.line ? `:${issue.line}` : ''}\n`;
      });
      report += '\n';
    }
  } else {
    report += chalk.bold.green('No issues found! 🎉\n\n');
  }
  
  // ADR Documents section
  report += chalk.bold.blue('=== ADR Documents ===\n\n');
  documents.forEach(doc => {
    const refCount = references.filter(ref => ref.id === doc.id).length;
    const statusColor = doc.status === 'accepted' ? chalk.green : 
                        doc.status === 'rejected' ? chalk.red : 
                        doc.status === 'deprecated' ? chalk.yellow : 
                        chalk.blue;
    
    report += `${chalk.bold(doc.id)} - ${doc.title}\n`;
    report += `  Status: ${statusColor(doc.status)}\n`;
    if (doc.date) report += `  Date: ${doc.date}\n`;
    if (doc.tags && doc.tags.length > 0) report += `  Tags: ${doc.tags.join(', ')}\n`;
    report += `  References in code: ${refCount}\n`;
    report += `  Path: ${doc.path}\n\n`;
  });
  
  return report;
}

/**
 * Generate a JSON report
 */
function generateJsonReport(result: AdrScanResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Generate an HTML report
 */
function generateHtmlReport(result: AdrScanResult): string {
  const { references, documents, issues } = result;
  
  // Count issues by type
  const missingDocs = issues.filter(i => i.type === AdrIssueType.MISSING_DOCUMENT).length;
  const unusedDocs = issues.filter(i => i.type === AdrIssueType.UNUSED_DOCUMENT).length;
  const conflictingRefs = issues.filter(i => i.type === AdrIssueType.CONFLICTING_REFERENCE).length;
  const otherIssues = issues.filter(i => 
    ![AdrIssueType.MISSING_DOCUMENT, AdrIssueType.UNUSED_DOCUMENT, AdrIssueType.CONFLICTING_REFERENCE].includes(i.type as AdrIssueType)
  ).length;
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ADR Tracker Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .summary {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .issues {
      margin-bottom: 30px;
    }
    .issue-group {
      margin-bottom: 20px;
    }
    .issue {
      padding: 10px;
      border-left: 4px solid #ddd;
      margin-bottom: 10px;
    }
    .issue.error {
      border-left-color: #dc3545;
      background-color: rgba(220, 53, 69, 0.1);
    }
    .issue.warning {
      border-left-color: #ffc107;
      background-color: rgba(255, 193, 7, 0.1);
    }
    .adr-document {
      background-color: #f8f9fa;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 5px;
      border-left: 4px solid #0066cc;
    }
    .status {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.8em;
      font-weight: bold;
    }
    .status.accepted {
      background-color: #28a745;
      color: white;
    }
    .status.rejected {
      background-color: #dc3545;
      color: white;
    }
    .status.deprecated {
      background-color: #ffc107;
      color: black;
    }
    .status.proposed {
      background-color: #17a2b8;
      color: white;
    }
    .status.unknown {
      background-color: #6c757d;
      color: white;
    }
    .tag {
      display: inline-block;
      background-color: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.8em;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <h1>ADR Tracker Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Found <strong>${documents.length}</strong> ADR documents</p>
    <p>Found <strong>${references.length}</strong> ADR references in code</p>
    <p>Detected <strong>${issues.length}</strong> issues</p>
  </div>
  
  ${issues.length > 0 ? `
  <div class="issues">
    <h2>Issues</h2>
    
    ${missingDocs > 0 ? `
    <div class="issue-group">
      <h3>Missing ADR Documents (${missingDocs})</h3>
      ${issues.filter(i => i.type === AdrIssueType.MISSING_DOCUMENT).map(issue => `
        <div class="issue error">
          <p><strong>${issue.adrId}</strong> referenced in ${issue.file}:${issue.line}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${unusedDocs > 0 ? `
    <div class="issue-group">
      <h3>Unused ADR Documents (${unusedDocs})</h3>
      ${issues.filter(i => i.type === AdrIssueType.UNUSED_DOCUMENT).map(issue => `
        <div class="issue warning">
          <p><strong>${issue.adrId}</strong> is not referenced in any source file</p>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${conflictingRefs > 0 ? `
    <div class="issue-group">
      <h3>Conflicting ADR References (${conflictingRefs})</h3>
      ${issues.filter(i => i.type === AdrIssueType.CONFLICTING_REFERENCE).map(issue => `
        <div class="issue error">
          <p>Multiple ADRs referenced at ${issue.file}:${issue.line}: ${issue.message}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${otherIssues > 0 ? `
    <div class="issue-group">
      <h3>Other Issues (${otherIssues})</h3>
      ${issues.filter(i => 
        ![AdrIssueType.MISSING_DOCUMENT, AdrIssueType.UNUSED_DOCUMENT, AdrIssueType.CONFLICTING_REFERENCE].includes(i.type as AdrIssueType)
      ).map(issue => `
        <div class="issue warning">
          <p>${issue.message}${issue.file ? ` in ${issue.file}` : ''}${issue.line ? `:${issue.line}` : ''}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
  ` : `
  <div class="issues">
    <h2>Issues</h2>
    <p>No issues found! 🎉</p>
  </div>
  `}
  
  <div class="adr-documents">
    <h2>ADR Documents</h2>
    ${documents.map(doc => {
      const refCount = references.filter(ref => ref.id === doc.id).length;
      const statusClass = doc.status === 'accepted' ? 'accepted' : 
                         doc.status === 'rejected' ? 'rejected' : 
                         doc.status === 'deprecated' ? 'deprecated' : 
                         doc.status === 'proposed' ? 'proposed' : 'unknown';
      
      return `
      <div class="adr-document">
        <h3>${doc.id} - ${doc.title}</h3>
        <p>
          Status: <span class="status ${statusClass}">${doc.status}</span>
        </p>
        ${doc.date ? `<p>Date: ${doc.date}</p>` : ''}
        ${doc.tags && doc.tags.length > 0 ? `
        <p>
          Tags: ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
        </p>
        ` : ''}
        <p>References in code: ${refCount}</p>
        <p>Path: ${doc.path}</p>
      </div>
      `;
    }).join('')}
  </div>
</body>
</html>
`;
  
  return html;
}
