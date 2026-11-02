# Weather Tracker with Copilot Agent Mode and MCP

_Give GitHub Copilot real tools: let the agent fetch live data and design a real database through MCP servers, then build and merge a working app, all in a Codespace._

## Welcome

- **Who is this for**: Developers who have used Copilot Chat and want to see what happens when the agent can call real tools instead of guessing.
- **What you'll learn**: Connecting MCP servers, Copilot **Agent mode**, a tool-first workflow (explore, design, build, verify), and shipping the result through a pull request.
- **What you'll build**: **Mona's Weather Tracker**, a Node.js CLI plus a small web dashboard that logs weather for any city into a SQLite database, using the free Open-Meteo API (no API key).
- **Prerequisites**:
  * A GitHub account with a GitHub Copilot subscription (Free, Pro, Pro+, Business, or Enterprise)
  * **Nothing to install.** The exercise runs in **GitHub Codespaces**, which provides VS Code in your browser with Node.js 20, `uv`, and the Copilot extensions already set up. GitHub's free monthly Codespaces allowance is normally sufficient.
  * If you're on Business or Enterprise, your admin must allow **Codespaces** and **MCP servers**
  * Basic familiarity with Git, branches, and pull requests
- **How long**: Roughly **40-45 minutes**.

In this exercise, you will:

1. Open a **Codespace** and connect two **MCP servers** (Fetch and SQLite).
2. Use **Agent mode** to **explore** a live API and **design** a database before any app code exists.
3. Have the agent **build a CLI**, then open a pull request.
4. Add a **web dashboard**, **verify** the data through MCP, and **merge**.

### What you'll end up with

```
You ──prompt──▶ Copilot Agent Mode
                  ├─▶ Fetch MCP   ─▶ Open-Meteo API (real JSON)
                  ├─▶ SQLite MCP  ─▶ weather.db (create, seed, verify)
                  └─▶ Edits files ─▶ CLI app + web dashboard
```

| Step | Topic | Time |
|---|---|---|
| 1 | Open a Codespace and connect MCP servers | ~10 min |
| 2 | Explore and design with Agent mode | ~10 min |
| 3 | Build the CLI, open a pull request | ~12 min |
| 4 | Dashboard, verify with MCP, merge | ~12 min |

### How to start this exercise

1. Click the button below to copy this exercise to your account. Keep the repository **public**, then click **Create repository**.

   [![](https://img.shields.io/badge/Copy%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/new?template_owner=siddhantikakde-office&template_name=skills-weather-tracker-mcp-template&owner=%40me&name=skills-weather-tracker-mcp&description=Exercise:+Weather+Tracker+with+Copilot+Agent+Mode+and+MCP&visibility=public)

2. Give Mona about **20 seconds** to prepare the first lesson, then open the **Issues** tab of your new repository and open the issue titled **Exercise: Build a Weather Tracker with Copilot Agent Mode and MCP**.

**Having trouble? 🤷**

- For owner, choose your personal account or an organization.
- Use a **public** repository so Actions minutes are free.
- If the issue doesn't appear in 20 seconds, check the **Actions** tab for a running or failed job.

---

© 2026 • [MIT License](LICENSE)
