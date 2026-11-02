# Exercise Guide: Weather Tracker with Copilot Agent Mode and MCP

All four steps in one document. Everything runs in a GitHub Codespace, so nothing needs installing locally.

**Total time:** about 40-45 minutes

## Step 1: Open your Codespace and connect the MCP servers

_Welcome to the exercise! 🎉 In the next 45 minutes you'll build a weather tracker by letting Copilot's agent use real tools. Everything happens in a **GitHub Codespace**, so there is nothing to install on your computer._

### Your project rules are already in place

This repository includes `.github/copilot-instructions.md`. Copilot reads it automatically in every chat and agent session. It sets the stack and requires the agent to **use its tools instead of guessing**. Open the file and skim it before you continue.

### What is MCP?

The **Model Context Protocol (MCP)** is an open standard that lets AI agents call external tools through one common interface. An MCP server exposes tools; Copilot's **Agent mode** decides when to call them.

You will connect two servers:

| Server | What it gives the agent | Tools |
|---|---|---|
| **Fetch** | Retrieve live web content | `fetch` |
| **SQLite** | Work with a local database | `list_tables`, `describe_table`, `create_table`, `read_query`, `write_query` |

> **Important idea:** MCP tools are used by the **agent while it develops** (explore, design, seed, verify). The app you ship will have its own SQLite and HTTP code. You'll see this division of labor in the next steps.

> The SQLite server is one of the reference servers from the MCP project and is now archived. It is fine for learning, so you don't need a replacement.

### ⌨️ Activity: Open a Codespace, add `.vscode/mcp.json`, and start the servers

1. Open your repository's main page, click the green **Code** button, select the **Codespaces** tab, and click **Create codespace on main**. Wait about a minute while it builds. When it opens, you'll see VS Code in your browser with Node.js 20, `uv`, and GitHub Copilot already set up.
2. In the Codespace terminal, confirm the tools:

   ```bash
   node -v
   uv --version
   ```

3. Create `.vscode/mcp.json`:

   ```json
   {
     "servers": {
       "sqlite": {
         "type": "stdio",
         "command": "uvx",
         "args": ["--with", "mcp<2", "mcp-server-sqlite", "--db-path", "${workspaceFolder}/weather.db"]
       },
       "fetch": {
         "type": "stdio",
         "command": "uvx",
         "args": ["mcp-server-fetch"]
       }
     }
   }
   ```

   VS Code uses the key **`servers`** (not `mcpServers`, which is for other editors).

   The SQLite server needs `--with` and `mcp<2` in its arguments. Without them, a newer MCP library is installed and the server fails to start with a `list_resources` error.

4. In `mcp.json`, click **Start** above each server and wait for it to show **Running**.
5. Open Copilot Chat, switch the mode dropdown to **Agent**, click the **tools** icon, and confirm the `fetch` and `sqlite` tools are listed and enabled.
6. Commit and push to `main`:

   ```bash
   git add .vscode/mcp.json
   git commit -m "Configure Fetch and SQLite MCP servers"
   git push origin main
   ```

7. Wait about 20 seconds, then go to your repository's **Issues** tab and **refresh this issue** to see the next step.

<details>
<summary>Having trouble? 🤷</summary><br/>

- Tools missing in Agent mode? Restart both servers from `mcp.json`, then run **Developer: Reload Window**.
- Server fails to start? Check the **Output** panel (select the MCP server) and confirm `uv --version` works in the terminal. If not, run **Codespaces: Rebuild Container** from the Command Palette.
- Codespace won't open? Make sure Codespaces is enabled for your account or organization.
- Mona requires valid JSON (no comments or trailing commas) with `servers.sqlite` and `servers.fetch`.
- SQLite server fails with a `list_resources` error? Check that its args include `--with` and `mcp<2` exactly as shown, save the file, and restart the server.
- Business/Enterprise user? Ask your admin to enable the MCP servers policy.

</details>


---

## Step 2: Explore and design with Agent mode

_Both servers are live. Now let the agent work from facts instead of guesses. 🔎_

### Tool-first development

