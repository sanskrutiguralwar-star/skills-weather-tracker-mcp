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
