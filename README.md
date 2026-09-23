# Ionio Skills DB

Ionio's library of Claude skills, sorted by business area. Each top-level folder is one area of work, and its `README.md` lists every skill in that area.

## Departments

| Folder | Covers | Skills |
|---|---|---|
| [`youtube/`](youtube/README.md) | Titles, descriptions, and packaging for the Ionio YouTube channel | 2 |
| [`sales/`](sales/README.md) | Outbound prospecting, CRM logging, and call coaching | 3 |
| [`copywriting/`](copywriting/README.md) | Persuasive copy: ads, landing pages, headlines, hooks, posts | 2 |
| [`editorial/`](editorial/README.md) | Long-form articles and blogs: doctrine, editing, scoring, AI-tell scrub | 4 |
| [`graphic-design/`](graphic-design/README.md) | Carousels, one-pagers, and decks: composition and on-graphic copy | 2 |

**Total: 13 skills**

> **Always last:** run [`editorial/claudisms`](editorial/claudisms/SKILL.md) over any written output, from any department.
> **Opt-in only:** use [`editorial/rohan-writing-doctrine`](editorial/rohan-writing-doctrine/SKILL.md) only when someone explicitly asks for it.

## All skills

| Skill | Department | One-liner |
|---|---|---|
| [youtube-title](youtube/youtube-title/SKILL.md) | youtube | Titles for regular and testimonial videos, from a transcript |
| [youtube-description](youtube/youtube-description/SKILL.md) | youtube | Video descriptions following Ionio's structure, keywords, and CTAs |
| [loom-email-copy](sales/loom-email-copy/SKILL.md) | sales | Short cold emails that tease a personalized Loom to SaaS CEOs |
| [outbound-crm-update](sales/outbound-crm-update/SKILL.md) | sales | Logs a new prospect into the Notion Outbound CRM |
| [mannan-call-breakdown](sales/mannan-call-breakdown/SKILL.md) | sales | Post-call coaching breakdown that grades Mannan's performance |
| [hormozi-writing](copywriting/hormozi-writing/SKILL.md) | copywriting | Direct, human copy in a Hormozi and Mannan voice blend, with de-AI rules |
| [hopkins-copywriting](copywriting/hopkins-copywriting/SKILL.md) | copywriting | Claude Hopkins' method for headlines, ads, and sales copy, with a 10-point self-check |
| [business-writing-manifesto](editorial/business-writing-manifesto/SKILL.md) | editorial | Value test and laws of tightness for deciding what ships |
| [claudisms](editorial/claudisms/SKILL.md) | editorial | Living banlist of AI-writing tells; final scrub on everything |
| [rohan-writing-doctrine](editorial/rohan-writing-doctrine/SKILL.md) | editorial | Rohan's voice and review standards (opt-in only) |
| [tech-blog-analysis](editorial/tech-blog-analysis/SKILL.md) | editorial | Scores an article for CEO and CTO readers, with an Executive Readiness Score |
| [graphic-design-tactics](graphic-design/graphic-design-tactics/SKILL.md) | graphic-design | 22 composition rules for carousels and decks, plus a review log |
| [graphic-copy](graphic-design/graphic-copy/SKILL.md) | graphic-design | Rules for the words inside graphics: no invented specifics, titles are claims |

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
2. **Create `<department>/<skill-name>/SKILL.md`.** The folder name must match the `name:` in the frontmatter. If the source has no frontmatter, add a `name`/`description` block and leave the body unchanged.
3. **Put supporting files in `references/`.** Skills refer to them by relative path (`references/<file>.md`). A source file named `<skill>--<thing>.md` becomes `<skill>/references/<thing>.md`.
4. **Update the ledgers.** Add a row to the department `README.md` and to the tables above (including the counts).
5. **Archive the source.** Put the original upload (zip, etc.) in `_imports/`. Zips are gitignored, so they stay on your machine only.

## Import log

| Date | Source | Skills |
|---|---|---|
| 2026-09-23 | `mannan-skills.zip` | youtube-title, youtube-description, loom-email-copy, outbound-crm-update, mannan-call-breakdown, hormozi-writing |
| 2026-09-23 | `ionio-graphic-skillset/skills/general-skills` @ `d091955` | hopkins-copywriting, business-writing-manifesto, claudisms, rohan-writing-doctrine, tech-blog-analysis, graphic-design-tactics, graphic-copy |
