# Government Adoption Plan — Public Request Management System (PRM)

**Your one-page story:** A Tamil + English citizen grievance system where the public submits a request, the office gets an instant alert, staff track it to resolution, and the citizen can check the status anytime — built on **official Tamil Nadu master data** (38 districts, 314 taluks, 662 urban local bodies, 12,479 wards, 234 Assembly and 39 Parliament constituencies).

---

## 1. Why this is a strong proposal

- **Solves a real problem:** MLA/PA offices still track complaints in diaries, WhatsApp texts and Excel. There is no simple, free tool built *for a constituency office*.
- **Official data, not guesses:** every district/taluk/local body/ward/constituency is from official government sources, with Tamil + English names. This is the single most convincing detail for an official audience.
- **Bilingual-first:** the form defaults to Tamil; every dropdown switches to Tamil. This is a government requirement, not a nice-to-have.
- **Trust & privacy by design:** Row-Level Security, separate publishable/key secret, no public access to personal data, honeypot + rate limiting against spam.
- **Already end-to-end working:** submit → notify → dashboard → status tracking → Excel/CSV export → WhatsApp/Telegram alert → receipt download → QR code.
- **Built with AI assistance** (Next.js + TypeScript + Supabase) — honest, fast, modern; shows you can ship.

## 2. What already works well (your demo evidence)

| Area | What's proven |
|---|---|
| Master data | 38 districts, 314 taluks, 662 ULBs, 12,479 wards, 234 ACs, 39 PCs — official, Tamil + English |
| Submission | Public form (Tamil-first), file attachment, validation, spam protection |
| Notification | Instant WhatsApp (Cloud API) and/or Telegram alert to the office |
| Admin | Dashboard with filters, stats, search, export Excel/CSV, QR, pagination |
| Resolution | Status flow: New → Under Review → In Progress → Resolved / Rejected / Duplicate; assign to staff; internal notes |
| Citizen | Request ID + receipt download + WhatsApp link; **public tracking** (`/track`) |
| Privacy | RLS, secret-key server calls, no public read on personal data |

## 3. The workflow that makes work actually get done

```
 Citizen ──▶ Public Form (Tamil/English)
              │
              ▼
        request_number + receipt
              │            │
              ▼            ▼
   Office alert (WhatsApp/Telegram)      Citizen can /track status
              │
              ▼
   Staff dashboard (filters, search, export)
              │
              ▼
   Triage: Under Review (check validity, assign ward/office)
              │
              ▼
   In Progress (staff works it; internal notes)
              │
              ▼
   Resolved / Rejected / Duplicate (with internal note)
              │
              ▼
   Citizen informed (WhatsApp/link) + status visible on /track
```

