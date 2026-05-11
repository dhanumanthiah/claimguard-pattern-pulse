# ClaimGuard — Pre-Submission Payment Integrity AI for Medicare Advantage

**🔴 Live Demo:** https://claimsight-frontend.onrender.com

> *AI PM Bootcamp Capstone — Marily Nika's Cohort | Demo Day May 1, 2026*

---

## What ClaimGuard Does

ClaimGuard is a pre-submission payment integrity AI tool for Medicare Advantage payers. It detects behavioral anomalies in adjudicated claims — HCC upcoding patterns, location conflicts, provider billing outliers, and duplicate submissions — **before claims reach CMS encounter submission**, and routes HIGH-risk flags to SIU analysts for human review.

It is not a claim scrubber. It is not fraud detection. It is behavioral pattern detection at the pre-submission layer — the gap between what rules engines can check and what actually causes RADV audit clawback exposure.

---

## The Origin Story

This product came directly from nine years of payer-side operations work at a nonprofit Medicare Advantage health plan in Minnesota.

After leading the requirements and rebuild of the health plan's CMS encounter submission engine — and watching the rejection data patterns that came out of it — one thing became clear: **rules engines catch formatting errors. They don't catch behavior.** A provider who bills the same member from Tampa and Denver in the same week passes every deterministic check. A provider coding HCC 18 (Diabetes) for a member with no prior diabetes history in 24 months of claims passes every rules check too. Neither gets flagged. Both represent real RADV audit risk.

ClaimGuard was built to solve that gap.

