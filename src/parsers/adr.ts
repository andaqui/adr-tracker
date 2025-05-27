import path from 'path';
import MarkdownIt from 'markdown-it';
import { AdrDocument } from '../types';

const md = new MarkdownIt();

/**
 * Parse an ADR markdown document
 */
export async function parseAdrDocument(filePath: string, content: string): Promise<AdrDocument> {
  // Extract ADR ID from filename (e.g., 0001-use-ngrx.md -> ADR-0001)
  const filename = path.basename(filePath);
  const idMatch = filename.match(/^(\d+)-/);
  const id = idMatch ? `ADR-${idMatch[1].padStart(4, '0')}` : `ADR-0000`;
  
  // Parse markdown to extract title, status, and other metadata
  const lines = content.split('\n');
  let title = '';
  let status = 'unknown';
  let date = '';
  const tags: string[] = [];
  
  // Look for title (first # heading)
  const titleLine = lines.find(line => line.startsWith('# '));
  if (titleLine) {
    title = titleLine.substring(2).trim();
  }
  
  // Look for status
  const statusLine = lines.find(line => line.toLowerCase().includes('status:'));
  if (statusLine) {
    const statusMatch = statusLine.match(/status:\s*([a-z\s]+)/i);
    if (statusMatch) {
      status = statusMatch[1].trim().toLowerCase();
    }
  }
  
  // Look for date
  const dateLine = lines.find(line => line.toLowerCase().includes('date:'));
  if (dateLine) {
    const dateMatch = dateLine.match(/date:\s*(.+)/i);
    if (dateMatch) {
      date = dateMatch[1].trim();
    }
  }
  
  // Look for tags
  const tagLine = lines.find(line => line.toLowerCase().includes('tags:'));
  if (tagLine) {
    const tagMatch = tagLine.match(/tags:\s*(.+)/i);
    if (tagMatch) {
      const tagString = tagMatch[1].trim();
      tags.push(...tagString.split(',').map(tag => tag.trim()));
    }
  }
  
  return {
    id,
    title,
    path: filePath,
    status,
    date,
    tags,
    content,
    references: [], // Will be populated later when cross-referencing
  };
}

/**
 * Validate an ADR document for common issues
 */
export function validateAdrDocument(document: AdrDocument): string[] {
  const issues: string[] = [];
  
  // Check for required fields
  if (!document.title) {
    issues.push(`Missing title in ${document.id}`);
  }
  
  if (document.status === 'unknown') {
    issues.push(`Missing status in ${document.id}`);
  }
  
  if (!document.date) {
    issues.push(`Missing date in ${document.id}`);
  }
  
  // Check for broken links in the content
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(document.content)) !== null) {
    const [, linkText, linkUrl] = match;
    
    // Check for relative links that might be broken
    if (!linkUrl.startsWith('http') && !linkUrl.startsWith('#')) {
      // This is a relative link, we could check if the file exists
      // For now, just add a warning
      issues.push(`Potential broken link in ${document.id}: ${linkText} -> ${linkUrl}`);
    }
  }
  
  return issues;
}
