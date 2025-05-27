# ADR Tracker

A CLI tool to track and validate Architecture Decision Records (ADRs) in frontend and backend projects.

## Why ADR Tracker?

In agile development, teams frequently make architecture decisions that need to be documented and referenced. ADR Tracker bridges the gap between documentation and code by:

- **Connecting Documentation to Implementation**: Ensures architectural decisions are properly referenced in code
- **Preventing Documentation Drift**: Validates that code references match existing ADR documents
- **Supporting Agile Workflows**: Lightweight enough to fit into CI/CD pipelines and developer workflows
- **Improving Knowledge Transfer**: Makes it easier for new team members to understand why certain implementation choices were made
- **Enhancing Code Reviews**: Provides context for reviewers about architectural decisions behind code changes

## Features

- 🔍 **Scan Source Code**: Find ADR references in comments across multiple file types
- 📄 **Validate ADRs**: Cross-reference code comments with ADR markdown files
- 📚 **Document Analysis**: Check for broken links, missing metadata, or outdated decisions
- 📊 **Flexible Output**: Generate reports in text, JSON, or HTML formats
- 🔌 **Extensible Design**: Support for multiple languages through a pluggable parser system

## Installation

```bash
# Install globally
npm install -g adr-tracker

# Or use with npx
npx adr-tracker
```

## Usage

### Basic Scanning

```bash
# Scan the current project with default settings
adr-tracker scan

# Specify custom directories
adr-tracker scan --adr-dir docs/architecture/decisions --source-dir src

# Generate an HTML report
adr-tracker scan --format html --output adr-report.html
```

### Initialize Configuration

```bash
# Create a default configuration file
adr-tracker init

# Specify a custom path for the config file
adr-tracker init --path ./config/adr-config.json
```

### Validate ADR Documents

```bash
# Validate only the ADR documents
adr-tracker validate-docs
```

### UI Dashboard

The ADR Tracker includes a simple web dashboard to visualize reports:

1. Generate a JSON report:

   ```bash
   adr-tracker scan --format json --output adr-report.json
   ```

2. Start a web server in the ui directory:

   ```bash
   npx serve ui
   ```

3. Open http://localhost:3000 in your browser

4. Upload the JSON report file to view the dashboard

The dashboard provides:

- Summary statistics of ADRs and issues
- List of all issues categorized by type
- Complete ADR document details
- File explorer showing which files reference which ADRs
- Search and filter capabilities

## Configuration

Create a configuration file using `adr-tracker init` or manually create a JSON file:

```json
{
  "adrDir": "docs/adr",
  "sourceDir": "src",
  "languages": {
    "javascript": {
      "extensions": [".js", ".jsx", ".ts", ".tsx"],
      "commentPatterns": [
        "// ADR-\\d+",
        "/\\* ADR-\\d+ \\*/",
        "\\* @adr ADR-\\d+"
      ]
    }
  },
  "outputFormat": "text",
  "ignorePatterns": ["node_modules/**", "dist/**", "build/**", ".git/**"]
}
```

## ADR Format

ADR Tracker expects ADR files to follow a naming convention:

```
NNNN-title-with-dashes.md
```

Where `NNNN` is a zero-padded number (e.g., 0001, 0002).

ADR documents should contain:

- A title (first level heading)
- Status (e.g., "Status: Accepted")
- Date
- Optional tags

Example:

```markdown
# Use NgRx for State Management

Status: Accepted
Date: 2023-05-15
Tags: frontend, state, angular

## Context

...
```

### Example ADRs

The repository includes several example ADRs in the `docs/adr` directory:

- [0001-use-typescript-for-backend.md](docs/adr/0001-use-typescript-for-backend.md) - Basic example of using TypeScript
- [0002-react-for-frontend.md](docs/adr/0002-react-for-frontend.md) - Simple frontend framework decision
- [0003-order-cancellation-for-inventory-shortage.md](docs/adr/0003-order-cancellation-for-inventory-shortage.md) - Concise business process example for e-commerce order cancellations
- [0015-angular-ngrx-state-management.md](docs/adr/0015-angular-ngrx-state-management.md) - Moderately detailed example of Angular NgRx implementation
- [0023-microservice-authentication-strategy.md](docs/adr/0023-microservice-authentication-strategy.md) - Moderately detailed example of an authentication strategy

The examples range from simple decisions to highly detailed architectural patterns with specific implementation details, providing templates for different levels of complexity:

