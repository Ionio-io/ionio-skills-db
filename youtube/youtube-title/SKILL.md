---
name: youtube-title
description: Use this skill whenever generating, drafting, or refining a YouTube video title for a company's or creator's channel from a transcript or video description. Triggers include any mention of 'YouTube title', 'video title', 'YT title', 'title for this video', 'name this video', 'title options', or pasting a transcript and asking what to call the video. Covers both regular content videos (how-to, contrarian, build, opinion, listicle) and client or customer testimonial videos. Also use when batch-titling multiple videos or picking the next number in a numbered series. Always use this skill for any YouTube title work, even when the user just pastes a transcript without saying the word "title".
---

# YouTube Title — House Standard

## What this does

Given a video transcript (or a description of what the video covers), this skill produces ready-to-use YouTube titles in the channel's house style. There are two video types and the title logic differs completely between them, so the first job is always classification.

Titles are practitioner-level and confident, never clickbait-cheap. They earn the click with a real claim, a real number, or a real tension, not with hype words.

## Inputs — gather these first

Titles depend on who the channel is. Take these from the user or the context (the channel's About text, tagline, website, a brief, past titles). If one that matters for this video is missing, ask one quick question or flag it; never invent it.

- **Positioning**: how the channel describes itself, in its own words (the About text or tagline). This drives the framing principle below.
- **Host and team**: who presents the channel's own videos. Needed to tell regular videos from testimonials.
- **Brand name**: the name used in testimonial phrases ("On Building with {Brand}").
- **Audience / ICP**: who the videos are for (e.g. "mid-market retail brands", "indie game developers"). Feeds the domain anchor.
- **Running series**: any numbered series and the latest episode number.
- **Concept / product lines**: named products, frameworks or ideas that recur as suffix tags.
- **Past titles**: the channel's published titles, ideally its best performers. When provided, these beat the bundled title bank as the pattern library.

## Framing principle — read this before anything else

Every title and every pull-quote has to live inside the channel's own positioning. Read how the channel describes itself and write titles that reinforce it; kill any phrasing that quietly undercuts it. This rule overrides cleverness, overrides the templates below, and is the single most important thing in this skill.

**Worked example: partner, not vendor.** Take a consultancy whose About text reads "AI Transformation Partner". It is not a vendor, an agency, a dev shop, or a service that a client hired. It is a strategic partner — consulting plus implementation. Titles and quotes for that channel must never make it sound like a supplier. The rest of this section shows how that positioning is applied; for a channel positioned differently (an educator, a product company, a community), work out the equivalent tells and reach-fors from its own self-description in the same way.

This matters most on testimonials. For the partner-positioned channel above, the guest is a **peer who chose to build alongside the brand**, not a customer rating a contractor. The video should feel like a founder talking about a partner who understood their business and helped transform it — never like someone leaving a five-star review for a service provider.

**Vendor tells to kill on sight** (in titles and in quotes):
- Review / rating language: "great agency", "good company to work with", "best engineering company", "would recommend", "highly recommend", "5 stars".
- Service / transaction language: "hired", "outsourced", "delivered the project", "on time and on budget", "never miss a deadline", "great service", "responsive", "value for money".
- Any framing where the brand is the supplier and the client is the buyer.

**Partner frame to reach for instead:**
- Shared table / shared ownership: "felt like real partners around the table", "felt like part of our team".
- Transformation and outcome: "helped us make the idea real", "transformed how we ship", "took us from idea to AI-native".
- Strategic understanding: "understood both the business and the technical side", "got what we were actually trying to build".
- Trust under pressure: "didn't get rattled when things went wrong", "we trusted them with the hard calls".

Review-site language ("5 stars", "would recommend", "great service") is weak on any channel, whatever its positioning: it reads as a rating, not a story.

If a client literally says something that undercuts the positioning ("they always hit their deadlines"), do not quote it raw. Find the positioning-true moment underneath it (reliability under pressure becomes "they held the line when it mattered") and use that. Never fabricate — always pick the on-positioning moment from what the guest actually said.

This applies to regular videos too, lightly: the host speaks the way the channel positions itself (for the partner example, as a builder and operator who ships production systems, never as "an agency offering services").

## Step 1: Classify the video

Read the transcript and decide which of the two types it is.

**Testimonial video** — an external client or customer (often a founder/CEO of another company) talks about their experience working with the brand. Signals: the speaker is not the channel's host or team, they name their own company, they praise the team/delivery/results, the framing is interview/Q&A ("how was your experience working with us"). Usually shorter.

**Regular video** — the channel's host or team explains, builds, teaches, predicts, or gives an opinion. Signals: first-person "I/we built", "we think", technical walkthroughs, commentary, contrarian takes, teardowns. This is the everyday content.

If genuinely ambiguous, ask one quick question. Otherwise classify and proceed.

---

## Step 2A: Testimonial titles

Use this exact structure:

```
{First Last} | {Role} of {Company} | {Brand experience phrase}
```

- **Name**: as the guest is introduced. First name alone is acceptable if that's all the transcript gives ("Priya | ...").
- **Role**: use what they state — "Founder & CEO", "CEO & Founder", "CEO", "Co-Founder". Don't invent seniority.
- **Company**: their company name, exactly. Multiple brands stay joined ("Loomcraft & Pebble").
- **Experience phrase**: this is the part most likely to slip off-positioning. Avoid "experience working with {Brand}" as a reflex — it reads like a review of a contractor. For a partner-positioned channel, reach for partnership and transformation. Rotate across:
  - On Building with {Brand}
  - On Partnering with {Brand}
  - Why {He / She / They} Chose to Build with {Brand}
  - On Transforming {Company} with {Brand}
  - On {Company}'s AI Transformation with {Brand}
  - The {Brand} Partnership
  - The {Brand} Experience  *(acceptable — this is brand-framed, not a review)*

  For a channel positioned another way, build the equivalent rotation from its own self-description (an educator might use "On Learning with {Brand}"). Match the pronoun to the guest. If gender isn't clear from the transcript, use "They / Their" or a pronoun-free phrase. Never use a phrase that frames the guest as a satisfied customer.

**Also output 2-3 thumbnail pull-quotes.** The punchy quote lives on the thumbnail, not in the title, but it comes from the same transcript so generate it here. A pull-quote is a short, first-person, condensed line in quotes, roughly 3-8 words, lifted or tightened from what the guest actually said.

Apply the framing principle above hard here — the pull-quote is where off-positioning framing is most tempting and most damaging. For the partner example, the model quotes are the partner-framed ones: "They Felt Like Real Partners Around the Table", "They Helped Us Make the Idea Real", "They Understood Both the Technical and the Business Side", "They Didn't Get Rattled When Things Went Wrong". Steer away from service-review quotes like "They Never Miss a Deadline!" or "best engineering company in the biz" even if the guest says something close — translate the underlying truth into the channel's positioning language instead. Pull the strongest on-positioning moment from the transcript; don't fabricate praise that isn't there.

---

## Step 2B: Regular video titles

Generate **5-7 candidates**, label each by archetype, then recommend one. Detect and apply a series/concept suffix if relevant (see below).

### The title DNA (every candidate should hit most of these)

1. **Lead with a hook word**: How / Why / What / The / This / a number / We.
2. **One concrete anchor**: a number ($12K, $40K, Top 3%, 2026, #2), a named tool or company (Shopify, Notion, Figma, Amazon, NVIDIA), or one sharp claim. One anchor, not five.
3. **A curiosity gap or tension**: withhold the payoff, or state something counter-intuitive. Use `...` for a cliffhanger ("Was Wrong... Sort Of") and `(a parenthetical)` for a payoff tease ("(and what's replacing them)").
4. **Optional single-word CAPS emphasis** to punch the key idea (IMPROVE, BIGGEST, NO, THIS). At most one per title, and only when it earns it. Don't shout.
5. **Domain / ICP anchor when relevant**: taken from the channel's audience, e.g. "for Retail", "for Enterprises", "For E-Commerce", "for Indie Game Studios". Ties the video to who it's for.
6. **Front-load the hook** so it survives truncation (~60 characters show before YouTube cuts it). The suffix tag is the expendable tail.

### Hook archetypes (pick the ones that fit the content)

- **Build / teardown** — the team made something. "How We Built a Private Search Engine for Enterprise Docs", "We Built a Support Bot That Doesn't Need Retraining", "How Our Team Built an Open-Source Design System for Svelte".
- **Contrarian / prediction** — a take that pushes against consensus. "Why Chat Will Replace Search Bars For E-Commerce", "Why Weekly Reports Are Dying (and What's Replacing Them)".
- **Opinion / stakes story** — a real decision or cost. "Why I Turned Down a $40K Chatbot Contract", "How No-Code Builders cost us $12K in design work".
- **Explainer / guide** — teaches a concept end to end. "How to price subscriptions like Netflix", "What is Demand Radar?", "How To Pick the Right Vector Database for Retail".
- **Problem / critique** — names the flaw in a popular thing. "The Hidden Problem With AI Agent Benchmarks", "This is the BIGGEST mistake teams make when adopting AI".
- **Listicle** — counted, scannable. "3 Tips for Monitoring Models in Production", "4 AI Myths Founders Still Believe".

### Suffix tags

Detect from the transcript and append after ` | ` when it applies. Series and concept names come from the inputs above; the examples below use a fictional channel.

- **Numbered series** — if the video belongs to a running series, use ` | {Series} #{N}`. Take the series name and latest episode number from the user or the channel's past titles (e.g. a channel whose live series is **Retail Signals**, #1-#3 so far). If the transcript is clearly an episode of that series, assign the next number; if unsure which number, ask.
- **Concept / product line** — append the concept name when the video is part of one, e.g. ` | Demand Radar`. Use only lines the user or the channel has named; don't coin one.
- **Value kicker** — a short benefit clause, e.g. ` | No API costs!` or ` | A mid-market retailer's pricing guide`.

Only one suffix. If none fits, leave it off.

### Capitalization

Title Case is the house default and the safest pick. Sentence case ("How we made product photos that IMPROVE themselves") is also fine when it reads more natural and practitioner; follow what the channel already does. Choose one per title and stay consistent within that title. Selective ALL-CAPS emphasis is separate from this and can sit inside either style.

---

## Hard rules (both types)

- **Never use em-dashes.** Use `...`, `(parentheticals)`, or ` | ` instead.
- **Never use the "No X. No Y. No Z." negation pattern.**
- **No emoji.**
- **No cheap clickbait** ("You won't BELIEVE", "SHOCKING", "gone wrong"). The hook is a real claim, number, or tension.
- **Never let a title or quote undercut the channel's positioning.** For a partner-positioned channel, that means never reading as a vendor review: partner / transformation frame only — see the framing principle above. This is non-negotiable.
- **One anchor per title.** Stacking two numbers or three named tools kills it.
- Don't fabricate facts, numbers, names, series numbers, or praise that aren't in the transcript or the inputs.

---

## Output format

**For a testimonial:**
```
Title: {Name} | {Role} of {Company} | {experience phrase}

Thumbnail pull-quote options:
1. "..."
2. "..."
3. "..."
```

**For a regular video:**
```
Recommended: {the strongest title}
  Why: {one line — what makes it the pick}

Other options:
- [Contrarian] {title}
- [Build] {title}
- [Explainer] {title}
- [Listicle] {title}
- ...

Suffix detected: {series #N / concept line / value kicker / none}
```

When something material is missing from the transcript or inputs (the channel's positioning, the series number, the guest's role, a key figure the hook needs), flag it in one line rather than guessing.

## Reference

`references/title-bank.md` holds an annotated bank of example titles by type and archetype (fictional, built to show the patterns). Read it when you want more pattern examples than the ones inline above. If the user provides the channel's real published titles, use those instead for tone and to avoid near-duplicates; the bundled bank is a stand-in until the channel's own titles replace it.
