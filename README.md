# Ionio Skills DB

Ionio's library of Claude skills, sorted by business area. Each top-level folder is one area of work, and its `README.md` lists every skill in that area.

## Departments

| Folder | Covers | Skills |
|---|---|---|
| [`youtube/`](youtube/README.md) | Titles, descriptions, and packaging for the Ionio YouTube channel | 2 |
| [`sales/`](sales/README.md) | Outbound prospecting, CRM logging, and call coaching | 3 |
| [`copywriting/`](copywriting/README.md) | General copy in Mannan's voice (LinkedIn, landing pages, ads, scripts) | 1 |

**Total: 6 skills**

## All skills

| Skill | Department | One-liner |
|---|---|---|
| [youtube-title](youtube/youtube-title/SKILL.md) | youtube | Titles for regular and testimonial videos, from a transcript |
| [youtube-description](youtube/youtube-description/SKILL.md) | youtube | Video descriptions following Ionio's structure, keywords, and CTAs |
| [loom-email-copy](sales/loom-email-copy/SKILL.md) | sales | Short cold emails that tease a personalized Loom to SaaS CEOs |
| [outbound-crm-update](sales/outbound-crm-update/SKILL.md) | sales | Logs a new prospect into the Notion Outbound CRM |
| [mannan-call-breakdown](sales/mannan-call-breakdown/SKILL.md) | sales | Post-call coaching breakdown that grades Mannan's performance |
| [hormozi-writing](copywriting/hormozi-writing/SKILL.md) | copywriting | Direct, human copy in a Hormozi and Mannan voice blend, with de-AI rules |

## Layout

```
<department>/
├── README.md                 # the department's skill ledger
└── <skill-name>/
    ├── SKILL.md              # the skill (frontmatter: name, description)
    └── references/           # optional supporting files the skill reads
        └── <file>.md
```

Each skill folder follows the standard Claude skill format, so you can drop it straight into `~/.claude/skills/` or upload it to Claude.ai as-is.

## Adding a skill

1. **Pick the department.** Use an existing folder if one fits. If none does, create a new top-level folder named after the business area (kebab-case, e.g. `development/`, `hiring/`, `finance/`) and give it a `README.md` ledger.
2. **Create `<department>/<skill-name>/SKILL.md`.** The folder name must match the `name:` in the frontmatter.
3. **Put supporting files in `references/`.** Skills refer to them by relative path (`references/<file>.md`). A source file named `<skill>--<thing>.md` becomes `<skill>/references/<thing>.md`.
4. **Update the ledgers.** Add a row to the department `README.md` and to the tables above (including the counts).
5. **Archive the source.** Put the original upload (zip, etc.) in `_imports/`. Zips are gitignored, so they stay on your machine only.

## Import log

| Date | Source | Skills |
|---|---|---|
| 2026-09-23 | `mannan-skills.zip` | youtube-title, youtube-description, loom-email-copy, outbound-crm-update, mannan-call-breakdown, hormozi-writing |