## Comment Format

ADR Tracker recognizes the following comment formats by default:

```javascript
// ADR-0001
/* ADR-0001 */
/**
 * @adr ADR-0001
 */
```

### Enhanced Comment Format (Optional)

While simple references work well, you can make ADR references more informative by including additional context:

```javascript
// ADR-0001: Use NgRx for State Management
```

```javascript
/**
 * @adr ADR-0001 - Use NgRx for State Management
 * This component implements the centralized store pattern.
 */
```

```typescript
/**
 * This authentication flow follows our security standards.
 * @see ADR-0002 "JWT-based Authentication"
 */
class AuthService {
  // ...
}
```

The additional context is optional but helps developers understand the architectural decision without having to look up the ADR document.

## Programmatic Usage

You can use ADR Tracker programmatically in various Node.js environments:

### In Local Scripts

Create custom validation scripts for your project:

```javascript
// validate-adrs.js
const { scanProject, loadConfig, generateReport } = require("adr-tracker");

async function checkAdrs() {
  const config = await loadConfig({ adrDir: "docs/decisions" });
  const result = await scanProject(config);
  const report = await generateReport(result, "json");
  console.log(report);

  // Exit with error code if issues found
  if (result.issues.length > 0) {
    process.exit(1);
  }
}

checkAdrs();
```

### In Build Tools

Integrate with webpack, Gulp, or other build tools:

```javascript
// webpack.config.js
const { scanProject } = require("adr-tracker");

module.exports = {
  // ... webpack config
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tapAsync(
          "AdrCheckerPlugin",
          async (compilation, callback) => {
            try {
              const result = await scanProject();
              if (result.issues.length > 0) {
                compilation.errors.push("ADR validation failed");
              }
              callback();
            } catch (error) {
              callback(error);
            }
          }
        );
      },
    },
  ],
};
```

### In Express/Node.js Servers

Create an API endpoint for ADR validation:

```javascript
const express = require("express");
const { scanProject } = require("adr-tracker");

const app = express();

app.get("/api/validate-adrs", async (req, res) => {
  try {
    const result = await scanProject();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Integrating with React Applications

ADR Tracker can be easily integrated into your React application workflow:

### 1. Installation

First, install ADR Tracker as a development dependency in your React project:

```bash
npm install --save-dev adr-tracker
```

### 2. Create an ADR Directory

Create a directory to store your ADR documents:

```bash
mkdir -p docs/adr
```

This is where you'll write your architecture decision records in markdown format.

### 3. Add ADR References in Your Code

When implementing an architectural decision, reference the relevant ADR in your code comments:

```jsx
// src/components/UserProfile.jsx

// ADR-0015: Using React Context for state management
import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const UserProfile = () => {
  const { user } = useContext(UserContext);
  return (
    <div className="profile">
      <h2>{user.name}</h2>
    </div>
  );
};
```

### 4. Run Validation

Add a script to your package.json to run ADR Tracker:

```json
"scripts": {
  "adr-check": "adr-tracker scan --src src --adr docs/adr"
}
```

Then run it with:

```bash
npm run adr-check
```

This will scan your code for ADR references and validate them against your ADR documents.

## Future Extensions

To extend this tool further, you could:

- Add more language parsers (Java, Python, etc.)
- Enhance the UI dashboard with more visualizations:
  - Timeline view showing ADR creation and modification dates
  - Dependency graph visualizing relationships between ADRs
  - Tag cloud showing distribution of ADR categories
  - Coverage heatmap highlighting areas with good/poor ADR documentation
  - Status transition diagrams tracking how ADRs evolve over time
  - Metrics dashboard showing ADR health and adoption rates
- Create an ESLint plugin for real-time ADR validation
- Add support for exporting to Confluence, Notion, or GitHub Wiki
- Implement a CI/CD integration for automated validation

### Future VS Code Extension

A planned VS Code extension would enhance your development workflow by providing:

- **Real-time Validation**: Highlighting invalid ADR references as you type
- **Tooltips**: Hover over ADR references to see titles and summaries
- **Go to Definition**: Ctrl+click on ADR references to open the corresponding ADR file
- **Status Indicators**: Visual indicators showing the status of referenced ADRs

Once available, you would configure it through VS Code settings:

```json
// .vscode/settings.json
{
  "adrChecker.adrDirectory": "docs/adr",
  "adrChecker.validateOnSave": true
}
```

## License

MIT
