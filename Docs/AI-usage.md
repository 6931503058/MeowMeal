# MeowMeal — AI Usage Log

## Project information

| Item | Details |
| --- | --- |
| Project | MeowMeal — Feline Food Intake & Early Anomaly Monitoring System |
| Course | Introduction to Software Engineering (15031001) |
| Team | I don't know |
| Period covered | 6 October–16 November 2026 |
| Application | Web application built with HTML, CSS, and JavaScript |

## AI tools used

| AI tool | How it supported the project | Human review |
| --- | --- | --- |
| **ChatGPT** | Brainstorming the project problem and solution; organizing requirements; explaining implementation approaches; helping with debugging ideas and documentation. | The team selected, edited, and checked suggestions against the project and its code. |
| **Google Gemini** | Brainstorming and refining feature ideas and explanations; considering alternative approaches; improving project wording. | The team decided which suggestions fit the project and reviewed the final content. |
| **Claude** | Reviewing and refining project explanations; comparing possible approaches; helping improve written descriptions and documentation. | The team checked suggestions against requirements and source code before using them. |
| **GitHub Copilot** | In-editor code completion and suggestions while developing the HTML, CSS, and JavaScript web app. | Developers reviewed and modified suggestions and are responsible for the code included in the project. |

## Retrospective timeline

| Date / period | Project stage | AI tools | How AI assisted | Team's work and review | Related project files / features |
| --- | --- | --- | --- | --- | --- |
| **6–12 October** | Idea and problem definition | ChatGPT, Gemini, Claude | Explored the problem of caregivers missing gradual appetite loss; helped clarify target users and describe the project goal. | The team chose the project direction, intended users, and final problem statement. | README introduction and problem statement |
| **13–19 October** | Requirements and scope | ChatGPT, Gemini, Claude | Organized feature ideas and helped describe profile management, meal logging, low-intake alerts, intake trends, and the planned photo-based estimate. Helped identify out-of-scope features. | The team selected the MVP features and reviewed the requirements against course expectations. | FR-1 to FR-5 and Out of scope in README; SRS |
| **20–26 October** | User flow and interface planning | ChatGPT, Gemini, Claude; Copilot during implementation | Discussed screen structure, labels, navigation, and flows for logging meals and reviewing intake. Copilot suggested code while interface elements were being written. | The team created and revised the prototype and screens, then checked the flow for clarity. | `index.html`, `css/style.css`, `prototype/exports/` |
| **27 October–2 November** | Core web app implementation | ChatGPT, Gemini, Claude, GitHub Copilot | Explained implementation approaches and supported work on navigation, profile forms, meal logging, and local data storage. Copilot provided in-editor HTML, CSS, and JavaScript suggestions. | Team members integrated and modified code and reviewed suggestions before keeping them. | `index.html`, `css/`, `js/` |
| **3–9 November** | Intake calculations, alerts, and trends | ChatGPT, Gemini, Claude, GitHub Copilot | Helped reason about eaten/remaining percentages, daily targets, consecutive below-target days, snack handling, charts, and alert behavior; Copilot supported code completion. | The team defined feature behavior and reviewed the implementation against project requirements. | `js/anomaly_detector.js`, `js/alerts.js`, `js/home.js`, `js/trend_dashboard.js` |
| **10–15 November** | Photo feature, debugging, and refinement | ChatGPT, Gemini, Claude, GitHub Copilot | Discussed the planned photo-estimation flow, editable suggestions, a confidence threshold, and manual fallback. AI assistants also supported implementation questions, debugging ideas, and clearer explanations. | The team reviewed the suggestions and refined the project. Photo inference remains unimplemented in the reviewed code. | FR-5; photo controls; `js/photo.js` |
| **16 November** | AI disclosure and final documentation | ChatGPT through Codex (GPT-6) | Reviewed repository files, drafted and revised this AI Use Log, checked photo-feature status against the code, and added a link to the log in the README. | The project owner should confirm that the final disclosure matches team recollections and course requirements. | `docs/AI_USAGE_LOG.md`, `README.md` |

## In-app AI feature status

| Feature | Intended behavior | Status in the code reviewed for this log |
| --- | --- | --- |
| Visual portion estimation (FR-5) | A caregiver uploads a bowl photo; a vision model suggests the remaining-food percentage; the user can edit it; if confidence is below 60%, the app asks the user to select manually. | **Planned, not connected.** `js/photo.js` contains a placeholder and no live AI model/API was found in the reviewed application. Do not describe this as a working in-app AI feature until implemented and verified. |

## AI use and responsibility

| Topic | Disclosure |
| --- | --- |
| Development assistance | AI tools supported planning, implementation work, debugging discussions, and documentation. The team made final decisions and is responsible for the submitted work. |
| Accuracy | AI suggestions can be wrong or unsuitable. The team reviewed and adapted them; AI output alone does not prove that a feature works. |
| Veterinary safety | A future portion estimate should be an editable meal-logging aid, not a diagnosis or veterinary recommendation. Caregivers should consult a veterinarian about concerning appetite changes or symptoms. |
| Photo privacy | The reviewed implementation does not send bowl photos to an AI provider because no provider integration was found. |
| Record format | This is a retrospective summary, not a verbatim transcript. Dates are approximate periods, and task descriptions summarize the project stages. The team should correct details that do not match actual recollections before submission. |

## Team verification

| Check | What to confirm |
| --- | --- |
| Tool attribution | Confirm each listed AI tool was actually used by the team and remove any that were not. |
| Timeline | Adjust approximate date ranges if the team remembers a different schedule. |
| Contributions | Verify that the described AI assistance matches what members used it for. |
| Final implementation | Recheck FR-5 status if the photo-estimation feature changes before submission. |

---

| Related file | Link |
| --- | --- |
| Project README | [README](../README.md) |
| Photo feature source | `js/photo.js` |