A common agent failure is **inventing** an API response shape or a schema. Your instructions forbid that: the agent must call `fetch` and look at real JSON, then use SQLite tools to create and inspect the database. In this step the agent writes **no application code**. It explores and designs, and you watch it use MCP.

### ⌨️ Activity: Explore the API and design the database

1. Create a working branch in the Codespace terminal:

   ```bash
   git switch -c weather-app
   ```

2. In Copilot Chat (**Agent** mode), paste this prompt:

   ```text
   I'm building a weather tracker. Do NOT write any app code yet. Work in this order:
   1. Use the fetch MCP tool to call the Open-Meteo geocoding API for "Pune", then use the returned coordinates to call the current-weather API (see copilot-instructions.md). Show me the fields we need from the real responses.
   2. Based on the real response, use the SQLite MCP create_table tool to create a table `weather_logs` with: id (integer primary key autoincrement), city (text, not null), country (text), latitude (real), longitude (real), temperature_c (real), humidity (integer), wind_kmh (real), condition (text), weather_code (integer), created_at (text, default current timestamp).
   3. Create an index on (city, created_at) using write_query.
   4. Insert one row for Pune using write_query.
   5. Verify with describe_table and a SELECT, and show me the results.
   6. Save the final CREATE TABLE and CREATE INDEX statements to `db/schema.sql`, and write `docs/api-notes.md` summarizing both endpoints and the JSON fields we use, with one trimmed example response for each.
   ```

3. When the agent asks to run an MCP tool, review the call and click **Allow**. Watch the sequence: fetch → fetch → create_table → write_query → describe_table → read_query.
4. Confirm that `db/schema.sql` and `docs/api-notes.md` exist. A `weather.db` file also appeared, but it's git-ignored.
5. Commit and push your branch:

   ```bash
   git add db docs
   git commit -m "Design weather_logs schema from real API data"
   git push -u origin weather-app
   ```

6. Wait about 20 seconds, then **refresh this page**.

<details>
<summary>Having trouble? 🤷</summary><br/>

- Agent skipped the tools and guessed? Re-prompt: _"Use the fetch MCP tool. Don't assume the response format."_
- No results for a city? Open-Meteo needs an exact spelling. "Pune" and "London" work well.
- The branch must be named `weather-app`. Mona checks that `db/schema.sql` contains the `weather_logs` table and an index, and that `docs/api-notes.md` exists.
- The agent can't run the tools? Make sure the `fetch` and `sqlite` tools are enabled in the tools picker.

</details>


---

## Step 3: Build the CLI and open a pull request

_The database exists and the API is understood. Now the agent can build with confidence. 🛠️_

### Why the prompt can be short

Your instructions already specify the stack, the API URLs, and the safety rules, and the agent can read the live schema with `describe_table`. The prompt only has to describe **what** to build.

### ⌨️ Activity: Build the CLI with Agent mode

1. Stay on the `weather-app` branch. In Agent mode, paste:

   ```text
   Now build the app. Create a Node.js CLI in `src/` using the existing weather.db schema (check it with describe_table first). Requirements:
   - `node src/cli.js add "<city>"`: geocode the city, fetch current weather from Open-Meteo, map weather_code to a readable condition (clear, cloudy, fog, rain, snow, thunderstorm, etc.), and insert a row.
   - `node src/cli.js list [--limit N]`: show recent logs as a formatted table.
   - `node src/cli.js stats "<city>"`: show min, max, and average temperature and the number of logs for that city.
   - Split the code into `src/db.js`, `src/weather.js`, and `src/cli.js`.
   - Install dependencies (better-sqlite3), add npm scripts (`add`, `list`, `stats`), and add a README section with usage examples.
   - Handle an unknown city and network errors gracefully.
   Then run `node src/cli.js add "London"` and `node src/cli.js add "Tokyo"` in the terminal to prove it works.
   ```

2. Approve the terminal commands when asked. Then run it yourself:

   ```bash
   npm run list
   npm run stats -- "London"
   node src/cli.js add "Xyzabcnotacity"
   ```

   The last command should print a friendly message, not a stack trace.

3. Commit and push:

   ```bash
   git add .
   git commit -m "Add weather CLI"
   git push
   ```

