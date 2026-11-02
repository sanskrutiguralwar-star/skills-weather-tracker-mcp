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
