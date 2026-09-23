---
name: graphic-design-tactics
description: Rules for multi-page graphics (carousels, one-pagers, slide decks) produced in this repository, taken from the user's reviews of generated output. Use whenever composing or reviewing any article-derived graphic, before rendering.
---

# Graphic design tactics

Rules the user has given on generated graphics, most recent review first. Each rule records what was seen, what the user said, and how to apply it. Add to this file after every review; do not soften a rule to fit a draft.

## 1. One background per deck

Seen: a carousel where every slide had a different background recipe (a line fan, falling crossings, a mesh gradient, a dithered sky, a halftone). The user: all the pages have to look the same.

Apply:

- Pick one background recipe for the whole deck or page and use it on every slide. Same base gradient, same glows, same grain, same line field.
- Variation belongs in the content: headline size, card layout, one stat versus six, the single inverted card. The backdrop stays fixed so the deck reads as one document.
- Different decks may use different recipes. Within a deck, none.

## 2. The lines stay the same everywhere

Seen: line geometry changing per slide (fan on one, crossings on another, dense wash on a third). The user: lines need to stay the same everywhere.

Apply:

- Fix one line geometry per deck: counts, sweep and crossing geometry, stroke width, colours, anchor and height scale.
- If a slide needs the field moved to make room, shift it with offsetY or lower its opacity. Do not change its shape.
- The field is a brand signature, not a per-slide illustration.

## 3. Contrast is required

Seen: pages of cream, pale lavender, pale gold and grey text with nothing dark or saturated on them. The user: it has to have some contrast; not all the colours can look the same.

Apply:

- Every page carries at least one high-contrast element: a dark inverted card, a saturated headline word, a solid indigo or orange chip, a strong bar, a large dark display number.
- The palette needs a dark anchor (ink or the deep indigo) and one accent that is visibly saturated at display size. Pastel highlights alone do not count.
- Check at thumbnail scale. If the page reads as one flat tone, it fails.
- Do not "fix" flatness by rotating colours decoratively between slides. Colour carries meaning (see 5); contrast comes from value, not from more hues.

## 4. Named products get their real logo

Seen: Loom, Lovable, Figma, draw.io and Claude referenced as text chips only. The user: if we talk about a service, we need to have the logo. Really do.

Apply:

- Any product, tool, or service named in a graphic appears with its actual logo mark next to the name, at a consistent size across the deck.
- Fetch the mark from the vendor's own brand or press page, keep the file locally under the output folder with a note of the source URL and date, and use the mark as the vendor supplies it (no recolouring, no stretching). Downloading a file needs the user's go-ahead; ask once per batch.
- Our own logo is on every page (the official favicon at `public/demo/ionio-logo.png`). Keep it there.
- A text-only chip for a brand reads as unfinished.

## 5. Colour use follows meaning

Carried from the imported kit and confirmed by the user's review: colour should carry the argument, not decorate.

Apply:

- Give each accent a job for the deck and keep it: for the Ionio technical palette, indigo for the current state or our side, orange for warnings or the other party, gold for brand elements only (wordmark, page numbers, line strokes, hero numbers).
- The same thing is the same colour on every page.
- One inverted dark card per deck is the anchor; do not multiply it.

## 6. No small text above headings. Ever.

Seen: mono kickers above every slide title ("A PAID CLIENT BUILD, NO DESIGNER", "BEFORE CLAUDE", "THEN LOVABLE", "WHAT YOU LOSE, ON A MID-MARKET B2B PRODUCT"). The user: so small and irrelevant, the positioning so bad that nobody reads them. A hard rule: not allowed, ever.

Apply:

- No eyebrow, kicker, or label line above a heading, on any page, in any deck.
- The same goes for top-right page meta and for tiny captions above panels. If a label is needed, make it a readable heading in the type scale. If it says nothing a heading would not, cut it.
- Footers keep page numbers and the source URL. Those do navigational work.
- If the kicker carried the idea, put the idea in the heading. "TASTE." with a kicker became "But what about taste?"

## 7. Lists are all-or-none for marks

Seen: a four-item list where the first two items had logos (draw.io, Figma) and the last two had nothing; a six-step grid with logos on two steps only.

Apply:

