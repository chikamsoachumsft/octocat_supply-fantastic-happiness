# MCP Server Setup and Configuration Guide

This guide provides detailed instructions for installing, configuring, and running MCP servers for the OctoCAT Supply demo application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Configuration File Overview](#configuration-file-overview)
- [Playwright MCP Server Setup](#playwright-mcp-server-setup)
- [GitHub MCP Server Setup](#github-mcp-server-setup)
- [Azure MCP Server Setup](#azure-mcp-server-setup)
- [Advanced Configuration](#advanced-configuration)
- [Environment-Specific Setup](#environment-specific-setup)

---

## Prerequisites

### Required Software

| Software | Purpose | Installation |
|----------|---------|--------------|
| **VS Code** | IDE with MCP support | [Download VS Code](https://code.visualstudio.com/) |
| **GitHub Copilot Extension** | AI assistant with MCP integration | Install from VS Code marketplace |
| **Node.js** (v18+) | Runtime for MCP servers | [Download Node.js](https://nodejs.org/) |
| **npx** | Package runner (included with Node.js) | Verify: `npx --version` |

### Optional (Server-Specific)

| Software | Required For | Installation |
|----------|--------------|--------------|
| **Docker** | github-local server | [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| **Podman** | Alternative to Docker (macOS/Linux) | [Install Podman](https://podman.io/getting-started/installation) |
| **GitHub PAT** | github-local authentication | [Create PAT](https://github.com/settings/tokens) |

### System Requirements

- **Memory**: 2GB+ available RAM
- **Network**: Internet connection for package downloads
- **Disk Space**: 500MB for MCP server packages and dependencies

---

## Configuration File Overview

All MCP server configurations are stored in `.vscode/mcp.json`:

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
    // Server definitions go here
  }
}
```

### Configuration Structure

- **`inputs`**: Defines authentication credentials and prompts
- **`servers`**: Contains individual server configurations
- **Server types**:
  - `command`: Runs a local command/process
  - `http`: Connects to a remote HTTP-based MCP server

---

## Playwright MCP Server Setup

### Overview

The Playwright MCP server enables browser automation and testing directly from Copilot Chat.

### Configuration

```jsonc
"playwright": {
  "command": "npx",
  "args": [
    "@playwright/mcp@latest",
    "--browser=msedge"
  ]
}
```

### Setup Steps

#### 1. No Pre-Installation Required

The Playwright MCP server uses `npx` which automatically downloads the latest version on first run.

#### 2. Browser Selection

The default configuration uses Microsoft Edge (`--browser=msedge`). You can change this:

```jsonc
// For Chrome
"--browser=chrome"

// For Firefox
"--browser=firefox"

// For WebKit (Safari engine)
"--browser=webkit"
```

#### 3. Start the Server

**Method 1: VS Code UI**
1. Open `.vscode/mcp.json`
2. Click **Start server** above the `playwright` entry

**Method 2: Command Palette**
1. Press `Ctrl+Shift+P` or `Cmd+Shift+P`
2. Type `MCP: List servers`
3. Select `playwright`
4. Click `Start server`

#### 4. Verify Installation

First run will install Playwright browsers:

```bash
# You'll see output like:
Downloading browsers...
✓ Chromium 120.0.6099.109
✓ Firefox 120.0
✓ WebKit 17.4
```

This is a one-time installation (~300MB).

### Testing Playwright

```text
In Copilot Chat (Agent mode):
"Browse to http://localhost:5137"
```

Copilot should invoke the Playwright MCP and navigate to the URL.

---

## GitHub MCP Server Setup

The GitHub MCP server comes in two variants. **Choose one, not both**.

### Variant Comparison

| Feature | github-local | github-remote |
|---------|--------------|---------------|
| **Hosting** | Docker container (local) | GitHub-hosted service |
| **Authentication** | PAT (manual entry) | OAuth (automatic) |
| **Setup Complexity** | Medium (requires Docker) | Low (just start) |
| **Toolsets** | Standard GitHub tools | Extended (includes Copilot Spaces) |
| **Offline Support** | No (requires internet) | No |
| **Best For** | Demos requiring PAT control | Quick setup, OAuth demos |

### Option 1: GitHub Remote Server (Recommended)

#### Configuration

```jsonc
"github-remote": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "X-MCP-Toolsets": "actions, code_security, dependabot, discussions, issues, orgs, projects, pull_requests, repos, secret_protection, security_advisories, copilot, copilot_spaces"
  }
}
```

#### Setup Steps

1. **No Prerequisites** - Server is hosted by GitHub
2. **Start the Server**:
   - Press `Ctrl+Shift+P` → `MCP: List servers` → `github-remote` → `Start server`
3. **Authenticate via OAuth**:
   - Follow the browser prompt to authorize
   - Grant requested permissions
4. **Verify Connection**:
   ```text
   In Copilot Chat: "List my GitHub issues"
   ```

#### Customizing Toolsets

The `X-MCP-Toolsets` header controls which GitHub APIs are available:

```jsonc
// Minimal: Just issues and PRs
"X-MCP-Toolsets": "issues, pull_requests"

// Full featured: All tools including Copilot Spaces
"X-MCP-Toolsets": "actions, code_security, dependabot, discussions, issues, orgs, projects, pull_requests, repos, secret_protection, security_advisories, copilot, copilot_spaces"

// Copilot Spaces only (for compliance demos)
"X-MCP-Toolsets": "copilot_spaces"
```

See the [GitHub MCP Server Documentation](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md) for all available toolsets.

### Option 2: GitHub Local Server

#### Configuration

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

**For Podman users**, replace `"command": "docker"` with `"command": "podman"`.

#### Prerequisites

1. **Install Docker/Podman**:
   - **macOS**: `brew install --cask docker` or `brew install podman`
   - **Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - **Linux**: Follow [official guides](https://docs.docker.com/engine/install/)

2. **Verify Installation**:
   ```bash
   docker --version
   # Docker version 24.0.0 or later
   ```

3. **Start Docker/Podman**:
   - Ensure the daemon is running before starting the MCP server

#### Creating a GitHub PAT

1. Navigate to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Fine-grained token**
3. **Configure Token**:
   - **Name**: `MCP Server Demo`
   - **Expiration**: 90 days (or custom)
   - **Repository access**: Select repositories or all repositories
   - **Permissions**:
     - Issues: Read and write
     - Pull requests: Read and write
     - Contents: Read (for code search)
     - Metadata: Read (automatic)
     - Projects: Read and write (optional)
4. Click **Generate token**
5. **Save the token** in a password manager (you won't see it again!)

#### Setup Steps

1. **Start the Server**:
   - Press `Ctrl+Shift+P` → `MCP: List servers` → `github-local` → `Start server`
2. **Enter PAT**:
   - VS Code will prompt for your GitHub token
   - Paste your PAT (input is hidden)
   - Token is cached securely by VS Code
3. **Verify Connection**:
   ```text
   In Copilot Chat: "Create an issue in my repo titled 'Test MCP Integration'"
   ```

#### Managing Cached Tokens

**To update or clear the cached PAT**:

1. Open `.vscode/mcp.json`
2. Look for the `inputs` section with `"id": "github_token"`
3. You'll see `"github_token": "****"` (GUI representation)
4. **Right-click** on the `****` → **Edit** or **Clear**

> **Note**: The actual token is stored in VS Code's secure storage, not the JSON file.

---

## Azure MCP Server Setup

### Overview

The Azure MCP server provides access to Azure cloud services, documentation, and best practices.

### Configuration

```jsonc
"Azure MCP Server": {
  "command": "npx",
  "args": [
    "-y",
    "@azure/mcp@latest",
    "server",
    "start"
  ]
}
```

### Setup Steps

1. **Start the Server**:
   - Press `Ctrl+Shift+P` → `MCP: List servers` → `Azure MCP Server` → `Start server`
2. **First Run Installation**:
   - `npx` will download and cache the latest Azure MCP package
   - Takes ~30 seconds on first run
3. **Authentication** (if required):
   - Some Azure operations may require Azure CLI authentication
   - Run `az login` in terminal if prompted

### Testing Azure MCP

```text
In Copilot Chat:
"What are Azure best practices for deploying container apps?"
```

---

## Advanced Configuration

### Custom Server Names

You can rename servers for clarity:

```jsonc
"servers": {
  "playwright-edge": { /* config */ },
  "playwright-firefox": { /* config with --browser=firefox */ }
}
```

### Environment Variables

Pass environment variables to MCP servers:

```jsonc
"playwright": {
  "command": "npx",
  "args": ["@playwright/mcp@latest"],
  "env": {
    "PLAYWRIGHT_BROWSERS_PATH": "/custom/path",
    "DEBUG": "pw:api"
  }
}
```

### Timeout Configuration

Some operations may need longer timeouts:

```jsonc
"github-local": {
  "command": "docker",
  "args": ["run", "-i", "--rm", "ghcr.io/github/github-mcp-server:latest"],
  "timeout": 60000  // 60 seconds
}
```

### Custom Browser Arguments (Playwright)

```jsonc
"playwright": {
  "command": "npx",
  "args": [
    "@playwright/mcp@latest",
    "--browser=chrome",
    "--headless=false",    // Show browser window
    "--slow-mo=1000"       // Slow down operations
  ]
}
```

---

## Environment-Specific Setup

### GitHub Codespaces

MCP servers work in Codespaces with some limitations:

#### Supported
- ✅ Playwright (browser automation)
- ✅ GitHub Remote (OAuth)
- ✅ Azure MCP

#### Not Supported
- ❌ GitHub Local (Docker in Docker issues)

#### Configuration Tips

1. **Port Forwarding**: Ensure port 5137 is public for Playwright to access the frontend
2. **Browser Selection**: Use `chrome` or `firefox` (edge may not be available)
3. **Performance**: Codespaces may be slower for browser automation

### Local Development

All servers work without restrictions:

1. **Use github-local** if you need fine-grained PAT control
2. **Run multiple servers** for comprehensive demos
3. **Better performance** for intensive browser testing

### CI/CD Environments

MCP servers are **not recommended** for CI/CD pipelines. For automation:

- Use native **Playwright** test runners
- Use **GitHub Actions** for GitHub API operations
- Use **Azure CLI** for Azure operations

MCP is designed for **interactive, AI-assisted workflows**, not automated testing.

---

## Verification Checklist

After setup, verify all servers work:

- [ ] Playwright server starts without errors
- [ ] Can navigate to a URL using Copilot Chat
- [ ] GitHub server authenticates successfully
- [ ] Can list/create GitHub issues from Copilot
- [ ] Azure MCP server responds to queries
- [ ] No error messages in VS Code output panel

### Checking Server Logs

1. Open **Output** panel: `Ctrl+Shift+U` or `Cmd+Shift+U`
2. Select **MCP Servers** from the dropdown
3. Look for connection and tool execution logs

---

## Next Steps

- **[Tools Reference](./tools-reference.md)**: Explore available MCP tools
- **[Usage Examples](./usage-examples.md)**: See practical demo scenarios
- **[Troubleshooting](./troubleshooting.md)**: Resolve common issues

---

## Quick Reference

### Start All Servers (PowerShell)

```powershell
# Recommended: Use VS Code Command Palette
# Ctrl+Shift+P -> "MCP: List servers" -> Start each server
```

### Stop All Servers

```powershell
# Use Command Palette
# MCP: List servers -> Stop server
```

### Verify Configuration

```bash
# Check Node.js
node --version  # Should be v18+

# Check Docker (if using github-local)
docker --version

# Check VS Code MCP support
# Look for MCP: commands in Command Palette
```