→ See the full backstory: [encounter-submission-quality repo](https://github.com/dhanumanthiah/encounter-submission-quality)

---

## Why This Problem Matters

For non-healthcare readers, here's the financial mechanics:

**How Medicare Advantage payments work:**
- CMS pays Medicare Advantage health plans a per-member monthly capitation payment based on each member's **risk score**
- Risk scores are calculated from **HCC codes** (Hierarchical Condition Categories) — diagnosis codes submitted in encounter records
- Higher-acuity HCC codes → higher RAF score → higher capitation payment from CMS
- If HCC codes in submitted encounters are unsupported by clinical evidence, the health plan is receiving **overpayments it will have to return**

**The audit exposure:**
- CMS conducts **RADV audits** (Risk Adjustment Data Validation) — auditing a sample of claims to verify HCC codes are supported by medical records
- CMS has extrapolation authority — one unsupported HCC in an audit sample can be extrapolated across the entire contract population, turning a small finding into a multi-million dollar clawback
- **CMS is currently auditing all MA contracts PY2018–2024** — all 550+ health plans are exposed
- **$23.67B** in improper Medicare Advantage payments in FY2025 alone
- **$88B** in MA overspend vs. traditional Medicare (2024 MedPAC Report)

ClaimGuard sits at the point where this risk can still be corrected — before the encounter is submitted to CMS.

---

## The Competitive Gap

Post-submission payment integrity is crowded. Cotiviti, Reveleer, Codoxo — all retrospective, all working on claims after they've already been paid and submitted.

**Pre-submission behavioral AI with SIU workflow integration: almost no competition at this layer.**

That's not a gap in the market. That's the market.

| Layer | What It Does | Tools |
|---|---|---|
| Rules engine | Deterministic checks — format, field, logic | Existing adjudication systems |
| **ClaimGuard (AI layer)** | **Behavioral pattern detection — anomaly scoring** | **ClaimGuard** |
| SIU review | Human judgment — fraud determination | SIU analysts |
| Post-submission audit | Retrospective recovery | Cotiviti, Reveleer, Codoxo |

**AI boundary logic:** Rules engines handle what they're built for — deterministic checks. ClaimGuard handles what rules engines can't — behavioral patterns. SIU analysts make every final determination. ClaimGuard never determines fraud. It surfaces patterns and routes flags.

---

## Who This Is Built For

**Primary:** Payer CFOs and Chief Compliance Officers at Medicare Advantage health plans
- Financial risk: RADV clawback exposure from unsupported HCC codes
- Compliance risk: CMS audit of all MA contracts PY2018–2024

**Secondary:** SIU Directors and Payment Integrity Teams
- Operational tool: structured anomaly flags with evidence, not just alerts
- Workflow integration: flag → SIU queue → review decision → documentation

---

## What ClaimGuard Detects

**Three anomaly detection patterns:**

### 1. Location Conflict Detection
Member billed from two geographically impossible locations in the same timeframe.

> *Gloria Esteves — services billed from Denver, CO and Tampa, FL within the same week. Physical impossibility. HIGH risk flag.*

### 2. HCC Anomaly Scoring
HCC code submission inconsistent with 24-month member claims history and provider peer cohort.

> *David Kwan — HCC 18 (Diabetes with Chronic Complications) coded with no prior diabetes diagnosis in 24 months of member history. Provider submits HCC 18 at 4.2x the rate of specialty peer cohort. HIGH risk flag.*

### 3. Clean Baseline (Control)
> *Robert Harmon — HCC codes consistent with longitudinal member history. Provider submission rates within peer cohort norms. LOW risk. No flag.*

---

## Product Prototype — What You'll See in the Demo

Six screens demonstrating the full ClaimGuard workflow:

| Screen | What It Shows |
|---|---|
| **1. Claims Ingestion** | Adjudicated claim batch loaded for pre-submission review |
| **2. Anomaly Report Dashboard** | Summary view — risk distribution across claim batch, HIGH/MEDIUM/LOW flags |
| **3. Location Conflict Detail** | Gloria Esteves case — SVG map showing geographic impossibility, evidence panel |
| **4. HCC Anomaly Detail** | David Kwan case — longitudinal timeline, provider peer comparison, anomaly score |
| **5. Reviewer Dashboard** | SIU analyst workflow — flag queue, review actions, disposition tracking |
| **6. Compliance Dashboard** | RAF exposure summary, RADV readiness view, risk trend for CFO/CCO reporting |

**→ [Try the live demo](https://claimsight-frontend.onrender.com)**

> *Built with synthetic claim data based on known MA industry patterns. Production deployment requires real payer claims history, member history, and provider data inside a HIPAA-compliant payer environment.*

---

## Product Artifacts

This capstone includes a full product artifact set:

| Artifact | Description |
|---|---|
| **PRD v1.1** | 15-page product requirements document — problem, personas, user stories, AI boundary logic, roadmap |
| **SRD** | System requirements document — data inputs, anomaly scoring logic, SIU routing specification |
| **Demo Script** | 4-minute Demo Day script with Q&A preparation — presented to FAANG judges May 1, 2026 |
| **Persona & Empathy Map** | CFO, Chief Compliance Officer, SIU Director, Payment Integrity Analyst |
| **Demo Claims Dataset** | Synthetic data — 3 claim scenarios with full member history and provider peer data |

---

## Tech Stack

```
React 18 | React Router v6 | Tailwind CSS
Synthetic claim data | No backend | HIPAA-safe prototype
```

---

## Product Roadmap

| Phase | Focus | Status |
|---|---|---|
| **Phase 1** | Overcoding detection — HCC anomaly scoring, location conflicts, duplicate submissions | ✅ Demo Day MVP |
| **Phase 2** | Real payer data integration — live claims feed, EHR/claims API connectivity | Dependent on payer data access |
| **Phase 3** | SIU workflow platform — full case management, audit trail, disposition reporting | Dependent on engineering resources |
| **Phase 4** | Risk stratification — undercoding detection, surfacing members with likely undocumented HCCs | Post-Phase 3 |

> *Phases 2–4 are contingent on payer data access, engineering resources, and ML infrastructure. Phase 1 MVP is demonstrable with synthetic data.*

**Phase 4 note:** The same behavioral detection engine inverted. Instead of flagging providers who appear to be overcoding, Phase 4 surfaces members where legitimate clinical risk is likely being undercoded — HCCs the evidence suggests should be there but aren't. Same payer intelligence layer, different direction, significant revenue recovery opportunity.

---

## PM Reflection

ClaimGuard reinforced something I've believed since the encounter submission work: **the most valuable intervention happens before the problem becomes permanent.**

Post-submission recovery is expensive, slow, and adversarial. Pre-submission detection is clean, defensible, and protective of provider relationships. The industry has built a lot of tools for the former. Almost nothing exists for the latter — specifically at the behavioral AI layer.

The AI boundary logic in ClaimGuard — rules engines handle deterministic checks, AI handles behavioral patterns, humans make every final call — isn't just a product design decision. It's the only defensible architecture for a compliance-sensitive healthcare tool. Any design that puts AI in the decision seat in a RADV audit context is a product that won't survive procurement review at a health plan.

Building ClaimGuard from the CFO and SIU Director perspective, not the vendor perspective, changed how I think about what payment integrity AI actually needs to do to earn trust in a payer environment.

---

## Connect

**Deepa Hanumanthiah** — Senior AI Product Manager | Healthcare AI & Payer Operations

[LinkedIn](https://www.linkedin.com/in/deepa-hanumanthiah-0a02b41b) • [GitHub](https://github.com/dhanumanthiah) • [Encounter Submission Backstory](https://github.com/dhanumanthiah/encounter-submission-quality)

---

*Built as an AI PM Bootcamp capstone. All claim scenarios use synthetic data. No PHI. No proprietary payer data.*
