# MCP Troubleshooting Guide

This guide helps you diagnose and resolve common issues when working with MCP servers in the OctoCAT Supply demo.

## Table of Contents

- [General Troubleshooting](#general-troubleshooting)
- [Playwright MCP Issues](#playwright-mcp-issues)
- [GitHub MCP Issues](#github-mcp-issues)
- [Azure MCP Issues](#azure-mcp-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## General Troubleshooting

### MCP Server Won't Start

**Symptoms:**
- Server shows "Failed to start" in VS Code
- No error message or generic error

**Solutions:**

1. **Check Node.js version**:
   ```bash
   node --version
   # Should be v18 or later
   ```

2. **Verify npx installation**:
   ```bash
   npx --version
   # Should show version number
   ```

3. **Check VS Code Output panel**:
   - `Ctrl+Shift+U` or `Cmd+Shift+U` → Select **MCP Servers**
   - Look for specific error messages

4. **Restart VS Code**:
   - Close all VS Code windows
   - Reopen the workspace
   - Try starting the server again

5. **Clear MCP cache** (if repeated failures):
   ```bash
   # Windows
   Remove-Item -Recurse -Force "$env:USERPROFILE\.vscode\mcp"
   
   # macOS/Linux
   rm -rf ~/.vscode/mcp
   ```

---

### Server Starts But Tools Don't Work

**Symptoms:**
- Server shows as "Running"
- Copilot doesn't suggest or use MCP tools
- Tool calls fail silently

**Solutions:**

1. **Verify Agent Mode is enabled**:
   - Open Copilot Chat
   - Click the mode selector (top of chat)
   - Ensure **Agent** is selected (not Chat or Edit)

2. **Check tool permissions**:
   - When Copilot tries to use a tool, VS Code prompts for approval
   - Click **Allow** or **Always Allow**
   - If you previously clicked **Deny**, clear the denied tools list:
     - Settings → Search "MCP" → Clear denied tools

3. **Restart the MCP server**:
   - Command Palette: `MCP: List servers`
   - Select the server → `Stop server`
   - Wait 5 seconds
   - Select the server → `Start server`

4. **Verify server in chat context**:
   ```text
   In Copilot Chat: "What MCP servers are available?"
   ```
   Copilot should list running servers.

---

### "Network Error" or "Connection Refused"

**Symptoms:**
- Error: "Unable to connect to MCP server"
- Network-related error messages

**Solutions:**

1. **Check firewall settings**:
   - Allow VS Code through firewall
   - Allow Node.js/npx through firewall

2. **Verify internet connection**:
   - MCP servers require internet for package downloads
   - Some tools (GitHub API) require internet access

3. **Disable VPN temporarily**:
   - Some VPNs block MCP server connections
   - Try disconnecting VPN and restarting server

4. **Check proxy settings**:
   ```bash
   # Set npm proxy if behind corporate proxy
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

---

## Playwright MCP Issues

### Browser Not Found Error

**Symptoms:**
```
Error: browserType.launch: Executable doesn't exist at /path/to/browser
```

**Solutions:**

1. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

2. **Install specific browser**:
   ```bash
   # For Edge
   npx playwright install msedge
   
   # For Chrome
   npx playwright install chrome
   
   # For Firefox
   npx playwright install firefox
   ```

3. **Change browser in configuration**:
   
   Edit `.vscode/mcp.json`:
   ```jsonc
   "playwright": {
     "command": "npx",
     "args": [
       "@playwright/mcp@latest",
       "--browser=chrome"  // Change to available browser
     ]
   }
   ```

---

### Page Won't Load

**Symptoms:**
- `browser_navigate` times out
- "Navigation timeout exceeded" error

**Solutions:**

1. **Verify the application is running**:
   ```bash
   # Check if frontend is accessible
   curl http://localhost:5137
   
   # Or in PowerShell
   Test-NetConnection -ComputerName localhost -Port 5137
   ```

2. **Start the frontend**:
   ```bash
   npm run dev:frontend
   ```

3. **Check port forwarding (Codespaces)**:
   - In VS Code Ports panel, ensure port 5137 is public
   - Visibility: **Public** (not Private)

4. **Increase timeout in Copilot prompt**:
   ```text
   "Browse to http://localhost:5137 and wait up to 60 seconds"
   ```

---

### Elements Not Found

**Symptoms:**
- `browser_click` fails with "element not found"
- Selector doesn't match anything

**Solutions:**

1. **Verify selector syntax**:
   ```text
   # Ask Copilot to help
   "Inspect the page and find the correct selector for the cart icon"
   ```

2. **Take a screenshot first**:
   ```text
   "Take a screenshot so we can see what elements are on the page"
   ```

3. **Wait for element to load**:
   ```text
   "Wait for the .cart-icon element to appear, then click it"
   ```

4. **Use browser DevTools to test selector**:
   - Open http://localhost:5137 manually
   - Press F12 → Console
   - Test selector: `document.querySelector('.cart-icon')`

---

### Headless Browser Issues

**Symptoms:**
- Tests work when you can see the browser
- Fail in headless mode

**Solutions:**

1. **Disable headless mode for debugging**:
   
   Edit `.vscode/mcp.json`:
   ```jsonc
   "playwright": {
     "command": "npx",
     "args": [
       "@playwright/mcp@latest",
       "--browser=chrome",
       "--headless=false"
     ]
   }
   ```

2. **Slow down execution**:
   ```jsonc
   "args": [
     "@playwright/mcp@latest",
     "--slow-mo=1000"  // 1 second delay between actions
   ]
   ```

---

## GitHub MCP Issues

### Authentication Failures (github-local)

**Symptoms:**
- "Authentication failed" error
- "Bad credentials" message
- Tool calls return 401/403 errors

**Solutions:**

1. **Verify PAT is valid**:
   - Go to https://github.com/settings/tokens
   - Check token hasn't expired
   - Verify token has required permissions

2. **Clear and re-enter PAT**:
   - Open `.vscode/mcp.json`
   - Find `"id": "github_token"`
   - Right-click on `****` → **Clear**
   - Restart the server → Enter new PAT

3. **Check PAT permissions**:
   
   Required scopes for common operations:
   - Issues: `repo` or fine-grained `issues:write`
   - Pull Requests: `repo` or `pull_requests:write`
   - Code Search: `repo` or `contents:read`
   - Actions: `repo` or `actions:read`

4. **Test PAT manually**:
   ```bash
   # Replace YOUR_PAT with your token
   curl -H "Authorization: token YOUR_PAT" \
        https://api.github.com/user
   ```

---

### Docker Not Running (github-local)

**Symptoms:**
- Error: "Cannot connect to Docker daemon"
- "Is Docker running?" message

**Solutions:**

1. **Start Docker Desktop**:
   - Windows: Start Docker Desktop from Start menu
   - macOS: Open Docker.app from Applications
   - Wait for Docker to fully start (whale icon in system tray)

2. **Verify Docker is running**:
   ```bash
   docker ps
   # Should show running containers (or empty list)
   ```

3. **Use Podman instead (macOS/Linux)**:
   
   Edit `.vscode/mcp.json`:
   ```jsonc
   "github-local": {
     "command": "podman",  // Changed from "docker"
     "args": [
       "run",
       "-i",
       "--rm",
       "ghcr.io/github/github-mcp-server:latest"
     ]
   }
   ```

4. **Switch to github-remote**:
   - Stop github-local server
   - Start github-remote server (requires OAuth)
   - No Docker needed

---

### GitHub API Rate Limiting

**Symptoms:**
- Error: "API rate limit exceeded"
- Tools work initially, then stop

**Solutions:**

1. **Check your rate limit**:
   ```bash
   curl -H "Authorization: token YOUR_PAT" \
        https://api.github.com/rate_limit
   ```

2. **Wait for rate limit to reset**:
   - Unauthenticated: 60 requests/hour
   - Authenticated: 5,000 requests/hour
   - Reset time shown in rate limit response

3. **Use authenticated requests**:
   - Ensure PAT is correctly configured
   - Authenticated requests have higher limits

4. **Reduce tool call frequency**:
   - Avoid repeatedly listing all issues
   - Use specific queries to reduce API calls

---

### OAuth Issues (github-remote)

**Symptoms:**
- OAuth flow doesn't complete
- Browser doesn't open for authentication
- "Authentication cancelled" error

**Solutions:**

1. **Complete OAuth in browser**:
   - When server starts, VS Code opens browser
   - Click **Authorize** on the GitHub page
   - Wait for "Success" message
   - Return to VS Code

2. **Clear OAuth cache**:
   ```bash
   # Restart the server, which will re-prompt for OAuth
   ```

3. **Check browser pop-up blocker**:
   - Allow pop-ups from vscode.dev or github.com
   - Try manually opening the OAuth URL

4. **Verify enterprise settings** (if using GitHub Enterprise):
   - Ensure MCP is allowed in enterprise policies
   - Check with your GitHub admin

---

### Toolset Not Available

**Symptoms:**
- Copilot says "tool not found"
- Expected tools (like `copilot_spaces`) missing

**Solutions:**

1. **Verify X-MCP-Toolsets header**:
   
   Edit `.vscode/mcp.json`:
   ```jsonc
   "github-remote": {
     "type": "http",
     "url": "https://api.githubcopilot.com/mcp/",
     "headers": {
       "X-MCP-Toolsets": "issues, pull_requests, copilot_spaces"
     }
   }
   ```

2. **Restart server after config change**:
   - Stop the server
   - Save `.vscode/mcp.json`
   - Start the server

3. **Check toolset availability**:
   - Some toolsets require specific GitHub plans
   - `copilot_spaces` requires GitHub Copilot Enterprise

---

## Azure MCP Issues

### Server Won't Start

**Symptoms:**
- Azure MCP server fails to start
- "Module not found" error

**Solutions:**

1. **Clear npx cache and retry**:
   ```bash
   npx clear-npx-cache
   npx @azure/mcp@latest server start
   ```

2. **Install globally** (alternative):
   ```bash
   npm install -g @azure/mcp
   ```
   
   Update `.vscode/mcp.json`:
   ```jsonc
   "Azure MCP Server": {
     "command": "azure-mcp",
     "args": ["server", "start"]
   }
   ```

3. **Check Node.js version**:
   - Azure MCP may require Node v18 or v20
   - Upgrade if needed

---

### Azure CLI Authentication

**Symptoms:**
- Azure tools require login
- "Not authenticated" errors

**Solutions:**

1. **Login with Azure CLI**:
   ```bash
   az login
   ```

2. **Verify authentication**:
   ```bash
   az account show
   ```

3. **Set subscription** (if multiple):
   ```bash
   az account list
   az account set --subscription "YOUR_SUBSCRIPTION_ID"
   ```

---

## Performance Issues

### Slow Tool Execution

**Symptoms:**
- MCP tools take a long time to execute
- Copilot seems "stuck" after invoking a tool

**Solutions:**

1. **Check network latency**:
   - GitHub API calls depend on internet speed
   - Browser automation depends on page load times

2. **Increase timeout values**:
   ```text
   "Browse to the URL and wait up to 60 seconds if needed"
   ```

3. **Close unused MCP servers**:
   - Stop servers you're not actively using
   - Each server consumes resources

4. **Restart VS Code**:
   - Long-running sessions may accumulate memory
   - Restart to free resources

---

### Memory Issues

**Symptoms:**
- VS Code becomes slow or unresponsive
- System running out of memory

**Solutions:**

1. **Close browser windows** (Playwright):
   ```text
   "Close the browser after testing"
   ```

2. **Stop unused servers**:
   - Command Palette: `MCP: List servers`
   - Stop servers not in use

3. **Reduce concurrent tool calls**:
   - Avoid running multiple expensive operations simultaneously

4. **Increase system memory**:
   - Playwright can use significant memory for browser instances
   - Consider 8GB+ RAM for heavy browser testing

---

### VS Code Freezes During Tool Execution

**Symptoms:**
- VS Code becomes unresponsive when MCP tool runs
- Can't interact with UI during tool execution

**Solutions:**

1. **This is expected behavior**:
   - MCP tools run synchronously by design
   - VS Code waits for tool completion before responding

2. **Use background tools** (if available):
   - Some tools support background execution
   - Check tool documentation

3. **Split into smaller operations**:
   ```text
   Instead of: "Test all 20 pages"
   Use: "Test the home page" (then repeat for other pages)
   ```

---

## Common Error Messages

### "MCP server process exited unexpectedly"

**Cause**: Server crashed or was terminated.

**Solutions**:
1. Check Output panel for error details
2. Verify all dependencies are installed
3. Restart the server
4. Check for conflicting processes (e.g., port already in use)

---

### "Tool execution denied by user"

**Cause**: You clicked "Deny" when prompted to approve tool execution.

**Solutions**:
1. Rephrase your request to Copilot
2. When prompted, click **Allow** or **Always Allow**
3. Clear denied tools list in settings if you accidentally denied too many

---

### "Invalid tool parameters"

**Cause**: Copilot generated incorrect parameters for the tool.

**Solutions**:
1. Provide more specific details in your prompt
2. Check the [Tools Reference](./tools-reference.md) for correct parameter formats
3. Try rephrasing your request

Example:
```text
Bad: "Create an issue"
Good: "Create an issue in the octocat/supply repo titled 'Fix cart bug'"
```

---

### "Timeout waiting for selector"

**Cause**: Element not found within timeout period (Playwright).

**Solutions**:
1. Verify element exists: `"Take a screenshot"`
2. Wait for page to load: `"Wait for the page to fully load, then click"`
3. Increase timeout: `"Wait up to 60 seconds for the button"`
4. Check selector syntax

---

## Debugging Tips

### Enable Verbose Logging

For all MCP servers, view detailed logs:

1. Open **Output** panel: `Ctrl+Shift+U` or `Cmd+Shift+U`
2. Select **MCP Servers** from dropdown
3. Watch for tool invocations, parameters, and responses

### Test Tools Manually

Use Copilot Chat to test individual tools:

```text
"Use the browser_navigate tool to go to http://localhost:5137"
"Use the create_issue tool to create an issue titled 'Test' in octocat/supply"
```

This isolates whether the issue is with:
- The tool itself
- Copilot's parameter generation
- Your natural language prompt

### Check Configuration Syntax

Validate `.vscode/mcp.json`:

1. Open the file in VS Code
2. Look for red squiggly lines (syntax errors)
3. Use online JSON validator if needed
4. Ensure all strings are quoted, commas are correct

### Compare with Working Examples

Reference the working configuration in this repo:
- [.vscode/mcp.json](../../.vscode/mcp.json)

---

## Environment-Specific Issues

### GitHub Codespaces

**Docker not available**:
- Use `github-remote` instead of `github-local`
- Docker-in-Docker is not fully supported in Codespaces

**Port access issues**:
- Set port 5137 to **Public** visibility
- Use the Codespaces-provided forwarded URL for browser testing

**Performance**:
- Codespaces may have limited resources
- Reduce concurrent tool calls
- Use smaller browser viewports

---

### Windows Subsystem for Linux (WSL)

**Docker connectivity**:
- Ensure Docker Desktop has WSL integration enabled
- Settings → Resources → WSL Integration → Enable for your distro

**Path issues**:
- Use WSL paths, not Windows paths
- Example: `/home/user/project` not `C:\Users\...`

---

## Getting Help

### Before Asking for Help

Gather this information:

1. **Error message** (exact text from Output panel)
2. **MCP server** that's failing (Playwright, GitHub, Azure)
3. **VS Code version**: Help → About
4. **Node.js version**: `node --version`
5. **Operating system**: Windows/macOS/Linux
6. **Environment**: Local / Codespaces / WSL
7. **What you were trying to do** (Copilot prompt)

### Where to Get Help

1. **VS Code Output Panel**:
   - Most errors have details here
   - Look for stack traces and specific error codes

2. **MCP Server Documentation**:
   - [Playwright MCP](https://github.com/microsoft/playwright-mcp/issues)
   - [GitHub MCP](https://github.com/github/github-mcp-server/issues)
   - [Azure MCP](https://github.com/azure/azure-mcp/issues)

3. **GitHub Copilot Support**:
   - [GitHub Support](https://support.github.com)
   - Include "MCP" in your support request

4. **Community**:
   - [VS Code Discussions](https://github.com/microsoft/vscode-discussions)
   - Stack Overflow: Tag `github-copilot` + `mcp`

---

## Known Limitations

### General

- **No offline mode**: All MCP servers require internet connectivity
- **Synchronous execution**: VS Code waits for tool completion
- **No tool chaining**: Copilot must invoke tools one at a time

### Playwright

- **Browser downloads**: First run downloads ~300MB of browsers
- **Resource intensive**: Browser automation uses significant CPU/memory
- **Platform-specific**: Some browsers not available on all platforms

### GitHub

- **Rate limits**: API calls are rate-limited
- **PAT expiration**: Tokens expire and must be renewed
- **Enterprise restrictions**: Some organizations block MCP servers

### Azure

- **Authentication required**: Many operations need Azure CLI login
- **Subscription access**: Tools only work with subscriptions you have access to

---

## Frequently Asked Questions

**Q: Can I use multiple MCP servers at once?**  
A: Yes, but start only the servers you need to conserve resources.

**Q: Do MCP servers work offline?**  
A: No, they all require internet connectivity.

**Q: Why does Copilot sometimes not use MCP tools?**  
A: Copilot decides when to use tools based on your prompt. Be explicit about what you want to do.

**Q: Can I create my own MCP server?**  
A: Yes! See the [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/) to build custom servers.

**Q: Are MCP tool calls private?**  
A: Tool parameters and responses are sent to GitHub Copilot's backend for processing. Don't use sensitive data without understanding your organization's policies.

**Q: Can I automate MCP tool calls without Copilot?**  
A: MCP is designed for AI-assisted workflows. For automation, use the underlying tools directly (Playwright, GitHub CLI, Azure CLI).

---

## Still Having Issues?

If this guide doesn't resolve your problem:

1. **Review [Setup Guide](./setup.md)** to verify configuration
2. **Check [Tools Reference](./tools-reference.md)** for correct usage
3. **Try [Usage Examples](./usage-examples.md)** that are known to work
4. **Search GitHub Issues** for the specific MCP server
5. **Open an issue** in this repo with details from "Before Asking for Help" section

---

## Contributing to This Guide

Found a solution not listed here? Please contribute:

1. Fork this repo
2. Add your solution to this file
3. Submit a pull request
4. Help other developers solve similar issues!
