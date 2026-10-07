# Frontier Healthcare DTR 2026–27

Client edition of the Frontier Healthcare Digital Transformation Roadmap for 2026–27, prepared by Caspian Digital Solutions. The showcase follows the source report: Frontier Healthcare today, audiences, three websites, SEO · AEO · GEO, corporate, video and AI, and the 52-week roadmap.

Sign-in is a local demo. There is no external auth provider and no database. Edits made by the editor are stored in `data/overrides.json`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To bind a specific host and port:

```bash
npx next dev -H 0.0.0.0 -p 4721
```

## Demo logins

| Role | Email | Password | Access |
| --- | --- | --- | --- |
| Editor | `editor@frontier.demo` | `Frontier-edit-2026` | Click any visible wording to edit it. Changes save automatically and survive a refresh. |
| Viewer | `viewer@frontier.demo` | `Frontier-view-2026` | Read-only. No edit controls, and the save API rejects changes. |

The same credentials are shown on the sign-in screen. Click a role to fill the form.

## What the editor can change

Headings, narrative, stats, table cells, captions, chart labels, Gantt tasks, and the week-by-week plan. Column sorting still works; hold Alt and click a column header while editing. Theme, filters, and the Gantt filters are part of the report and are not stored as content edits.
