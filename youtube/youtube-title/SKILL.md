---
name: youtube-title
description: Use this skill whenever generating, drafting, or refining a YouTube video title for Ionio's channel from a transcript or video description. Triggers include any mention of 'YouTube title', 'video title', 'YT title', 'title for this video', 'name this video', 'title options', or pasting a transcript and asking what to call the video. Covers both regular content videos (how-to, contrarian, build, opinion, listicle) and client testimonial videos. Also use when batch-titling multiple videos or picking the next number in a numbered series. Always use this skill for any Ionio YouTube title work, even when the user just pastes a transcript without saying the word "title".
---

# YouTube Title — Ionio Standard

## What this does

Given a video transcript (or a description of what the video covers), this skill produces ready-to-use YouTube titles in Ionio's house style. There are two video types and the title logic differs completely between them, so the first job is always classification.

Ionio is a specialized AI consultancy for retail and e-commerce SaaS ($5M-$100M ARR). Titles are practitioner-level and confident, never clickbait-cheap. They earn the click with a real claim, a real number, or a real tension, not with hype words.

## Framing principle — read this before anything else

Ionio is not a vendor, an agency, a dev shop, or a service that a client hired. Ionio is a strategic **AI transformation partner** — consulting plus implementation. (This is literally the channel's own self-description: "AI Transformation Partner.") Every title and every pull-quote has to live inside that frame. This rule overrides cleverness, overrides the templates below, and is the single most important thing in this skill.

This matters most on testimonials. The guest is a **peer who chose to build alongside Ionio**, not a customer rating a contractor. The video should feel like a founder talking about a partner who understood their business and helped transform it — never like someone leaving a five-star review for a service provider.

**Vendor tells to kill on sight** (in titles and in quotes):
- Review / rating language: "great agency", "good company to work with", "best engineering company", "would recommend", "highly recommend", "5 stars".
- Service / transaction language: "hired", "outsourced", "delivered the project", "on time and on budget", "never miss a deadline", "great service", "responsive", "value for money".
- Any framing where Ionio is the supplier and the client is the buyer.

**Partner frame to reach for instead:**
- Shared table / shared ownership: "felt like real partners around the table", "felt like part of our team".
- Transformation and outcome: "helped us make the idea real", "transformed how we ship", "took us from idea to AI-native".
- Strategic understanding: "understood both the business and the technical side", "got what we were actually trying to build".
- Trust under pressure: "didn't get rattled when things went wrong", "we trusted them with the hard calls".

If a client literally says something vendor-flavored ("they always hit their deadlines"), do not quote it raw. Find the partner-framed truth underneath it (reliability under pressure becomes "they held the line when it mattered") and use that. Never fabricate — always pick the partner-framed moment from what the guest actually said.

This applies to regular videos too, lightly: Ionio speaks as a builder and operator who ships production AI systems, never as "an agency offering services."

## Step 1: Classify the video

Read the transcript and decide which of the two types it is.

**Testimonial video** — an external client (a founder/CEO of another company) talks about their experience working with Ionio. Signals: the speaker is not Rohan or an Ionio team member, they name their own company, they praise the team/delivery/results, the framing is interview/Q&A ("how was your experience working with Ionio"). Usually shorter.

**Regular video** — Rohan or an Ionio team member explains, builds, teaches, predicts, or gives an opinion. Signals: first-person "I/we built", "we think", technical walkthroughs, commentary, contrarian takes, teardowns. This is the daily content.

If genuinely ambiguous, ask one quick question. Otherwise classify and proceed.

---

## Step 2A: Testimonial titles

Use this exact structure:

```
{First Last} | {Role} of {Company} | {Ionio experience phrase}
```

- **Name**: as the guest is introduced. First name alone is acceptable if that's all the transcript gives ("Thomas | ...").
- **Role**: use what they state — "Founder & CEO", "CEO & Founder", "CEO", "Co-Founder". Don't invent seniority.
- **Company**: their company name, exactly. Multiple brands stay joined ("Hypemail & Patato").
- **Experience phrase**: this is the part most likely to slip into vendor framing. Avoid "experience working with Ionio" as a reflex — it reads like a review of a contractor. Reach for partnership and transformation. Rotate across:
  - On Building with Ionio
  - On Partnering with Ionio
  - Why {He / She / They} Chose to Build with Ionio
  - On Transforming {Company} with Ionio
  - On {Company}'s AI Transformation with Ionio
  - The Ionio Partnership
  - The Ionio Experience  *(acceptable — this is brand-framed, not a review)*

  Match the pronoun to the guest. If gender isn't clear from the transcript, use "They / Their" or a pronoun-free phrase. Never use a phrase that frames the guest as a satisfied customer.

**Also output 2-3 thumbnail pull-quotes.** The punchy quote lives on the thumbnail, not in the title, but it comes from the same transcript so generate it here. A pull-quote is a short, first-person, condensed line in quotes, roughly 3-8 words, lifted or tightened from what the guest actually said.

Apply the framing principle above hard here — the pull-quote is where vendor framing is most tempting and most damaging. The model quotes are the partner-framed ones: "They Felt Like Real Partners Around the Table", "Ionio Helped Us Make the Idea Real", "They Understood Both the Technical and the Business Side", "They Didn't Get Rattled When Things Went Wrong". Steer away from service-review quotes like "They Never Miss a Deadline!" or "best engineering company in the biz" even if the guest says something close — translate the underlying truth into partnership language instead. Pull the strongest partner moment from the transcript; don't fabricate praise that isn't there.

---

## Step 2B: Regular video titles

Generate **5-7 candidates**, label each by archetype, then recommend one. Detect and apply a series/concept suffix if relevant (see below).

### The title DNA (every candidate should hit most of these)

1. **Lead with a hook word**: How / Why / What / The / This / a number / We.
2. **One concrete anchor**: a number ($7K, $30K, Top 5%, 2025, #2), a named tool or company (Lovable, V0, Shadcn, Flutter, Amazon, NVIDIA), or one sharp claim. One anchor, not five.
3. **A curiosity gap or tension**: withhold the payoff, or state something counter-intuitive. Use `...` for a cliffhanger ("Failed... But Not Really") and `(a parenthetical)` for a payoff tease ("(and what's replacing them)").
4. **Optional single-word CAPS emphasis** to punch the key idea (IMPROVE, BIGGEST, NO, THIS). At most one per title, and only when it earns it. Don't shout.
5. **Domain / ICP anchor when relevant**: "for Retail", "for Enterprises", "For E-Commerce", "for Flutter Ecosystem". Ties the video to who it's for.
6. **Front-load the hook** so it survives truncation (~60 characters show before YouTube cuts it). The suffix tag is the expendable tail.

### Hook archetypes (pick the ones that fit the content)

- **Build / teardown** — the team made something. "How We Built a Self-Hosted RAG Framework for Enterprises", "We Built a Self-Learning RAG That Doesn't Require Fine Tuning", "How Our Team Built A Shadcn Alternative For Flutter Ecosystem".
- **Contrarian / prediction** — a take that pushes against consensus. "Why GEO Will Replace SEO For E-Commerce", "Why Dashboards Are Dying (and What's Replacing Them)".
- **Opinion / stakes story** — a real decision or cost. "Why I Said No to a $30K AI Automation Deal", "How Lovable and V0 made us lose $7K UI/UX deals".
- **Explainer / guide** — teaches a concept end to end. "How to master personalization like Amazon", "What is Ionio Lighthouse?", "How To Create Best Embedding Model for Retail".
- **Problem / critique** — names the flaw in a popular thing. "The Fundamental Problem of the GEO Hype", "This is the BIGGEST mistake businesses make while adopting AI".
- **Listicle** — counted, scannable. "3 Tips for Hosting Models in Production", "3 AI Industry Lies That Drive Me Crazy".

### Suffix tags

Detect from the transcript and append after ` | ` when it applies:

- **Numbered series** — if the video belongs to a running series, use ` | {Series} #{N}`. The live series is **Agentic Commerce** (#1, #2, #3, #4 so far). If the transcript is clearly an Agentic Commerce episode, assign the next number; if unsure which number, ask.
- **Concept / product line** — append the concept name when the video is part of one, e.g. ` | Prescriptive Intelligence`. (Lighthouse and Prescriptive Intelligence are current product/concept lines.)
- **Value kicker** — a short benefit clause, e.g. ` | No API costs!` or ` | Mid-Market ecommerce brand's personalization guide`.

Only one suffix. If none fits, leave it off.

### Capitalization

Title Case is the house default and the safest pick. Sentence case ("How we created AI ads that IMPROVE themselves") also appears on the channel and is fine when it reads more natural and practitioner. Choose one per title and stay consistent within that title. Selective ALL-CAPS emphasis is separate from this and can sit inside either style.

---

## Hard rules (both types)

- **Never use em-dashes.** Use `...`, `(parentheticals)`, or ` | ` instead.
- **Never use the "No X. No Y. No Z." negation pattern.**
- **No emoji.**
- **No cheap clickbait** ("You won't BELIEVE", "SHOCKING", "gone wrong"). The hook is a real claim, number, or tension.
- **Never let a title or quote read as a vendor review.** Partner / transformation frame only — see the framing principle above. This is non-negotiable.
- **One anchor per title.** Stacking two numbers or three named tools kills it.
- Don't fabricate facts, numbers, names, or praise that aren't in the transcript.

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

When something material is missing from the transcript (the series number, the guest's role, a key figure the hook needs), flag it in one line rather than guessing.

## Reference

`references/title-bank.md` holds the full annotated catalog of every published title by type and archetype. Read it when you want more pattern examples than the ones inline above, or when checking a new title against the existing channel for tone and to avoid near-duplicates.