- If one item in a list, flow, or grid has a logo, every item has a mark: a logo where a product is named, a neutral glyph otherwise. Use the glyph set in the output's `icons.js` or add one.
- Marks sit in the same position and size on every item.
- If you cannot give every item a mark, remove the marks from all of them. Mixed is the failure.

## 8. Logos at 23 px, and consistent

The user asked for logos 15 percent larger than the first pass. Inline marks are 23 px, chip marks 19 px, brand tiles 25 px. Every mark in a deck uses those three sizes and nothing else.

## 9. A bar has to look like what it means

Seen: a full-width "two weeks" bar drawn in a pale hatch read as empty; the "one afternoon" bar was a sliver with an empty track behind it, though the empty part was the good news.

Apply:

- Look at every chart as a viewer would, at thumbnail scale. A quantity that is full must read as full: solid, dark. Pale hatch on a pale track reads as nothing.
- When the empty space is a gain (time saved, cost removed), fill it and say so: green stripes labelled "time gained", with a legend. Do not leave a positive result looking like an absence.
- Colour on charts follows meaning: ink or indigo for what was spent, indigo for what it takes now, green for what was gained.

## 10. Lines only where their ends are hidden

Seen: deck B put text straight on the background, so the descending lines' start points showed mid-slide and looked broken. Deck A's cards covered those points, which read fine. On the tall poster the line field at the foot read as noise.

Apply:

- The line field's crossings start inside the frame. Use the full field only when cards or an inverted block cover that region.
- When text sits directly on the background, draw the sweeps only (crossings set to zero). They enter and leave off-canvas, so no start or end is visible.
- On a tall single page without cards at the foot, drop the lines.
- Never let a line begin or end in open space.

## 11. Background contrast, with texture

Seen: the mesh background read as flat and "wavy" even after the first contrast pass.

Apply: when a background needs more presence, raise the glow and mesh strengths, then add a dither pass (Bayer, a few tones from indigo to cream, at half strength) so the surface has visible texture. Keep text-bearing regions light.

## 12. Figures never wrap

Seen: "$2k to $3k" breaking onto a second line in a stat cell. The user: that just looks bad.

Apply: a stat, price, date or figure sits on one line, always. Size it down or shorten it ("$3k a month") before letting it wrap. Set `white-space:nowrap` on every figure and check the widest one at render.

## 13. Underline, do not shade; keep phrases whole

Seen: an orange solid block behind "Repricing" so tall it cut into the line above, and a shaded phrase in every title of the deck. The user: an orange underline would have been better; the block is too aggressive; do not use the background shading of specific words unless it is really needed, and do not overuse these tactics.

Apply:

- Default title treatment is plain ink. If one phrase needs emphasis, use a thin orange underline. Solid blocks behind words are the exception, not the system.
- One emphasised phrase in a deck is plenty; never one per slide.
- A title breaks between phrases, never inside one: "The Great Repricing" on one line, "of agency work" on the next. Set the breaks by hand.
- Nothing decorative may overlap a neighbouring line of type.

## 14. The background is felt on the whole page

Seen: the halftone wave confined to the foot of the print deck. The user: the top and the bottom feel like two different pages; the wave should be felt above as well, some variation of it.

Apply: an effect that anchors the foot needs a lighter echo in the upper region (a second, fainter pass of the same generator, or lower contrast rather than a hard fade to flat paper). Look at the whole page: if the top half could belong to a different deck, it fails.

## 15. Bars are verified at full resolution

Seen: every bar chart in the print deck broken; the solid fill rendered outside and below its outlined track. Cause: the `.ink` class for the inverted block also matched `.fill.ink`, adding padding and margin to the fill.

Apply: chart fills get their own class names, never shared with a layout class. Before showing a deck, crop every chart at full resolution and confirm each fill sits inside its track and each length matches its label.

## 16. Do not repeat one device on every slide

Seen: the night deck with a giant mono figure on all seven slides (100x, 1826, $20, 3 days, One-off., 2 for 2, $50K). The user: every single page has that thing of something being very big.

Apply: the structure of a slide follows its content. A giant figure where the fact is a number, a table where it is a comparison, a list where it is a sequence. Two or three giant figures per deck, not seven.

## 17. Volume

Seen: shading, orange, indigo and a strong effect on every slide. The user: slightly too loud in terms of colours and how the shades are used everywhere.

Apply: accent colours belong to data and to one emphasis per deck. Titles and body stay ink or cream. The background effect can be rich; the type over it stays quiet.

