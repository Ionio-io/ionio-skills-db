---
name: outbound-crm-update
description: Add a new prospect entry to the Ionio Outbound Prospect CRM in Notion. Use this skill whenever the user types "start", "new lead", "add lead", "log lead", "log a prospect", "add to CRM", "update CRM", "new prospect entry", "log a call", "log a Loom", "log a meeting", or any variation indicating they want to push a new outbound lead into the Notion CRM. Always trigger this skill when the user mentions the outbound CRM, prospect logging, cold call results, Loom sends, or meeting bookings, even if they do not explicitly name the skill. Built for Apoorv Karmase at Ionio. This skill shows a one-shot questionnaire and then creates the Notion page automatically when the user replies.
---

# Outbound Prospect CRM Update

This skill logs a new prospect into the Ionio Outbound Prospect CRM in Notion in two turns:

1. User triggers the skill → Claude shows the full questionnaire and stops
2. User replies with answers → Claude parses, resolves the Sales Rep user ID, creates the Notion page, and confirms with the page URL

It is built for Apoorv Karmase, who runs this flow many times a day after cold calls, Loom sends, and meeting bookings.

## CRM identifiers (do not change these)

- **Notion data source ID:** `35faa3fe-784d-801f-b45f-000ba50423b4`
- **Data source URL:** `collection://35faa3fe-784d-801f-b45f-000ba50423b4`
- **Database URL:** `https://www.notion.so/35faa3fe784d80208254d6cddc9a4787`
- **CRM home page:** `https://www.notion.so/ionio/Outbound-Prospect-CRM-35faa3fe784d80cda4eecea57a4c5211`

## When to trigger

Trigger this skill whenever the user:
- Types "start", "begin", "new lead", "add lead", "log lead", "new prospect", "update CRM", or anything similar
- Mentions adding to the outbound CRM, prospect CRM, or leads database
- Says they just finished a cold call, sent a Loom, or booked a meeting and wants to log it

When in doubt, trigger. Missing a trigger costs more than a false positive here.

## Step 1: Show the questionnaire (turn one)

When the skill triggers, your only job in this turn is to reply with the questionnaire below verbatim, then stop. Do not call any tools yet. Do not ask follow-up questions. Do not add commentary before or after.

Format constraints:
- Plain markdown
- Never use em-dashes anywhere in the questionnaire or anywhere in your reply
- Never use "no X. no Y. no Z." negation list patterns
- Number every question, list every select option with a number next to it
- Keep it phone-friendly (Apoorv may use this on mobile after a call)

Show this exact text:

---

**New lead entry**

Reply with your answers below. You can answer in any format, numbered list, comma separated, or one per line. Type "skip" or leave blank for any field you want to skip.

1. **Company Name** (required)

2. **POC Name**

3. **Stage**
   1. Call Done
   2. Loom Sent
   3. Meeting Booked
   4. 1st Meeting Done
   5. 2nd Meeting Done
   6. Client Closed

4. **Company Size**
   1. $0-1M
   2. $1-5M
   3. $5-20M
   4. $20-50M
   5. $50-100M
   6. $100M+

5. **Date** (today by default, or specify like "2026-05-14" or "yesterday")

6. **Estimated LTV** (USD, just the number, accepts "35k" or "1.5m")

7. **Phone**

8. **Email**

9. **Company URL**

10. **LinkedIn URL**

11. **Sales Rep** (default: Apoorv Karmase)

12. **Remarks**

Send your answers and I will create the entry in the CRM.

---

After showing this, stop. Wait for the user's reply.

## Step 2: Parse the answers (turn two)

When the user replies, extract each field. Be liberal in what you accept.

**Stage and Company Size:**
- Accept either the option number (e.g. "2") or the exact text (e.g. "Loom Sent", "$1-5M")
- Map to the exact option strings listed below. Notion is strict about exact match.

**Date:**
- Default to today's date if blank or if the user types "today"
- Accept "yesterday", "tomorrow", ISO format ("2026-05-14"), or DD/MM/YYYY
- Always send to Notion as "YYYY-MM-DD"

**Est LTV:**
- Strip currency symbols and commas
- Accept "35k" → 35000, "1.5m" → 1500000, "100K" → 100000
- Send as a plain JavaScript number

**URLs (Company URL, LinkedIn URL):**
- Add "https://" if the user typed a bare domain like "acme.com"

**Phone:**
- Take whatever the user types, do not reformat

**Email:**
- Lower priority validation, just trust the user

**Empty / skip / "n/a" / "-" / "none":**
- Treat as not provided for any optional field
- Do not include that property in the create call (do not send empty strings)

**Sales Rep:**
- Default to "Apoorv Karmase" if blank or the user types "me", "default", "Apoorv", or "AK"
- Otherwise use the name the user typed

If **Company Name** is missing or unclear, ask only for that field and stop. Do not proceed without it.

