# MCP Tools Reference

This document provides a comprehensive reference for all MCP tools available in the OctoCAT Supply demo environment.

## Table of Contents

- [Playwright MCP Tools](#playwright-mcp-tools)
- [GitHub MCP Tools](#github-mcp-tools)
- [Azure MCP Tools](#azure-mcp-tools)
- [Using Tools with Copilot](#using-tools-with-copilot)

---

## Playwright MCP Tools

The Playwright MCP server provides browser automation capabilities for testing and interaction.

### Core Navigation Tools

#### `browser_navigate`

Navigate to a specified URL.

**Parameters:**
- `url` (string, required): The URL to navigate to

**Example:**
```text
Copilot: "Browse to http://localhost:5137"
→ Invokes: browser_navigate(url="http://localhost:5137")
```

**Response:**
```json
{
  "status": "success",
  "url": "http://localhost:5137",
  "title": "OctoCAT Supply - Home"
}
```

**Use Cases:**
- Navigate to the frontend application
- Load specific pages for testing
- Validate page loads successfully

---

#### `browser_navigate_back`

Navigate back to the previous page in history.

**Parameters:** None

**Example:**
```text
Copilot: "Go back to the previous page"
→ Invokes: browser_navigate_back()
```

---

### Interaction Tools

#### `browser_click`

Click on an element matching a selector.

**Parameters:**
- `selector` (string, required): CSS selector for the element
- `button` (string, optional): Mouse button (`left`, `right`, `middle`). Default: `left`
- `timeout` (number, optional): Maximum time to wait (ms). Default: 30000

**Example:**
```text
Copilot: "Click on the cart icon"
→ Invokes: browser_click(selector=".cart-icon")
```

**Response:**
```json
{
  "status": "clicked",
  "selector": ".cart-icon",
  "element": "button"
}
```

**Common Selectors:**
- `.cart-icon` - Cart button
- `#login-button` - Login button by ID
- `[data-testid="submit"]` - Element with data attribute
- `text=Add to Cart` - Text-based selector

---

#### `browser_fill_form` / `browser_fill`

Fill an input field with text.

**Parameters:**
- `selector` (string, required): CSS selector for the input
- `value` (string, required): Text to enter
- `delay` (number, optional): Typing delay per character (ms)

**Example:**
```text
Copilot: "Fill in the search box with 'laptop'"
→ Invokes: browser_fill(selector="input[type='search']", value="laptop")
```

---

#### `browser_press_key`

Press a keyboard key.

**Parameters:**
- `key` (string, required): Key name (e.g., `Enter`, `Escape`, `ArrowDown`)

**Example:**
```text
Copilot: "Press Enter to submit"
→ Invokes: browser_press_key(key="Enter")
```

**Common Keys:**
- `Enter` - Submit forms
- `Escape` - Close modals
- `Tab` - Navigate fields
- `ArrowDown` - Navigate dropdowns

---

#### `browser_hover`

Hover over an element.

**Parameters:**
- `selector` (string, required): CSS selector for the element

**Example:**
```text
Copilot: "Hover over the menu item"
→ Invokes: browser_hover(selector=".menu-item")
```

**Use Cases:**
- Trigger dropdown menus
- Show tooltips
- Test hover states

---

#### `browser_select_option`

Select an option from a dropdown.

**Parameters:**
- `selector` (string, required): CSS selector for the `<select>` element
- `value` (string, required): Option value to select

**Example:**
```text
Copilot: "Select the 'Electronics' category"
→ Invokes: browser_select_option(selector="#category", value="electronics")
```

---

#### `browser_file_upload`

Upload a file to a file input.

**Parameters:**
- `selector` (string, required): CSS selector for the file input
- `filePath` (string, required): Path to the file

**Example:**
```text
Copilot: "Upload the invoice.pdf file"
→ Invokes: browser_file_upload(selector="input[type='file']", filePath="./invoice.pdf")
```

---

#### `browser_drag`

Drag an element to a new position.

**Parameters:**
- `sourceSelector` (string, required): Element to drag
- `targetSelector` (string, required): Target destination

**Example:**
```text
Copilot: "Drag the task to the 'Done' column"
→ Invokes: browser_drag(sourceSelector=".task-card", targetSelector=".done-column")
```

---

### Capture and Validation Tools

#### `browser_take_screenshot` / `browser_snapshot`

Capture a screenshot of the current page or element.

**Parameters:**
- `path` (string, optional): File path to save screenshot
- `fullPage` (boolean, optional): Capture full scrollable page. Default: false
- `selector` (string, optional): Capture specific element only

**Example:**
```text
Copilot: "Take a screenshot of the cart page"
→ Invokes: browser_screenshot(path="cart-page.png", fullPage=true)
```

**Response:**
```json
{
  "status": "success",
  "path": "cart-page.png",
  "size": "1920x1080"
}
```

---

#### `browser_evaluate`

Execute JavaScript in the browser context.

**Parameters:**
- `script` (string, required): JavaScript code to execute
- `args` (array, optional): Arguments to pass to the script

**Example:**
```text
Copilot: "Get the current cart item count"
→ Invokes: browser_evaluate(
    script="() => document.querySelectorAll('.cart-item').length"
  )
```

**Response:**
```json
{
  "result": 3
}
```

**Use Cases:**
- Extract page data
- Validate computed values
- Trigger custom events

---

#### `browser_wait_for`

Wait for a condition to be met.

**Parameters:**
- `selector` (string, optional): Wait for element to appear
- `state` (string, optional): Wait for specific state (`visible`, `hidden`, `attached`, `detached`)
- `timeout` (number, optional): Maximum wait time (ms)

**Example:**
```text
Copilot: "Wait for the loading spinner to disappear"
→ Invokes: browser_wait_for(selector=".spinner", state="hidden", timeout=5000)
```

---

### Browser Management Tools

#### `browser_resize`

Resize the browser viewport.

**Parameters:**
- `width` (number, required): Width in pixels
- `height` (number, required): Height in pixels

**Example:**
```text
Copilot: "Resize browser to mobile size"
→ Invokes: browser_resize(width=375, height=667)
```

**Common Sizes:**
- Mobile: `375x667` (iPhone SE)
- Tablet: `768x1024` (iPad)
- Desktop: `1920x1080` (Full HD)

---

#### `browser_tabs`

Manage browser tabs.

**Parameters:**
- `action` (string, required): `list`, `switch`, `close`, `new`
- `tabId` (string, optional): Target tab ID (for switch/close)

**Example:**
```text
Copilot: "Open a new tab"
→ Invokes: browser_tabs(action="new")
```

---

#### `browser_close`

Close the browser instance.

**Parameters:** None

**Example:**
```text
Copilot: "Close the browser"
→ Invokes: browser_close()
```

---

### Monitoring Tools

#### `browser_console_messages`

Get console messages from the browser.

**Parameters:**
- `level` (string, optional): Filter by level (`log`, `warn`, `error`)

**Example:**
```text
Copilot: "Show browser console errors"
→ Invokes: browser_console_messages(level="error")
```

**Response:**
```json
{
  "messages": [
    {
      "type": "error",
      "text": "Failed to load resource: the server responded with a status of 404",
      "timestamp": "2026-02-25T10:30:45.123Z"
    }
  ]
}
```

---

#### `browser_network_requests`

Get network requests made by the page.

**Parameters:**
- `filter` (string, optional): Filter requests by URL pattern

**Example:**
```text
Copilot: "Show all API requests to /api/products"
→ Invokes: browser_network_requests(filter="/api/products")
```

**Response:**
```json
{
  "requests": [
    {
      "url": "http://localhost:3000/api/products",
      "method": "GET",
      "status": 200,
      "duration": 45
    }
  ]
}
```

---

#### `browser_handle_dialog`

Handle browser dialogs (alert, confirm, prompt).

**Parameters:**
- `action` (string, required): `accept` or `dismiss`
- `promptText` (string, optional): Text to enter in prompt dialogs

**Example:**
```text
Copilot: "Accept the confirmation dialog"
→ Invokes: browser_handle_dialog(action="accept")
```

---

## GitHub MCP Tools

The GitHub MCP server provides comprehensive access to the GitHub API.

### Issues Tools

#### `create_issue`

Create a new issue in a repository.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `title` (string, required): Issue title
- `body` (string, optional): Issue description (Markdown)
- `labels` (array, optional): Array of label names
- `assignees` (array, optional): Array of usernames to assign

**Example:**
```text
Copilot: "Create an issue for improving test coverage"
→ Invokes: create_issue(
    owner="octocat",
    repo="supply",
    title="Improve API test coverage",
    body="We need better unit tests for the orders repository",
    labels=["enhancement", "testing"]
  )
```

**Response:**
```json
{
  "number": 42,
  "title": "Improve API test coverage",
  "url": "https://github.com/octocat/supply/issues/42",
  "state": "open"
}
```

---

#### `list_issues`

List issues for a repository.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `state` (string, optional): `open`, `closed`, or `all`. Default: `open`
- `assignee` (string, optional): Filter by assignee username
- `labels` (string, optional): Comma-separated label names

**Example:**
```text
Copilot: "Show me my open issues"
→ Invokes: list_issues(
    owner="octocat",
    repo="supply",
    state="open",
    assignee="@me"
  )
```

---

#### `get_issue`

Get details of a specific issue.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `issue_number` (number, required): Issue number

---

#### `update_issue`

Update an existing issue.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `issue_number` (number, required): Issue number
- `title` (string, optional): New title
- `body` (string, optional): New description
- `state` (string, optional): `open` or `closed`
- `labels` (array, optional): Replace labels

---

### Pull Request Tools

#### `create_pull_request`

Create a new pull request.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `title` (string, required): PR title
- `head` (string, required): Branch with changes
- `base` (string, required): Target branch (e.g., `main`)
- `body` (string, optional): PR description
- `draft` (boolean, optional): Create as draft PR

**Example:**
```text
Copilot: "Create a PR for the cart feature"
→ Invokes: create_pull_request(
    owner="octocat",
    repo="supply",
    title="Add shopping cart functionality",
    head="feature/cart",
    base="main",
    body="Implements #42"
  )
```

---

#### `list_pull_requests`

List pull requests for a repository.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `state` (string, optional): `open`, `closed`, or `all`
- `head` (string, optional): Filter by head branch

---

#### `merge_pull_request`

Merge a pull request.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `pull_number` (number, required): PR number
- `merge_method` (string, optional): `merge`, `squash`, or `rebase`

---

### Repository Tools

#### `get_repository`

Get repository information.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name

**Response:**
```json
{
  "name": "supply",
  "full_name": "octocat/supply",
  "description": "OctoCAT Supply Chain Management",
  "stars": 42,
  "forks": 7,
  "language": "TypeScript"
}
```

---

#### `search_code`

Search code across repositories.

**Parameters:**
- `query` (string, required): Search query
- `repo` (string, optional): Limit to specific repo (`owner/repo`)

**Example:**
```text
Copilot: "Find all uses of the OrderRepository"
→ Invokes: search_code(
    query="OrderRepository",
    repo="octocat/supply"
  )
```

---

### GitHub Actions Tools

#### `list_workflow_runs`

List workflow runs for a repository.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `workflow_id` (string, optional): Filter by workflow file name
- `status` (string, optional): `queued`, `in_progress`, `completed`

---

#### `get_workflow_run`

Get details of a workflow run.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `run_id` (number, required): Workflow run ID

---

### Dependabot Tools

#### `list_dependabot_alerts`

List Dependabot alerts for a repository.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `state` (string, optional): `open`, `fixed`, or `dismissed`

---

### Code Security Tools

#### `list_code_scanning_alerts`

List code scanning alerts.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `state` (string, optional): `open`, `closed`, or `dismissed`

---

#### `list_secret_scanning_alerts`

List secret scanning alerts.

**Parameters:**
- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `state` (string, optional): `open` or `resolved`

---

### Copilot Spaces Tools

> **Note**: Only available with `github-remote` server when `copilot_spaces` toolset is enabled.

#### `get_copilot_space`

Get contents of a Copilot Space.

**Parameters:**
- `space_name` (string, required): Name of the Copilot Space

**Example:**
```text
Copilot: "Get the contents of the 'Compliance Docs' space"
→ Invokes: get_copilot_space(space_name="Compliance Docs")
```

**Response:**
```json
{
  "name": "Compliance Docs",
  "content": "# Privacy Policy Requirements\n\n...",
  "updated_at": "2026-02-20T10:00:00Z"
}
```

---

## Azure MCP Tools

The Azure MCP server provides access to Azure services and documentation.

### Documentation Tools

#### `documentation`

Search Azure documentation and best practices.

**Parameters:**
- `query` (string, required): Search query
- `service` (string, optional): Filter by Azure service

**Example:**
```text
Copilot: "What are best practices for Azure Container Apps?"
→ Invokes: documentation(
    query="container apps best practices",
    service="container-apps"
  )
```

---

### Resource Management Tools

#### `appservice`

Manage Azure App Service resources.

**Parameters:**
- `action` (string, required): `list`, `get`, `create`, `update`, `delete`
- `resourceGroup` (string, optional): Resource group name
- `name` (string, optional): App service name

---

#### `storage`

Manage Azure Storage accounts.

**Parameters:**
- `action` (string, required): Action to perform
- `resourceGroup` (string, optional): Resource group
- `accountName` (string, optional): Storage account name

---

#### `sql`

Manage Azure SQL databases.

**Parameters:**
- `action` (string, required): Action to perform
- `server` (string, optional): SQL server name
- `database` (string, optional): Database name

---

### Best Practices Tools

#### `get_azure_bestpractices`

Get Azure best practices and recommendations.

**Parameters:**
- `resource` (string, required): Resource type or scenario
- `action` (string, required): Specific action or `all`

**Example:**
```text
Copilot: "Show me best practices for deploying a web app"
→ Invokes: get_azure_bestpractices(
    resource="web-app",
    action="deployment"
  )
```

---

## Using Tools with Copilot

### Natural Language Invocation

You don't need to know tool names or parameters. Copilot translates natural language to tool calls:

```text
User: "Browse to the app and click the cart icon"

Copilot decides:
1. browser_navigate(url="http://localhost:5137")
2. browser_click(selector=".cart-icon")
```

### Tool Approval

VS Code prompts for approval before executing MCP tools:

```
┌─────────────────────────────────────┐
│ GitHub Copilot wants to:            │
│ ✓ browser_navigate                  │
│   url: http://localhost:5137        │
│                                     │
│ [Allow] [Deny] [Always Allow]       │
└─────────────────────────────────────┘
```

**Options:**
- **Allow**: Execute this one time
- **Deny**: Cancel the operation
- **Always Allow**: Skip future prompts for this tool

### Debugging Tool Calls

View tool execution in the MCP output panel:

1. Open Output panel: `Ctrl+Shift+U` or `Cmd+Shift+U`
2. Select **MCP Servers** from dropdown
3. See tool invocations and responses:

```
[2026-02-25 10:30:45] Invoking: browser_navigate
[2026-02-25 10:30:45] Parameters: {"url": "http://localhost:5137"}
[2026-02-25 10:30:46] Response: {"status": "success", "title": "OctoCAT Supply"}
```

---

## Tool Categories Summary

| Category | Primary MCP Server | Tool Count | Use Cases |
|----------|-------------------|------------|-----------|
| **Browser Automation** | Playwright | 20+ | UI testing, screenshots, interaction |
| **GitHub Management** | GitHub | 30+ | Issues, PRs, code search, workflows |
| **Azure Services** | Azure | 50+ | Cloud resources, documentation, best practices |

---

## Next Steps

- **[Usage Examples](./usage-examples.md)**: See tools in action
- **[Troubleshooting](./troubleshooting.md)**: Resolve tool execution issues
- **[Setup Guide](./setup.md)**: Configure MCP servers

---

## Additional Resources

- [Playwright Selector Syntax](https://playwright.dev/docs/selectors)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
