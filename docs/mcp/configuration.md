# MCP Configuration Reference

Complete reference for configuring MCP servers in the OctoCAT Supply demo application.

## Table of Contents

- [Configuration File Location](#configuration-file-location)
- [Configuration Schema](#configuration-schema)
- [Input Configuration](#input-configuration)
- [Server Configuration](#server-configuration)
- [Environment Variables](#environment-variables)
- [Advanced Options](#advanced-options)

---

## Configuration File Location

MCP server configurations are stored in:

```
.vscode/mcp.json
```

This file is:
- **Version controlled** (included in the repository)
- **Per-workspace** (not global to VS Code)
- **JSON format** with comment support (JSONC)

---

## Configuration Schema

### Root Structure

```jsonc
{
  "inputs": [ /* Input definitions */ ],
  "servers": { /* Server definitions */ }
}
```

### Complete Example

```jsonc
{
  "inputs": [
    {
      "id": "github_token",
      "type": "promptString",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser=msedge"],
      "env": {},
      "timeout": 30000
    },
    "github-remote": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "X-MCP-Toolsets": "issues, pull_requests"
      }
    }
  }
}
```

---

## Input Configuration

Inputs define credentials and configuration values that can be prompted from the user.

### Input Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the input |
| `type` | string | Yes | Input type: `promptString`, `promptSecret` |
| `description` | string | Yes | User-facing prompt text |
| `password` | boolean | No | Mask input (for secrets). Default: `false` |
| `default` | string | No | Default value if user provides none |

### Example: GitHub PAT Input

```jsonc
{
  "id": "github_token",
  "type": "promptString",
  "description": "GitHub Personal Access Token",
  "password": true
}
```

**Usage in server config**:
```jsonc
"env": {
  "GITHUB_TOKEN": "${input:github_token}"
}
```

### Example: API Endpoint Input

```jsonc
{
  "id": "api_endpoint",
  "type": "promptString",
  "description": "API Base URL",
  "default": "http://localhost:3000"
}
```

---

## Server Configuration

### Server Types

MCP supports two server types:

1. **Command-based** (`command` servers): Run local processes
2. **HTTP-based** (`type: "http"` servers): Connect to remote MCP servers

---

### Command-Based Servers

Used for local MCP server processes (Playwright, Azure, local GitHub).

#### Schema

```typescript
{
  "server-name": {
    "command": string,        // Executable to run
    "args": string[],         // Command-line arguments
    "env": object,            // Environment variables (optional)
    "cwd": string,            // Working directory (optional)
    "timeout": number         // Startup timeout in ms (optional)
  }
}
```

#### Example: Playwright Server

```jsonc
"playwright": {
  "command": "npx",
  "args": [
    "@playwright/mcp@latest",
    "--browser=msedge"
  ]
}
```

**Explanation**:
- Runs `npx @playwright/mcp@latest --browser=msedge`
- Uses npx to auto-download latest version
- Configures Edge as the browser

#### Example: Azure MCP Server

```jsonc
"Azure MCP Server": {
  "command": "npx",
  "args": [
    "-y",              // Auto-confirm install
    "@azure/mcp@latest",
    "server",
    "start"
  ]
}
```

#### Example: GitHub Local Server

```jsonc
"github-local": {
  "command": "docker",
  "args": [
    "run",
    "-i",
    "--rm",
    "ghcr.io/github/github-mcp-server:latest"
  ],
  "env": {
    "GITHUB_TOKEN": "${input:github_token}"
  }
}
```

**For Podman**:
```jsonc
"command": "podman",  // Just change this line
```

---

### HTTP-Based Servers

Used for remote MCP servers (GitHub Remote, hosted services).

#### Schema

```typescript
{
  "server-name": {
    "type": "http",
    "url": string,            // MCP server URL
    "headers": object,        // HTTP headers (optional)
    "timeout": number         // Request timeout in ms (optional)
  }
}
```

#### Example: GitHub Remote Server

```jsonc
"github-remote": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "X-MCP-Toolsets": "actions, issues, pull_requests, copilot_spaces"
  }
}
```

**Key Points**:
- No local process required
- Authentication via OAuth (handled by VS Code)
- Toolsets controlled via headers

---

### Server Properties Reference

#### `command` (Command-based only)

**Type**: `string`  
**Required**: Yes (for command-based servers)  
**Description**: Executable to run (e.g., `npx`, `docker`, `node`, `python`)

**Examples**:
```jsonc
"command": "npx"
"command": "docker"
"command": "node"
"command": "/usr/local/bin/custom-mcp-server"
```

---

#### `args` (Command-based only)

**Type**: `string[]`  
**Required**: Yes (for command-based servers)  
**Description**: Array of command-line arguments

**Examples**:
```jsonc
// Playwright with options
"args": [
  "@playwright/mcp@latest",
  "--browser=chrome",
  "--headless=false"
]

// Azure MCP
"args": [
  "-y",
  "@azure/mcp@latest",
  "server",
  "start"
]
```

---

#### `env` (Command-based only)

**Type**: `object`  
**Required**: No  
**Description**: Environment variables for the server process

**Examples**:
```jsonc
"env": {
  "GITHUB_TOKEN": "${input:github_token}",
  "DEBUG": "mcp:*",
  "NODE_ENV": "development"
}
```

**Variable Substitution**:
- `${input:id}`: Reference an input value
- `${env:VAR}`: Reference existing environment variable
- `${workspaceFolder}`: Path to workspace root

---

#### `cwd` (Command-based only)

**Type**: `string`  
**Required**: No  
**Default**: Workspace root  
**Description**: Working directory for the server process

**Example**:
```jsonc
"cwd": "${workspaceFolder}/mcp-servers"
```

---

#### `timeout` (All server types)

**Type**: `number` (milliseconds)  
**Required**: No  
**Default**: 30000 (30 seconds)  
**Description**: Maximum time to wait for server startup or HTTP requests

**Examples**:
```jsonc
"timeout": 60000  // 1 minute for slow connections
"timeout": 5000   // 5 seconds for fast local servers
```

---

#### `type` (HTTP-based only)

**Type**: `"http"`  
**Required**: Yes (for HTTP-based servers)  
**Description**: Specifies this is an HTTP MCP server

**Example**:
```jsonc
"type": "http",
"url": "https://api.githubcopilot.com/mcp/"
```

---

#### `url` (HTTP-based only)

**Type**: `string`  
**Required**: Yes (for HTTP-based servers)  
**Description**: Base URL of the MCP server

**Examples**:
```jsonc
"url": "https://api.githubcopilot.com/mcp/"
"url": "http://localhost:8080/mcp"
"url": "https://custom-mcp.example.com/api"
```

---

#### `headers` (HTTP-based only)

**Type**: `object`  
**Required**: No  
**Description**: HTTP headers to send with MCP requests

**Example**:
```jsonc
"headers": {
  "X-MCP-Toolsets": "issues, pull_requests",
  "Authorization": "Bearer ${input:api_token}",
  "X-Custom-Header": "value"
}
```

**GitHub Remote Toolsets**:
```jsonc
"X-MCP-Toolsets": "actions, code_security, dependabot, discussions, issues, orgs, projects, pull_requests, repos, secret_protection, security_advisories, copilot, copilot_spaces"
```

---

## Environment Variables

Environment variables can be used in MCP server configurations.

### Built-in Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `${workspaceFolder}` | Workspace root path | `/home/user/project` |
| `${env:VAR_NAME}` | System environment variable | `${env:PATH}` |
| `${input:id}` | Value from inputs section | `${input:github_token}` |

### Example: Using Environment Variables

```jsonc
"custom-server": {
  "command": "${env:HOME}/.local/bin/mcp-server",
  "args": ["--data-dir=${workspaceFolder}/data"],
  "env": {
    "API_KEY": "${input:api_key}",
    "LOG_LEVEL": "${env:LOG_LEVEL}"
  }
}
```

---

## Advanced Options

### Multiple Server Instances

You can configure multiple instances of the same MCP server with different settings:

```jsonc
"servers": {
  "playwright-chrome": {
    "command": "npx",
    "args": ["@playwright/mcp@latest", "--browser=chrome"]
  },
  "playwright-firefox": {
    "command": "npx",
    "args": ["@playwright/mcp@latest", "--browser=firefox"]
  }
}
```

**Use case**: Test across different browsers.

---

### Conditional Configuration

Use environment variables to conditionally configure servers:

```jsonc
"github-local": {
  "command": "${env:CONTAINER_RUNTIME}",  // "docker" or "podman"
  "args": [
    "run",
    "-i",
    "--rm",
    "ghcr.io/github/github-mcp-server:latest"
  ]
}
```

**Setup**:
```bash
# Set before starting VS Code
export CONTAINER_RUNTIME=podman
```

---

### Debug Configuration

Enable verbose logging for troubleshooting:

```jsonc
"playwright": {
  "command": "npx",
  "args": ["@playwright/mcp@latest", "--browser=chrome"],
  "env": {
    "DEBUG": "pw:api",
    "PWDEBUG": "1"
  }
}
```

**Common Debug Flags**:
- `DEBUG=mcp:*` - All MCP logs
- `DEBUG=pw:api` - Playwright API logs
- `NODE_ENV=development` - Development mode

---

### Custom Server Paths

Use specific versions or custom installations:

```jsonc
"custom-playwright": {
  "command": "node",
  "args": [
    "/path/to/custom/mcp-server/index.js",
    "--browser=chrome"
  ]
}
```

---

## Configuration Best Practices

### 1. Version Control

✓ **Do**: Commit `.vscode/mcp.json` to version control  
✓ **Do**: Document custom configurations in README  
✗ **Don't**: Commit tokens or secrets (use `${input:...}` instead)

### 2. Security

✓ **Do**: Use `password: true` for secret inputs  
✓ **Do**: Use fine-grained tokens with minimal permissions  
✗ **Don't**: Hardcode credentials in configuration  
✗ **Don't**: Share configurations containing secrets

### 3. Portability

✓ **Do**: Use `npx` for auto-downloading packages  
✓ **Do**: Use `${workspaceFolder}` for relative paths  
✗ **Don't**: Hardcode absolute paths  
✗ **Don't**: Assume specific OS (e.g., Windows-only paths)

### 4. Documentation

✓ **Do**: Add comments explaining non-obvious configurations  
✓ **Do**: Document required inputs  
✓ **Do**: Note which servers are mutually exclusive

Example:
```jsonc
{
  "servers": {
    // GitHub MCP Server - Local variant
    // Requires Docker/Podman and a GitHub PAT
    // Start EITHER this OR github-remote, not both
    "github-local": {
      /* config */
    },

    // GitHub MCP Server - Remote variant  
    // Uses OAuth, no Docker needed
    // Start EITHER this OR github-local, not both
    "github-remote": {
      /* config */
    }
  }
}
```

---

## Validation

### Checking Configuration Syntax

1. Open `.vscode/mcp.json` in VS Code
2. Look for red squiggly lines (syntax errors)
3. Hover over errors for explanations

### Testing Configuration

1. Save `.vscode/mcp.json`
2. Command Palette → `MCP: List servers`
3. Try starting each server
4. Check **Output** panel for errors

### Common Validation Errors

**Missing comma**:
```jsonc
{
  "servers": {
    "playwright": { /* ... */ }  // Missing comma here
    "github": { /* ... */ }
  }
}
```
**Fix**: Add comma after closing brace.

**Invalid JSON**:
```jsonc
{
  "servers": {
    playwright: { /* ... */ }  // Missing quotes around key
  }
}
```
**Fix**: Quote all object keys.

**Unresolved variable**:
```jsonc
"env": {
  "TOKEN": "${input:nonexistent_input}"  // Input not defined
}
```
**Fix**: Add input to `inputs` section.

---

## Configuration Templates

### Template: Minimal Playwright

```jsonc
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Template: Full GitHub Remote

```jsonc
{
  "servers": {
    "github-remote": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "X-MCP-Toolsets": "actions, code_security, dependabot, discussions, issues, orgs, projects, pull_requests, repos, secret_protection, security_advisories, copilot, copilot_spaces"
      }
    }
  }
}
```

### Template: GitHub Local with Podman

```jsonc
{
  "inputs": [
    {
      "id": "github_token",
      "type": "promptString",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "github-local": {
      "command": "podman",
      "args": [
        "run",
        "-i",
        "--rm",
        "ghcr.io/github/github-mcp-server:latest"
      ],
      "env": {
        "GITHUB_TOKEN": "${input:github_token}"
      }
    }
  }
}
```

### Template: Multi-Browser Testing

```jsonc
{
  "servers": {
    "playwright-chrome": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser=chrome"]
    },
    "playwright-firefox": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser=firefox"]
    },
    "playwright-edge": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser=msedge"]
    }
  }
}
```

---

## Migrating Configurations

### From Docker to Podman

**Before**:
```jsonc
"github-local": {
  "command": "docker",
  "args": ["run", "-i", "--rm", "ghcr.io/github/github-mcp-server:latest"]
}
```

**After**:
```jsonc
"github-local": {
  "command": "podman",  // Only change needed
  "args": ["run", "-i", "--rm", "ghcr.io/github/github-mcp-server:latest"]
}
```

### From Local to Remote GitHub Server

**Before** (github-local):
```jsonc
"github-local": {
  "command": "docker",
  "args": ["run", "-i", "--rm", "ghcr.io/github/github-mcp-server:latest"],
  "env": {
    "GITHUB_TOKEN": "${input:github_token}"
  }
}
```

**After** (github-remote):
```jsonc
"github-remote": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "X-MCP-Toolsets": "issues, pull_requests"
  }
}
```

---

## Related Documentation

- [Setup Guide](./setup.md) - Installation and configuration walkthrough
- [Tools Reference](./tools-reference.md) - Available MCP tools
- [Troubleshooting](./troubleshooting.md) - Common configuration issues
- [Usage Examples](./usage-examples.md) - Practical usage scenarios

---

## External References

- [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/)
- [VS Code MCP Documentation](https://code.visualstudio.com/docs/copilot/mcp)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [Playwright MCP Server](https://github.com/microsoft/playwright-mcp)