## Step 3: Resolve the Sales Rep user ID

The Sales Rep field is a Notion `person` property and requires a user ID, not a name.

1. Call `notion-search` with `query_type: "user"` and the sales rep's name as the query
2. If a matching user comes back, take their UUID
3. Format the value as a JSON array string with one user ID inside, e.g. `["33cd872b-594c-81f5-a494-00023cdd27b3"]`
4. If no user is found, omit the Sales Rep field from the create call and mention in the confirmation message that Apoorv should add it manually in Notion

Do not block the entry on a failed user lookup. Always create the page.

## Step 4: Create the Notion page

Use the `notion-create-pages` tool with the parent set to the CRM data source.

**Parent block:**
```json
{
  "type": "data_source_id",
  "data_source_id": "35faa3fe-784d-801f-b45f-000ba50423b4"
}
```

**Property names** (exact, case sensitive):

| Field        | Property key                                  | Type         | Notes                                                                                                                |
|--------------|-----------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------|
| Company Name | `Company Name`                                | title        | Required, becomes the page title                                                                                     |
| POC Name     | `POC Name`                                    | text         |                                                                                                                      |
| Stage        | `Stage`                                       | select       | One of: `Call Done`, `Loom Sent`, `Meeting Booked`, `1st Meeting Done`, `2nd Meeting Done`, `Client Closed`         |
| Company Size | `Company Size`                                | select       | One of: `$0-1M`, `$1-5M`, `$5-20M`, `$20-50M`, `$50-100M`, `$100M+`                                                  |
| Date         | `date:Date:start` and `date:Date:is_datetime` | date         | Send `"YYYY-MM-DD"` for start, and `0` for is_datetime                                                               |
| Est LTV      | `Est LTV`                                     | number       | Plain JavaScript number, not a string                                                                                |
| Phone        | `Phone`                                       | phone_number |                                                                                                                      |
| Email        | `email`                                       | email        | Property name is literally lowercase "email", not "Email"                                                            |
| Company URL  | `Company URL`                                 | url          |                                                                                                                      |
| LinkedIn URL | `LinkedIn URL`                                | url          |                                                                                                                      |
| Sales Rep    | `Sales Rep`                                   | person       | JSON array string of user IDs, e.g. `"[\"uuid-here\"]"`                                                              |
| Remarks      | `Remarks`                                     | text         |                                                                                                                      |

Only include properties the user actually provided. Skipped fields should be omitted from the properties object entirely.

**Full example call** (assume the user answered every field):

```json
{
  "parent": {
    "type": "data_source_id",
    "data_source_id": "35faa3fe-784d-801f-b45f-000ba50423b4"
  },
  "pages": [
    {
      "properties": {
        "Company Name": "Acme Logistics",
        "POC Name": "John Smith",
        "Stage": "Loom Sent",
        "Company Size": "$5-20M",
        "date:Date:start": "2026-05-14",
        "date:Date:is_datetime": 0,
        "Est LTV": 35000,
        "Phone": "+1 415 555 0182",
        "email": "john@acmelogistics.com",
        "Company URL": "https://acmelogistics.com",
        "LinkedIn URL": "https://linkedin.com/in/johnsmith",
        "Sales Rep": "[\"33cd872b-594c-81f5-a494-00023cdd27b3\"]",
        "Remarks": "Warm intro from Sarah. Wants microsegments demo."
      }
    }
  ]
}
```

## Step 5: Confirm with the user

After the page is created, reply with a short confirmation, max five lines:

- Company name and stage
- Notion page URL from the create response
- Any field that could not be set (e.g. Sales Rep if user lookup failed)
- One closing line telling the user how to log another

Example:

> Logged **Acme Logistics** at "Loom Sent". Entry: https://www.notion.so/...
>
> Type "start" to log another.

Keep it tight. Do not list every field back to the user. Do not add a long postamble.

## Troubleshooting

**Stage or Company Size value rejected by Notion:** the value did not match an option string exactly. Re-check spelling, including the dollar sign and the dash, e.g. `$5-20M` not `$5 to 20M`.

**Sales Rep field rejected:** the person type needs a JSON array string of user IDs. If the user search returned nothing or the format is rejected, omit the field, finish the create, and tell Apoorv in the confirmation.

**Date error:** always convert to `YYYY-MM-DD` before sending. Convert "today", "yesterday", and "tomorrow" using the current date in the conversation context.

**Title missing:** Notion will reject a page with no title. If Company Name is empty, do not create the page, ask for it.

**Apoorv asks to update an existing lead, not create a new one:** this skill only handles creates. Tell him to share the page URL and update directly with `notion-update-page` using the same property names and types above.

## What this skill intentionally does not do

- It does not edit existing leads
- It does not check for duplicates, both entries get created if Apoorv enters the same company twice
- It does not query the CRM for analytics, use `notion-search` against the data source URL for that
