# Graphic Design

Skills for graphics made from articles: carousels, one-pagers, and slide decks. Both come from the user's reviews of generated output and grow after every review.

## Ledger

| Skill | What it does | Use when | Files |
|---|---|---|---|
| [graphic-design-tactics](graphic-design-tactics/SKILL.md) | 22 composition rules (one background per deck, consistent line geometry, required contrast, real logos, colour carries meaning, no orphans), plus a review checklist and review log | Composing or reviewing any carousel, one-pager, or deck. Run it before rendering and again on the contact sheet | `SKILL.md` |
| [graphic-copy](graphic-copy/SKILL.md) | 12 rules for the words inside graphics: no invented vignettes, every panel needs data, titles are claims, keep the article's register, one idea per surface | Writing or checking slide titles, card copy, panel rows, chips, and captions | `SKILL.md` |

## Workflow

```
article → graphic-copy (words) → graphic-design-tactics (composition) → render → contact-sheet review → claudisms
```

Run [claudisms](../editorial/claudisms/SKILL.md) over every string in the graphic after graphic-copy.

## Living files

Both skills have a **Review log** at the bottom. Add an entry after each user review.

## Dependencies

These skills mention paths inside the **`ionio-graphic-skillset`** repo, where the graphics are actually made. Those paths don't exist in this repo:

- `effects/`: effects library and recipes
- `public/demo/ionio-logo.png`: the Ionio logo used on every page
- `icons.js`: the glyph set in each output
- `references/imported/editorial-graphics-kit/DESIGN-SYSTEM.md`: structural rules from the design kit
- `AGENTS.md`: repo-wide agent rules (including "never invent evidence")

*Source: `ionio-graphic-skillset/skills/general-skills` @ `d091955`. The only change: in graphic-design-tactics, the link to graphic-copy now points to its new location.*
