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