4. Open a **pull request** from `weather-app` into `main`.
5. Wait about 20 seconds, then **refresh this page**.

<details>
<summary>Having trouble? 🤷</summary><br/>

- `better-sqlite3` install fails? Use Node 20 or 22 LTS, or ask the agent to use Node's built-in `node:sqlite` (Node 22.5+) instead.
- Mona checks that `src/cli.js`, `src/db.js`, and `src/weather.js` exist and pass `node --check`, and that `package.json` lists `better-sqlite3`.
- Open the pull request **after** pushing. Mona runs when the PR is opened.
- If you already opened the PR before the files were pushed, close it and open a new one.

</details>


---

## Step 4: Add the dashboard, verify with MCP, and merge

_The CLI works. Finish the app, then use MCP once more as an independent checker. 🚀_

### The payoff

At the start, MCP helped the agent **design**. Now it helps you **verify**: the agent queries the database directly and reports on what your CLI and web UI really wrote, without trusting the app's own code.

### ⌨️ Activity: Dashboard, verification, merge

1. On the `weather-app` branch, paste this prompt in Agent mode:

   ```text
   Add a web dashboard:
   - `src/server.js` using Node's built-in http module on port 3000, with endpoints: GET /api/logs (latest 50), GET /api/summary (per-city latest temp, average temp, log count), and POST /api/refresh?city=NAME (fetches and saves new weather using the existing weather.js and db.js).
   - `public/index.html`: a single page with a city input and an "Add / Refresh" button, a table of recent logs, summary cards per city, and a temperature line chart using Chart.js from a CDN.
   - Add `npm start` to run the server.
   - Reuse the existing modules; don't duplicate logic.
   Start the server and tell me the URL.
   ```

2. When the server starts, Codespaces shows a notification for port 3000. Click **Open in Browser** (or open the **Ports** tab and click the globe icon next to port 3000). Add **Mumbai** from the page and watch the table and chart update.
3. Now verify through MCP with this prompt:

   ```text
   Use the SQLite MCP server to:
   1. List every city in weather_logs with its row count and average temperature.
   2. Confirm that the rows added through the CLI and the web UI are present.
   3. Check for anomalies (null values, duplicate timestamps for the same city).
   Save a short summary table and your findings to `docs/verification.md`.
   ```

4. Commit and push to the pull request:

   ```bash
   git add .
   git commit -m "Add dashboard and MCP verification report"
   git push
   ```

5. Review the pull request's **Files changed** tab (you're the human in the loop), then **merge** it into `main`.
6. Wait about 20 seconds, then **refresh this page**.

<details>
<summary>Having trouble? 🤷</summary><br/>

- Mona checks the merged `main` branch for `src/server.js`, a `public/index.html` that references Chart.js, and `docs/verification.md` that mentions `weather_logs`.
- No notification? Open the **Ports** tab, find port 3000, and click the globe icon. Port busy? Ask the agent to use another port.
- Chart is empty? Add the same city two or three times so there is more than one data point.
- Forgot something before merging? Commit the missing file directly to `main`; Mona re-checks on every push.

</details>


---

## Finish

_Congratulations, you built and merged a working app with Copilot's agent and MCP! 🎉_

### What you learned

- **Custom instructions** shape every agent session, so later prompts stay short.
- **MCP servers** give the agent real capabilities. Fetch gave it live data and SQLite gave it a real database.
- **Agent mode** plans, picks tools, runs commands, and iterates, while you approve each tool call.
- **Tool-first development** (explore, design, build, verify) produces code grounded in facts instead of guesses.
- **Division of labor:** MCP serves the agent at development time, and your shipped app has its own code for the same tasks.

### What's next?

- Add the **GitHub MCP server** and ask the agent to open an issue for "add weather alerts".
- Add a `--watch` flag that refreshes a city every 10 minutes.
- Swap SQLite for **PostgreSQL** MCP, or rebuild the exercise in Python.
- Learn more: [MCP in VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers), [Model Context Protocol](https://modelcontextprotocol.io), [Open-Meteo docs](https://open-meteo.com/en/docs).

### Review and share

Star the repository, share what you built, and explore more exercises at [GitHub Skills](https://skills.github.com).