The user also said these reviews are recorded so the rules accumulate, not so that every rule is applied mechanically every time (the background does not have to be a specific colour each time). Treat the log as judgment to carry forward.

## 18. A big number must carry the point on its own

Seen: a 150 px "3 BC" and a 150 px "10-15" opening two slides. The user: it is big but it does not convey anything; do not make things unnecessarily big just for the sake of it, and if you want to use it, use it properly.

Apply:

- Display size is for a phrase or figure a reader understands with no other text: "TWO PEOPLE. ONE CHANNEL.", "WHERE DID THE DESIGN PHASE GO?", "$50K to $20K".
- A number that needs the sentence to mean anything belongs in the sentence: "Ten to fifteen prompts to a demo-grade product", not "10-15" over a caption. An in-joke label like "3 BC" is not a headline; cut it or work it into the line.
- Remove the number rather than shrink it when the title already says everything.

## 19. No orphaned word at the end of a heading

Seen repeatedly across decks: "…was drawn by / hand.", "The sales phase ate the / mockup.", "prompts to a demo-grade / product". The user: you tend to make these mistakes a lot.

Apply: set the breaks by hand with `<br>` and cap the heading's max-width, then read the render. No last line may be one short word. Balance the lines: two full lines beat a long line plus a stub. Recheck after any copy edit, because the wrap moves.

## 20. The background disappears behind long copy, and readability is measured

Seen: the OpenAI cost one-pagers, where a halftone wave and a dithered mesh sat under 4,000 px of body copy, tables and diagrams. The user: the background and the foreground are messing each other up, it is not nice to look at; the background has to basically disappear, a blur field with very few effects; use some measurement to make sure it is readable.

Apply:

- On a tall page that is mostly type, the background is a blurred colour field: soft tiles or glows, a wide blur, faint grain. No dots, dither, halftone or lines under copy. Contrast (rule 3) comes from ink blocks, bars and rules, not from the backdrop.
- Measure before showing: render the background bare at page size and score it with `generated/openai-cost-article/measure.py` (WCAG contrast of the body and heading colours against the worst 0.5th percentile of background luminance, plus a texture score, the mean luminance step between neighbouring pixels). Body copy at 7:1 or better and texture under 0.5 passed; the rejected halftone scored 4.6.
- Diagrams get room: full width, tokens and boxes at 30 px or more, one titled panel per idea, one-line captions. A cramped diagram reads as chaos.

## 21. Facts in a graphic are as current as the render, not the article

Seen: model names and prices from a November 2024 article rendered in September 2026. The user: keep in mind we are at GPT-6; make sure everything is updated with proper new information.

Apply: before rendering an article older than a few months on a fast-moving subject, fetch the vendor's current docs and pricing, update the facts, keep the article's own measurements labelled with their date and model, and list in the folder README which claims come from the article and which from the fetch. Never update from memory.

## 22. Light backgrounds stay calm; red marks a decrease

Seen: the GTM V3 paper carousel, twice. First a coloured grain-gradient through an ordered image dither: "a huge mess". Then the same colours as a 90 px blur field: still chaotic, soft coral and peach blotches that looked blurred to hide the mess. The user asked for "a dithered something" with slight blur instead. The dark dithered-mesh deck was liked throughout.

Apply:

- On a light theme, use a two-tone dither in one quiet colour close to the paper (the Paper dithering wave, sand on cream, 8x8 cells at 3 px), placed so the copy region is nearly clean, with a 1 px blur to soften the cells. No multi-hue blobs, marbling or colour washes. Measured result: heading 12.3:1, body 8.0:1, texture 0.63. Richer dither and colour belong on dark themes.
- Red marks a decrease: a removed step or time cut gets a red segment or red hatch with a red label (−50%, "gone"). Use it only where the data has a decrease; waiting time is grey hatch, not red.
- A summary graphic (single image) uses the article's most general example. Niche case studies stay in the carousel.
- For time and process comparisons, a stacked before/now bar works well (the idea from `examples/before-now-bars`): segment widths show time, labels inside, short arrow notes below. Take only the structure from that reference, not its hand-drawn outlined pastel look: draw the segments in the deck's own solid bar style (solid ink, the deck's "now" colour, red hatch for the removed part, grey hatch for waiting) on one rounded track. The outlined version was rejected as an overcorrection.

