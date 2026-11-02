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
