# MCP Usage Examples and Tutorials

This guide provides practical, step-by-step examples for using MCP servers with the OctoCAT Supply demo application.

## Table of Contents

- [Getting Started](#getting-started)
- [Playwright Examples](#playwright-examples)
- [GitHub Examples](#github-examples)
- [Azure Examples](#azure-examples)
- [Advanced Scenarios](#advanced-scenarios)
- [Demo Scripts](#demo-scripts)

---

## Getting Started

### Prerequisites

Before running these examples:

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Verify application is running**:
   - Frontend: http://localhost:5137
   - API: http://localhost:3000

3. **Start MCP servers**:
   - Playwright: `Ctrl+Shift+P` → `MCP: List servers` → `playwright` → `Start server`
   - GitHub: Start `github-remote` or `github-local`
   - Azure: Start `Azure MCP Server` (if needed)

4. **Enable Agent Mode** in Copilot Chat:
   - Click the mode selector
   - Choose **Agent**

---

## Playwright Examples

### Example 1: Basic Navigation and Screenshot

**Objective**: Navigate to the frontend and capture a screenshot.

**Steps**:

1. In Copilot Chat, enter:
   ```text
   Browse to http://localhost:5137 and take a screenshot
   ```

2. **What happens**:
   - Copilot invokes `browser_navigate` with `url="http://localhost:5137"`
   - Browser opens and loads the page
   - Copilot invokes `browser_take_screenshot`
   - Screenshot is saved (usually as `screenshot.png`)

3. **Expected result**:
   - Screenshot file appears in your workspace
   - Copilot confirms: "I've taken a screenshot of the homepage"

**Troubleshooting**:
- If page won't load, verify frontend is running: `npm run dev:frontend`
- If browser doesn't open, check Playwright installation: `npx playwright install`

---

### Example 2: Testing Product Search

**Objective**: Test the search functionality by searching for products.

**Steps**:

1. Navigate to the application:
   ```text
   Browse to http://localhost:5137
   ```

2. Interact with the search feature:
   ```text
   Find the search input, type "laptop" and press Enter
   ```

3. **What Copilot does**:
   ```javascript
   // Equivalent tool calls:
   browser_navigate(url="http://localhost:5137")
   browser_fill(selector="input[type='search']", value="laptop")
   browser_press_key(key="Enter")
   ```

4. Verify results:
   ```text
   Take a screenshot of the search results
   ```

**Real-world scenario**: Validate that search is working correctly after code changes.

---

### Example 3: Shopping Cart Workflow

**Objective**: Full end-to-end test of adding items to cart.

**Full prompt**:
```text
Browse to http://localhost:5137, click on the first product, 
add it to cart, then navigate to the cart page and verify 
the item is there. Take screenshots at each step.
```

**What Copilot orchestrates**:

1. `browser_navigate(url="http://localhost:5137")`
2. `browser_screenshot(path="01-homepage.png")`
3. `browser_click(selector=".product-card:first-child")`
4. `browser_screenshot(path="02-product-page.png")`
5. `browser_click(selector=".add-to-cart-button")`
6. `browser_click(selector=".cart-icon")`
7. `browser_screenshot(path="03-cart-page.png")`
8. `browser_evaluate(script="() => document.querySelectorAll('.cart-item').length")`

**Result**: You get a visual record of the entire user journey plus validation that items are in the cart.

---

### Example 4: Responsive Testing

**Objective**: Test the application at different screen sizes.

**Steps**:

1. Test mobile view:
   ```text
   Resize browser to iPhone 13 size (390x844) and browse to http://localhost:5137
   ```

2. Test tablet view:
   ```text
   Resize to iPad size (768x1024) and take a screenshot
   ```

3. Test desktop view:
   ```text
   Resize to 1920x1080 and take a screenshot
   ```

**What Copilot does**:
```javascript
browser_resize(width=390, height=844)
browser_navigate(url="http://localhost:5137")
browser_screenshot(path="mobile-view.png")

browser_resize(width=768, height=1024)
browser_screenshot(path="tablet-view.png")

browser_resize(width=1920, height=1080)
browser_screenshot(path="desktop-view.png")
```

**Use case**: Verify responsive design works across devices.

---

### Example 5: Form Testing

**Objective**: Test the order creation form (if available).

**Steps**:

```text
Navigate to the orders page, fill in the new order form with:
- Supplier: "TechCorp"
- Quantity: 50
Then submit the form and verify success message appears
```

**What Copilot does**:
1. Navigates to orders page
2. Fills form fields using `browser_fill`
3. Submits form using `browser_click` on submit button
4. Waits for success message with `browser_wait_for`
5. Confirms success with `browser_screenshot` or `browser_evaluate`

---

### Example 6: Console Error Detection

**Objective**: Check for JavaScript errors after page load.

**Prompt**:
```text
Browse to http://localhost:5137 and show me any console errors
```

**What Copilot does**:
```javascript
browser_navigate(url="http://localhost:5137")
browser_console_messages(level="error")
```

**Sample response**:
```
Found 0 console errors. The page loaded successfully!
```

**Use case**: Quick health check after deploying changes.

---

### Example 7: Network Request Monitoring

**Objective**: Validate API calls are working.

**Prompt**:
```text
Navigate to http://localhost:5137, then show me all API requests 
made to the /api/products endpoint
```

**What Copilot does**:
```javascript
browser_navigate(url="http://localhost:5137")
browser_network_requests(filter="/api/products")
```

**Sample response**:
```json
[
  {
    "url": "http://localhost:3000/api/products",
    "method": "GET",
    "status": 200,
    "duration": 45
  }
]
```

**Use case**: Debug API integration issues or verify correct endpoints are being called.

---

## GitHub Examples

### Example 1: List My Issues

**Objective**: See what issues are assigned to you.

**Prerequisites**: GitHub MCP server running (either variant).

**Prompt**:
```text
Show me all issues assigned to me in this repository
```

**What Copilot does**:
```javascript
list_issues(
  owner="<detected-from-git>",
  repo="<detected-from-git>",
  assignee="@me",
  state="open"
)
```

**Sample response**:
```
Found 3 open issues assigned to you:
1. #42 - Improve API test coverage
2. #43 - Add cart functionality
3. #44 - Fix responsive layout on mobile
```

---

### Example 2: Create an Issue

**Objective**: Create a new issue with detailed information.

**Prompt**:
```text
Create an issue in my repo titled "Add product filtering" with 
the description "Users should be able to filter products by category 
and price range" and label it as "enhancement"
```

**What Copilot does**:
```javascript
create_issue(
  owner="<detected>",
  repo="<detected>",
  title="Add product filtering",
  body="Users should be able to filter products by category and price range",
  labels=["enhancement"]
)
```

**Result**:
```
✓ Created issue #45: Add product filtering
  https://github.com/octocat/supply/issues/45
```

---

### Example 3: Search Code

**Objective**: Find where a specific function is used.

**Prompt**:
```text
Search the codebase for all uses of "OrderRepository"
```

**What Copilot does**:
```javascript
search_code(
  query="OrderRepository",
  repo="octocat/supply"
)
```

**Sample response**:
```
Found 8 results:
- api/src/repositories/ordersRepo.ts (class definition)
- api/src/routes/order.ts (import and usage)
- api/src/index.ts (initialization)
- ... (5 more)
```

**Use case**: Code navigation and understanding dependencies.

---

### Example 4: Create a Pull Request

**Objective**: Create a PR for a feature branch.

**Prerequisites**: You have a feature branch with commits.

**Prompt**:
```text
Create a pull request from my "feature/cart" branch to main 
titled "Implement shopping cart functionality"
```

**What Copilot does**:
```javascript
create_pull_request(
  owner="octocat",
  repo="supply",
  title="Implement shopping cart functionality",
  head="feature/cart",
  base="main",
  body="Implements shopping cart features from issue #43"
)
```

**Result**:
```
✓ Created PR #12: Implement shopping cart functionality
  https://github.com/octocat/supply/pull/12
```

---

### Example 5: Check Workflow Status

**Objective**: See if CI/CD pipelines are passing.

**Prompt**:
```text
Show me the recent workflow runs for this repository
```

**What Copilot does**:
```javascript
list_workflow_runs(
  owner="octocat",
  repo="supply",
  status="completed"
)
```

**Sample response**:
```
Recent workflow runs:
1. ✓ Build and Test (main) - Passed (2 min ago)
2. ✓ Build and Test (PR #12) - Passed (15 min ago)
3. ✗ Build and Test (PR #11) - Failed (1 hour ago)
```

---

### Example 6: Dependabot Alerts

**Objective**: Check for vulnerable dependencies.

**Prompt**:
```text
List all open Dependabot alerts for this repository
```

**What Copilot does**:
```javascript
list_dependabot_alerts(
  owner="octocat",
  repo="supply",
  state="open"
)
```

**Sample response**:
```
Found 2 Dependabot alerts:
1. express - Moderate severity (CVE-2024-XXXX)
2. axios - Low severity (CVE-2024-YYYY)
```

---

### Example 7: Using Copilot Spaces (GitHub Remote Only)

**Objective**: Check code against compliance requirements stored in a Copilot Space.

**Prerequisites**:
- `github-remote` server with `copilot_spaces` toolset enabled
- A Copilot Space named "Compliance Docs"

**Prompt**:
```text
Get the contents of the Copilot Space "Compliance Docs" and check 
if my privacy policy implementation complies
```

**What Copilot does**:
```javascript
get_copilot_space(space_name="Compliance Docs")
// Then analyzes your code against the space content
```

**Use case**: Ensure code changes meet organizational standards or regulatory requirements.

---

## Azure Examples

### Example 1: Azure Best Practices

**Objective**: Get guidance on deploying the application to Azure.

**Prompt**:
```text
What are the best practices for deploying this Node.js application 
to Azure App Service?
```

**What Copilot does**:
```javascript
get_azure_bestpractices(
  resource="app-service",
  action="deployment"
)
```

**Sample response**:
```
Azure App Service best practices for Node.js:
1. Use environment variables for configuration
2. Enable Application Insights for monitoring
3. Configure auto-scaling based on load
4. Use deployment slots for zero-downtime updates
5. Enable HTTPS only
... (detailed recommendations)
```

---

### Example 2: Container Apps Guidance

**Objective**: Understand how to containerize and deploy.

**Prompt**:
```text
Show me Azure best practices for deploying containerized applications
```

**What Copilot does**:
```javascript
documentation(
  query="container apps deployment best practices",
  service="container-apps"
)
```

**Result**: Comprehensive guidance on Azure Container Apps configuration.

---

### Example 3: Storage Best Practices

**Objective**: Decide on storage solution for SQLite database.

**Prompt**:
```text
What's the best way to persist SQLite data in Azure App Service?
```

**What Copilot does**:
```javascript
get_azure_bestpractices(
  resource="app-service",
  action="storage"
)
```

**Sample response**:
```
For SQLite persistence in Azure App Service:
1. Mount Azure Files as a volume
2. Configure writable directory (e.g., /home/site/data)
3. Set DB_FILE environment variable to the mounted path
4. Enable backup for the file share
5. Consider Azure SQL Database for production workloads
```

---

## Advanced Scenarios

### Scenario 1: Full Feature Validation

**Objective**: Test a complete user journey from search to checkout.

**Prompt**:
```text
Perform a complete test of the shopping flow:
1. Navigate to the homepage
2. Search for "laptop"
3. Click the first result
4. Add to cart
5. View cart
6. Verify item is in cart
Take screenshots at each major step and report any errors
```

**What happens**: Copilot orchestrates 10+ tool calls across navigation, interaction, validation, and capture.

**Result**: Comprehensive test report with visual evidence.

---

### Scenario 2: Issue-to-PR Workflow

**Objective**: Create an issue, implement a fix, and open a PR.

**Steps**:

1. **Create issue**:
   ```text
   Create an issue titled "Fix mobile navigation menu" with label "bug"
   ```

2. **Implement fix** (manually or with Copilot assistance)

3. **Create PR**:
   ```text
   Create a pull request from my feature branch that fixes issue #XX
   ```

**Use case**: Complete development workflow automation.

---

### Scenario 3: Compliance Checking

**Objective**: Validate code changes meet compliance requirements.

**Prerequisites**: Copilot Spaces with compliance documentation.

**Prompt**:
```text
Get our compliance requirements from Copilot Space "Legal Standards",
then review the privacy policy implementation in frontend/src/components/PrivacyPolicy.tsx
and report any missing requirements
```

**What Copilot does**:
1. Fetches Copilot Space content
2. Reads the implementation file
3. Compares implementation against requirements
4. Reports gaps

**Result**: Detailed compliance report with action items.

---

### Scenario 4: Multi-Browser Testing

**Objective**: Test across different browsers.

**Prompt**:
```text
Test the homepage on Chrome, Firefox, and Edge. For each browser:
1. Navigate to http://localhost:5137
2. Take a screenshot
3. Check for console errors
Report any browser-specific issues
```

**Note**: Requires multiple Playwright server configurations (one per browser).

**Result**: Cross-browser compatibility report.

---

### Scenario 5: Performance Monitoring

**Objective**: Analyze page load performance.

**Prompt**:
```text
Navigate to http://localhost:5137 and measure:
- All network requests
- Page load time
- Any resources that take longer than 1 second
Report performance metrics
```

**What Copilot does**:
```javascript
browser_navigate(url="http://localhost:5137")
browser_network_requests()
browser_evaluate(script="() => performance.timing")
```

**Result**: Performance report with slow resources identified.

---

## Demo Scripts

### Quick Demo: Playwright Integration (5 minutes)

**Goal**: Show browser automation capabilities.

**Script**:

1. **Setup**:
   - Start application: `npm run dev`
   - Start Playwright MCP server

2. **Demo**:
   ```text
   Copilot: "Browse to http://localhost:5137 and show me the page title"
   ```
   ✓ Browser opens, shows homepage
   
   ```text
   Copilot: "Take a screenshot of the page"
   ```
   ✓ Screenshot saved
   
   ```text
   Copilot: "Click on the Products link and take another screenshot"
   ```
   ✓ Navigates and captures

3. **Talking points**:
   - "Natural language → browser actions"
   - "No test code required"
   - "Great for exploratory testing"

---

### Quick Demo: GitHub Integration (5 minutes)

**Goal**: Show GitHub API automation.

**Script**:

1. **Setup**:
   - Start GitHub MCP server (remote or local)
   - Have PAT ready if using local

2. **Demo**:
   ```text
   Copilot: "Show me open issues in this repository"
   ```
   ✓ Lists issues
   
   ```text
   Copilot: "Create an issue for improving documentation"
   ```
   ✓ Issue created
   
   ```text
   Copilot: "Assign that issue to me"
   ```
   ✓ Issue assigned

3. **Talking points**:
   - "GitHub automation from chat"
   - "No context switching to GitHub.com"
   - "Works with Enterprise features too"

---

### Full Demo: End-to-End Workflow (15 minutes)

**Goal**: Show complete development workflow with MCP.

**Script**:

1. **Discovery**:
   ```text
   "Search the codebase for 'cart' to see what's already implemented"
   ```

2. **Planning**:
   ```text
   "Create an issue for implementing cart persistence with localStorage"
   ```

3. **Development**:
   - Use Copilot to generate code (standard Copilot features)

4. **Testing**:
   ```text
   "Navigate to the app, add items to cart, refresh the page, 
   and verify items are still there"
   ```

5. **Quality Check**:
   ```text
   "Check for console errors and network failures"
   ```

6. **Deployment Prep**:
   ```text
   "What are Azure best practices for deploying this application?"
   ```

7. **Documentation**:
   ```text
   "Create a pull request with description explaining the changes"
   ```

**Talking points**:
- "Full SDLC in one interface"
- "MCP extends Copilot beyond code"
- "Integrated testing, deployment, project management"

---

## Tips for Effective MCP Usage

### Be Specific

✗ **Vague**: "Test the app"  
✓ **Specific**: "Navigate to http://localhost:5137, search for 'laptop', and verify results appear"

### Use Sequential Steps

✗ **Complex**: "Test everything and create issues for failures"  
✓ **Sequential**:
1. "Test the homepage"
2. "Test the search feature"
3. "Create an issue if you found any problems"

### Leverage Screenshots

Always ask for screenshots when visual confirmation is needed:
```text
"Take a screenshot after each action so we can see what happened"
```

### Combine with Standard Copilot

Use MCP tools alongside standard Copilot features:
```text
"Generate a Playwright test file based on the browser actions 
we just performed manually"
```

### Handle Errors Gracefully

If a tool fails:
```text
"If the element isn't found, take a screenshot so we can identify the correct selector"
```

---

## Next Steps

After mastering these examples:

1. **Explore [Tools Reference](./tools-reference.md)** for all available tools
2. **Review [Troubleshooting Guide](./troubleshooting.md)** for common issues
3. **Create custom prompts** for your frequent workflows
4. **Share examples** with your team

---

## Contributing Examples

Have a great MCP workflow? Share it!

1. Fork this repository
2. Add your example to this file
3. Include:
   - Clear objective
   - Prerequisites
   - Step-by-step instructions
   - Expected results
   - Use case / talking points
4. Submit a pull request

---

## Additional Resources

- [Demo Walkthroughs](../../demo/walkthroughs/copilot.md) - Full demo scripts
- [Setup Guide](./setup.md) - Configure MCP servers
- [Quick Reference](./README.md) - MCP overview