## Review checklist

Run before rendering and again on the contact sheet.

1. Same background and line field on every page?
2. At least one dark or saturated element on every page?
3. Every named product shown with its real logo, our logo present?
4. Each accent colour means one thing across the deck?
5. Does the deck read as one document at thumbnail scale?
6. Any small text above a heading, page meta, or tiny panel caption? Remove it.
7. Every list with a mark on one item has a mark on all items, same size and position?
8. Every bar reads as what it means at thumbnail scale; gains shown as gains?
9. Any line start or end visible in open space?
10. Background has visible contrast and texture without darkening text regions?
11. Any figure wrapping onto a second line?
12. Any shaded word block, or more than one emphasised phrase in the deck? Any title broken inside a phrase?
13. Is the background effect felt at the top of the page as well as the foot?
14. Every bar fill inside its track at full resolution?
15. Same device (giant figure, same block) on every slide?
16. Does every display-size number carry its point without the caption? If not, put it in the sentence or cut it.
17. Any heading whose last line is a single orphaned word?
18. On a tall text page: is the background a blurred field with no dots or lines under copy, and has it been measured (body 7:1, texture under 0.5)?
19. Are the facts current for the render date, with article measurements labelled by date and model?
20. On a light theme, is the background a calm one-colour dither with the copy region nearly clean? Is red used only for a decrease?

Copy inside the graphics is covered separately in [graphic-copy](../graphic-copy/SKILL.md). The effects library and its recipes are in `effects/`; the kit's structural rules (fixed page height, centred content, cards hold one idea) are in `references/imported/editorial-graphics-kit/DESIGN-SYSTEM.md`.

## Review log

- 2026-09-06, first generated carousels and one-pagers from the design-phase article: backgrounds varied per slide, no service logos, flat colour. Rules 1 to 4 written from that review. Output moved to ignored `generated/`.
- 2026-09-06, second pass of the same four outputs: one recipe per deck with identical lines, dark markers and solid highlights on every page, vendor logos for five products. Reviewed: approved the direction ("so far so good, very nice"), with rules 6 to 11 added from it.
- 2026-09-08, design-phase carousel B made publication-ready: the giant "3 BC" and "10-15" removed, the count moved into the sentence, headings rebroken so no word is orphaned, the two solid highlight blocks replaced with one orange underline, brand lockup 20 percent larger. A second version puts the faded old toolchain (draw.io, Figma, Framer, Sketch) on the cover. Rules 18 and 19 written from that review.
- 2026-09-06, Great Repricing print and night decks (halftone paper, dithered mesh): wrapped figures, shaded title blocks overlapping the line above and used on every slide, background only at the foot, bar fills outside their tracks, a giant figure on every night slide, colours too loud. Rules 12 to 17 written from that review. Copy failures from the same review are in `graphic-copy.md` rules 9 to 11. The user liked the night deck's background and the print deck's colour scheme.
- 2026-09-06, third pass: logos 15 percent larger, glyphs on every unmarked list item, kickers and page meta removed everywhere, "two weeks" bar solid ink with green "time gained" stripes on the afternoon bar, deck B on sweeps only with a stronger dithered mesh, one-page B without lines. Approved.
- 2026-09-10, OpenAI cost one-pagers, first pass: halftone and dithered-mesh backgrounds under long copy rejected as fighting the type; a cramped decoding diagram; a "five smaller settings" line; 2024 model names and prices. Second pass: blurred fields measured with measure.py, full-width diagram, vendor marks for OpenAI, Claude and Gemini at the top, facts refetched from OpenAI docs. Rules 20 and 21 written from that review.
- 2026-09-23, GTM V3 carousel and single image (ink and paper): the paper dither rejected as messy, replaced with a blur field; ink carousel and the dark single image liked; RFQ bars on the single image replaced with the article's generic halved-video example; red added for the decrease. Rule 22 written from that review.
- 2026-09-23, GTM V3 third pass: the blur field was also rejected as chaotic; the paper deck moved to a sand-on-cream dithered wave with a 1 px blur, and slides 1 and 4 now use segmented before/now bars after the user's reference graphic. Rule 22 rewritten.
- 2026-09-23, GTM V3 fourth pass: the user meant the stacked-bar idea, not the reference's styling; bars returned to solid fills on a rounded track. The example cut changed from 50 to 30 percent at the user's request.