**Recommended office SLAs (set targets so it's monitorable):**
- Acknowledge (New → Under Review): within **1 working day**
- First action (Under Review → In Progress): within **3 working days**
- Resolution target: within **15 working days** (escalate after 30)
- Daily 10-minute routine: open dashboard → check Today's New → reply to citizens.

**Status discipline:** never leave a request "New" for more than a day. Use **Duplicate** for repeats (keeps the dashboard honest). Write the outcome in **Internal Notes** — this becomes your official record and export.

## 4. Roadmap (what to build next, in order)

1. **Done:** submission, notification, dashboard, tracking, export.
2. **Pilot (1–2 weeks):** run live in your brother's MLA office; add the office's real categories (road, water, streetlight, ration card, pension, land records…); create staff users for each office person.
3. **Weekly report (1 week):** automated WhatsApp/email summary each Friday — "This week: 34 new, 12 resolved, avg time 6 days." This is what an MLA will love showing.
4. **Public dashboard (2–4 weeks):** aggregate stats per ward/taluk/category (no personal data) — "which ward has the most pending road complaints."
5. **Office integration (later):** connect to official portals (e.g., TN e-Sevai / CM Helpline 1100) via their APIs or exports, so you don't double-enter.

## 5. Five-minute demo script (for your brother's MLA / the PA office)

1. **10 sec — the problem:** "Today, complaints live in diaries, texts and Excel. Nobody can see the status, and the citizen always calls back asking 'any update?'."
2. **30 sec — submit live:** open the phone, submit a request in Tamil, show the Request ID + receipt.
3. **15 sec — instant alert:** show the WhatsApp/Telegram notification arriving on the office phone at the same moment.
4. **60 sec — dashboard:** show filters (by ward, category, status), stats cards, and the 1-click Excel export of the month.
5. **30 sec — tracking:** show the citizen's `/track` page updating to "In Progress" after you change it.
6. **30 sec — the data:** "Everything runs on official district/taluk/local-body/ward data — 12,479 wards — no manual lists."
7. **Close with a question:** "We're running it live in <MLA> sahab's office. Would you like a pilot here too?"

**Do NOT claim** it is approved by any government, or that it replaces CM Helpline. Position it as: *a working prototype built for a constituency office, ready to pilot and then integrate with official systems.*

## 6. If the IT & AI Minister (or his office) calls — what to say and ask

**Positioning line:** "Sir, we built a Tamil-English public grievance tracking system on official government master data, working end-to-end today. It's designed to be piloted in an MLA constituency office and integrated with state systems."

**Say (facts only, 2–3 minutes):**
- "Public submits in Tamil, the office gets an instant alert, everything is tracked to resolution, the citizen can check status — and it runs on official district/taluk/ward data."
- "Built with modern web stack and AI assistance; it's bilingual-first and privacy-safe by design."
- "It's a working prototype — we want to pilot it with a constituency office and improve it with real feedback."

**Ask (choose 2–3, then stop talking — let them answer):**
1. "Which department or team in the state runs citizen services — is there a pilot program we can apply to?"
2. "Can we get access to official complaint data or APIs (e.g., TN e-Sevai / CM Helpline 1100) so the system doesn't double-enter data?"
3. "Are there open-call opportunities — hackathons, internship programs, or startup-support schemes (TN StartHub / Elevate) — where a prototype like this can be presented?"
4. "For Tamil-language software, is there a preferred translation/OCR standard we should comply with?"
5. "If we pilot this in one constituency for 90 days, would there be a way to share the results with your office?"

**Golden rules:** Ask for *next steps*, not favours. Never promise what the app can't do. Always close with a specific, small, trackable ask (e.g., "may I send a one-page summary and a 2-minute video?"). Follow up within 48 hours.

## 7. Notification channels — WhatsApp is only one option

| Channel | Cost | Setup | Best for |
|---|---|---|---|
| **WhatsApp Cloud API** | Free (Meta) | Needs approved template + number verification | Citizen-facing, familiar |
| **Telegram bot** | Free | 5 minutes (BotFather) | Office alerts + staff group — **best for you to start** |
| **Email (Resend/Brevo)** | Free tier | ~15 minutes | Official record, weekly reports |
| **SMS (MSG91/Twilio)** | Paid per message | Medium | Citizens without smartphones |
| **In-app badge** | Free | Already dashboardable | Daily routine (recommended regardless) |

**Recommendation:** run **Telegram + in-app** first (free, instant, no template pain), add **WhatsApp** for the public-facing alerts, and **weekly email reports** for the MLA.

## 8. How you'll measure success

- **For the office:** % requests responded within 1 day; % resolved in 15 days; % that became Duplicates (feedback loop).
- **For the citizen:** can they track status without calling? Reply time when they do call.
- **For you:** number of pilots (start: 1 MLA office → 2–3 offices → district administration), then number of monthly active citizens.

## 9. Risks and how to be honest about them

- **It's a prototype, not a certified product.** Say so. Real government deployment needs a security audit, data-protection compliance (DPDP Act 2023), and official approval. Frame the pilot as the way to find out what's needed.
- **Personal data.** Collect only what's needed; RLS already blocks public reads; delete old data on request. Document this in the one-pager.
- **Don't overpromise AI.** Say "AI-assisted development", not "an AI system". The data and workflow are real; the AI was the builder, not the brain.
- **Official integration takes time.** Show export/import instead of promising API magic until it exists.

## 10. Your 30-day action plan

| Day | Action |
|---|---|
| 1–2 | Present to your brother's MLA/PA; get a live pilot nod |
| 3–5 | Set up Telegram alerts + create staff users; add the office's real categories |
| 6–10 | Run real requests; tighten status workflow and SLAs with the office |
| 11–14 | Build the weekly WhatsApp/email summary report |
| 15–20 | Create the 2-minute demo video + one-page PDF (use this doc) |
| 21–25 | Send the one-pager + video to the IT/AI Minister's office and to TN startup/e-gov programs |
| 26–30 | Follow up every 48h; prepare answers to the "what's next" questions in Section 6 |

## 11. What I recommend building next (quick wins)

1. Public `/track` page — **done** (in this codebase).
2. Office categories + staff invites.
3. Weekly summary notification (Telegram + email).
4. Public aggregate dashboard (no personal data).
5. One-page PDF "pitch" generated from this document.

---

*Bottom line: you don't need a ministry to start. One MLA office, live and visibly working, is a better pitch than any slide deck. Win the pilot, measure it, then take the numbers to the IT & AI Minister.*
