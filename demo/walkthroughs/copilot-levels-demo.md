# GitHub Copilot Levels Demo
## Unit Tests & Documentation — Customer Walkthrough

**Theme:** Show how the same task (writing tests / adding docs) gets progressively better as you give Copilot more structured context. Every level uses the same target file (`api/src/routes/supplier.ts`) to keep the comparison clean.

**Pre-demo checklist:**
- [ ] VS Code open on this repo, Copilot Chat visible
- [ ] `api/src/routes/supplier.ts` open in the editor
- [ ] GitHub Actions tab open in a browser tab (for Level 5)
- [ ] Secret `COPILOT_CLI_TOKEN` added to repo settings (for Level 5) — see [Setup: Agentic Workflow](#setup-agentic-workflow)
- [ ] Copilot Coding Agent enabled: *Settings → Copilot → Coding Agent → Allow Copilot to open pull requests*

---

## Level 1 — Just a Prompt

> **Talking point:** _"This is where most developers start. You just ask Copilot in plain language."_

### What to do

1. Open Copilot Chat (`Ctrl+Alt+I`)
2. Make sure `agent` mode is selected (top-left dropdown)
3. Type this prompt and send:

```
Write unit tests for the supplier route
```

4. Show the output to the audience. Note what Copilot produces: it probably writes **some** tests, but:
   - May not use the repo's `supertest` + in-memory SQLite pattern
   - Likely misses error-path tests (404, 422, 409)
   - May guess at the import paths
   - Probably inconsistent with `branch.test.ts`

5. Now send a **second** richer prompt in the same chat:

```
Write comprehensive Vitest unit tests for api/src/routes/supplier.ts.
Use supertest against an in-memory better-sqlite3 database with migrations applied in beforeEach.
Cover happy paths (200/201) and error paths (404, 422, 409).
Follow the pattern in api/src/routes/branch.test.ts.
```

6. Show the **improved** output.

**Contrast moment:** _"Same Copilot. Same model. The only difference is how much context we gave it. Imagine doing this consistently across a team without having to write that context every time."_

---

## Level 2 — Prompt Files

> **Talking point:** _"Prompt files let you save reusable instructions so you don't have to type context every time. They appear as slash commands in Copilot Chat."_

### What to do

1. In Copilot Chat, type `/` and point out the new prompt commands that appear:
   - `/unit-test-minimal`
   - `/unit-test-comprehensive`
   - `/docs-basic`
   - `/docs-thorough`

2. **Demo: Minimal vs. Comprehensive (Unit Tests)**

   a. Select `/unit-test-minimal`, add `api/src/routes/supplier.ts` and send.
   Show the result: happy-path only, no DB setup, short.

   b. Then select `/unit-test-comprehensive`, add `api/src/routes/supplier.ts` and send.
   Show the result: full setup, error paths, camelCase assertions, file placement.

   > _"Same file. One prompt file, two completely different quality levels. This is what the developer experience looks like when you standardize prompts."_

3. **Demo: Basic vs. Thorough (Documentation)**

   a. Select `/docs-basic`, add `api/src/repositories/suppliersRepo.ts` and send.
   Show: one-line comments, nothing else.

   b. Select `/docs-thorough`, add `api/src/repositories/suppliersRepo.ts` and send.
   Show: full TSDoc with `@param`, `@returns`, `@throws`, `@example`, and Swagger JSDoc blocks.

   > _"The comprehensive prompt knows about this repo's TSDoc standard, the Swagger pattern, the exact error class names. Nobody has to remember all of that — it's encoded in the prompt file."_

### Where these files live
```
.github/prompts/
  unit-test-minimal.prompt.md
  unit-test-comprehensive.prompt.md
  docs-basic.prompt.md
  docs-thorough.prompt.md
```

---

## Level 3 — Custom Agents

> **Talking point:** _"Agents persist across an entire conversation. They have a persona, keep context, and can call tools autonomously — no slash command needed for each step."_

### What to do

1. In Copilot Chat, open the **agent picker** (the `@` dropdown or chat mode selector)
2. Show the new agents alongside the existing ones:
   - `@unit-test-basic` / `@unit-test-expert`
   - `@docs-basic` / `@docs-expert`
   - (existing) `@api-specialist`, `@bdd-specialist`, `@Gilfoyle`

3. **Demo: Unit Test Expert Agent**

   a. Switch to `@unit-test-expert`
   b. Send: `Write tests for the orders route`
   c. The agent automatically reads `branch.test.ts` as a reference, identifies the router factory, and produces a full suite.

   > _"Notice the agent didn't need me to tell it about the test framework, the DB setup pattern, or where to put the file. That knowledge lives in the agent definition."_

4. **Demo: Docs Expert Agent**

   a. Switch to `@docs-expert`
   b. Send: `Document the deliveries repository`
   c. The agent reads the reference files, identifies gaps, and fills in full TSDoc + Swagger blocks.

5. **Contrast with basic agents**

   Switch to `@unit-test-basic` or `@docs-basic` and ask the same question. Show the difference in depth.

   > _"This is how you give different developers access to different quality levels — intern vs. senior engineer — without changing Copilot itself."_

### Where these files live
```
.github/agents/
  unit-test-basic.agent.md
  unit-test-expert.agent.md
  docs-basic.agent.md
  docs-expert.agent.md
```

---

## Level 4 — GitHub / Agent Skills

> **Talking point:** _"Skills are like agents, but they're an open standard. They work in VS Code, Copilot CLI, and the Copilot Coding Agent. You create them once and they are portable across all tools."_

### What to do

1. In Copilot Chat, type `/` — show that skills appear alongside prompt files:
   - `/vitest-unit-tests`
   - `/tsdoc-api-docs`

2. **Demo: vitest-unit-tests skill**

   a. Type `/vitest-unit-tests api/src/routes/order.ts`
   
   Point out that the skill:
   - Teaches Copilot the test stack without repeating it each session
   - References `./test-template.ts` inside the skill directory as a scaffold
   - Works in VS Code Chat, Copilot CLI (`copilot -p "/vitest-unit-tests ..."`) AND the Copilot Coding Agent

3. **Demo: tsdoc-api-docs skill**

   a. Type `/tsdoc-api-docs api/src/repositories/ordersRepo.ts`
   
   Point out that the skill:
   - References `./doc-template.md` for copy-paste TSDoc and Swagger blocks
   - Includes a validation checklist Copilot must complete before finishing
   - Auto-loads when Copilot detects you're working on a repository file (no slash command needed)

4. **Show the skill directory structure:**
   ```
   .github/skills/
     vitest-unit-tests/
       SKILL.md            ← instructions + auto-load description
       test-template.ts    ← scaffold Copilot can reference
     tsdoc-api-docs/
       SKILL.md
       doc-template.md     ← TSDoc + Swagger copy-paste templates
   ```

   > _"Skills can include scripts, templates, and examples — not just instructions. And because it's an open standard, you can pull community skills from github/awesome-copilot."_

---

## Level 5 — Agentic Workflow (GitHub Actions + Copilot CLI)

> **Talking point:** _"Now we remove the human from the loop entirely. Every time a developer pushes code, Copilot automatically analyzes the diff, decides if tests or docs are needed, creates a GitHub Issue, and assigns itself to fix it."_

### Setup: Agentic Workflow

Before this demo works, these one-time steps must be completed:

1. **Create a fine-grained PAT** at https://github.com/settings/personal-access-tokens/new
   - Permissions → Account permissions → **Copilot Requests**: Read and write
   - Repository access: this repo

2. **Add the secret** to the repo:
   - *Settings → Secrets and variables → Actions → New repository secret*
   - Name: `COPILOT_CLI_TOKEN`
   - Value: the PAT from step 1

3. **Enable Copilot Coding Agent**:
   - *Settings → Copilot → Coding Agent → Allow Copilot to open pull requests*

### What to do

1. Show the two new workflows in `.github/workflows/`:
   ```
   generate-tests.yml    ← triggers on push, analyzes test coverage
   generate-docs.yml     ← triggers on push, analyzes documentation gaps
   ```

2. Show the prompt templates they use:
   ```
   .github/prompts/analyze-for-tests.prompt.md
   .github/prompts/analyze-for-docs.prompt.md
   ```
   Highlight the **`{COMMIT_SHA}`** and **`{REPOSITORY}`** placeholders — the workflow substitutes real values at runtime.

3. **Live demo: push a code change**

   Make a small addition to any route or repository file (e.g. add a new endpoint stub to `api/src/routes/supplier.ts`), commit, and push to a branch:
   ```bash
   git checkout -b demo/agentic-test
   # make a tiny change to api/src/routes/supplier.ts
   git add . && git commit -m "demo: add stub endpoint"
   git push origin demo/agentic-test
   ```

4. Switch to the browser → **Actions tab** — show both workflows running.

5. When they complete (~1–2 min), go to the **Issues tab** — show:
   - Issue titled `🧪 Unit tests needed: ...` created by the workflow
   - Issue titled `📚 Documentation needed: ...` created by the workflow
   - Both assigned to **@Copilot** automatically

6. Click on one issue → click **Assign to Copilot** (if not already auto-assigned) → show Copilot opening a pull request.

   > _"Zero developer intervention. Push code, get a PR with tests. This scales across the entire team and works 24/7."_

### How it works (architecture)
```
git push
  └─► GitHub Actions triggers generate-tests.yml
        └─► Copilot CLI installed
              └─► commit diff loaded into context
                    └─► prompt template sent to Copilot with MCP github tools
                          └─► Copilot reasons about coverage
                                └─► if score ≥ 60: creates Issue + assigns @copilot
                                      └─► Copilot Coding Agent opens a PR
```

---

## Summary: The Progression

| Level | What you provide | Output quality | Automation |
|---|---|---|---|
| 1 — Just a prompt | Plain English sentence | Unpredictable | None |
| 2 — Prompt files | Saved, reusable instructions | Consistent + comparable | Slash command |
| 3 — Custom agents | Persona + persistent system prompt | Deep, context-aware | Auto per session |
| 4 — Agent Skills | Portable instructions + companion resources | Portable + composable | Auto-loaded on relevance |
| 5 — Agentic workflow | GitHub Actions + Copilot CLI | Fully autonomous | Triggered by every push |

> **Closing talking point:** _"Copilot is only as good as the context you give it. These tools — prompt files, agents, skills, agentic workflows — are how you scale that context across your entire organization, consistently, without relying on each developer to remember the right instructions."_
