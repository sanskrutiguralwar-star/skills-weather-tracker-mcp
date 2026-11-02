# 1. Pin the MCP library for the SQLite server in the step and the guide
sed -i 's|\["mcp-server-sqlite", "--db-path"|["--with", "mcp<2", "mcp-server-sqlite", "--db-path"|' .github/steps/1-step.md
perl -0pi -e 's/(   VS Code uses the key \*\*`servers`\*\*[^\n]*\n)/$1\n   The SQLite server needs `--with` and `mcp<2` in its arguments. Without them, a newer MCP library is installed and the server fails to start with a `list_resources` error.\n/' .github/steps/1-step.md
perl -0pi -e 's/(- Mona requires valid JSON[^\n]*\n)/$1- SQLite server fails with a `list_resources` error? Check that its args include `--with` and `mcp<2` exactly as shown, save the file, and restart the server.\n/' .github/steps/1-step.md

# 2. Regenerate the all-in-one guide from the step files
{
  printf '# Exercise Guide: Weather Tracker with Copilot Agent Mode and MCP\n\nAll four steps in one document. Everything runs in a GitHub Codespace, so nothing needs installing locally.\n\n**Total time:** about 40-45 minutes\n\n'
  for n in 1 2 3 4; do cat .github/steps/$n-step.md; printf '\n\n---\n\n'; done
  cat .github/steps/x-review.md
} > EXERCISE-GUIDE.md

# 3. Dev container: warm the cache with the same pinned command
cat > .devcontainer/devcontainer.json <<'EOF'
{
  "name": "Weather Tracker with Copilot Agent Mode and MCP",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "postCreateCommand": "curl -LsSf https://astral.sh/uv/install.sh | sh && (~/.local/bin/uvx mcp-server-fetch --help >/dev/null 2>&1; ~/.local/bin/uvx --with 'mcp<2' mcp-server-sqlite --help >/dev/null 2>&1; true)",
  "remoteEnv": {
    "PATH": "${containerEnv:PATH}:/home/node/.local/bin"
  },
  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": { "label": "Weather Dashboard", "onAutoForward": "notify" }
  },
  "customizations": {
    "vscode": {
      "extensions": ["GitHub.copilot", "GitHub.copilot-chat"]
    }
  }
}
EOF

# 4. Step 1 workflow: also check that the SQLite server is pinned
cat > .github/workflows/1-step.yml <<'EOF'
name: Step 1 - MCP servers
on:
  push:
    branches: [main]
    paths: [".vscode/mcp.json"]
permissions:
  issues: write
  contents: read
jobs:
  check:
    if: ${{ !github.event.repository.is_template }}
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GH_REPO: ${{ github.repository }}
    steps:
      - uses: actions/checkout@v4
      - name: Check MCP config
        run: |
          source .github/script/lib.sh
          require_step 1
          F=.vscode/mcp.json
          jq -e . "$F" >/dev/null 2>&1 || fail 1 "\`$F\` is not valid JSON (no comments or trailing commas)."
          jq -e '.mcpServers' "$F" >/dev/null 2>&1 && fail 1 "VS Code uses the key \`servers\`, not \`mcpServers\`."
          jq -e '.servers.sqlite.command and .servers.fetch.command' "$F" >/dev/null 2>&1 \
            || fail 1 "Define both \`servers.sqlite\` and \`servers.fetch\` with a \`command\`."
          jq -e '.servers.sqlite.args | index("mcp<2")' "$F" >/dev/null 2>&1 \
            || fail 1 "Add \`--with\` and \`mcp<2\` to the SQLite server \`args\` exactly as shown in Step 1. Without them the server fails to start."
          advance 1 2
EOF