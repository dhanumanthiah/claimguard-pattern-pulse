# ClaimGuard Pattern Pulse

**🔴 Live Demo:** https://claim-guard-pattern-pulse-code-fron.vercel.app/
**💻 GitHub:** https://github.com/dhanumanthiah/claimguard-pattern-pulse

Explainable AI anomaly detection for adjudicated Medicare Advantage claims. Detects behavioral anomalies — location conflicts, unsupported HCC codes, provider pattern spikes — before CMS encounter submission and routes HIGH-risk flags to SIU analysts for human review with plain-English explanations.

---

## The Problem

Medicare Advantage paid **$23.67 billion** in improper payments in 2025. CMS has announced it will audit all MA contracts for payment years 2018–2024 using extrapolation methodology.

One unsupported HCC code in an audit sample is not just one claim. Under RADV extrapolation authority, it is projected across the entire contract. One $200 diagnosis code can become millions in recovery.

Rules engines catch what they are programmed to catch — duplicate IDs, invalid codes, format errors. They cannot do this:

- Compare a provider's HCC submission rate against their specialty peer cohort
- Look at a member's 24-month diagnosis history and detect a clinically unsupported code
- Identify that the same member appeared at facilities 1,698 miles apart on the same day

These are behavioral patterns. They require learning from data across populations. That is the gap ClaimGuard fills.

---

## Where ClaimGuard Sits

```
Claims System
      ↓
Claim Adjudication (existing system — unchanged)
      ↓
◀ ClaimGuard Pattern Pulse — POST-ADJUDICATION LAYER ▶
      ↓
SIU Analyst Review Queue
      ↓
Encounter File Preparation
      ↓
CMS Submission (RAPS / EDPS)
```

ClaimGuard sits **upstream of CMS encounter submission**. It does not replace adjudication. It does not deny claims. It does not determine fraud. It gives the right human reviewer the right signal at the right time — before the encounter file leaves the building.

---

## What ClaimGuard Detects

| Anomaly Type | Detection Method | Example |
|---|---|---|
| Location Conflict | Rules engine — Haversine distance formula | Member in Denver 9AM and Tampa 11:30AM same day — 1,698 miles |
| HCC Anomaly | AI behavioral scoring — gradient boosting | E11.649 (HCC 18) submitted with no prior diabetes history, provider 4.2x above peer HCC rate |
| Duplicate Detection | Rules engine — claim hash comparison | Overlapping services, same member, same date |
| Provider Pattern Spike | Gradient boosting vs specialty peer cohort | HCC submission rate 3x+ above peer average for same member risk tier |

---

## System Architecture

### Production Data Flow

```
Payer Claims System (adjudicated)
      ↓
[1] INGESTION LAYER
    REST API — accepts EDI 837 / HL7 FHIR
    Validates fields, normalizes formats
    Extracts facility coordinates for geographic checks
      ↓
[2] DETECTION LAYER (runs in parallel)
    ├── Rules Engine — deterministic checks
    │     Haversine distance calculation
    │     Duplicate claim hash comparison
    │     Date/time overlap detection
    │
    └── ML Behavioral Scoring — XGBoost / LightGBM
          Provider HCC rate vs specialty peer cohort
          Member 24-month diagnosis consistency score
          Supporting lab / pharmacy evidence check
          Behavioral spike vs provider's own baseline
          Output: risk score + SHAP feature importance
      ↓
[3] EXPLANATION LAYER
    LLM API (GPT-4 / Claude) with structured prompt
    Input: SHAP values + claim metadata + member history (RAG optional)
    Output: plain-English reason code, validated before storage
      ↓
[4] REVIEWER LAYER
    Web-based SIU queue — role-based access control
    Reviewer actions: Valid / Data Error / Escalate to SIU
    Every decision logged — immutable audit trail
    SIU notification panel fires on escalation
      ↓
[5] FEEDBACK LAYER
    Reviewer decisions stored as labeled training data
    Quarterly model retraining triggered by precision monitoring
    Model versioning — rollback available
```

### Why This Architecture

**Rules engine first, ML second.** Location conflicts and duplicate claims are always wrong regardless of context — no ML needed, no false positives, 100% precision. ML handles the cases that require population-level learning: behavioral patterns that only emerge when you compare across thousands of claims.

**Gradient boosting, not deep learning.** Claims data is structured tabular data. Gradient boosting (XGBoost / LightGBM) consistently outperforms deep learning on structured tabular data and produces SHAP values — which tell you exactly which features drove each prediction. In a RADV audit context, "the provider's HCC 18 rate is 4.2x above specialty peers and the member has no prior diabetes history" is a defensible answer. A neural network probability score is not.

**LLM for explanation only, not detection.** An LLM hallucinating a reason code in a RADV audit context is a compliance liability. LLMs are non-deterministic — the same claim could receive a different explanation on different runs. That is not acceptable in a regulated healthcare workflow. The ML model makes the detection decision. The LLM translates it into plain English for the reviewer.

**SHAP values bridge ML and language.** SHAP (SHapley Additive exPlanations) calculates how much each feature contributed to a specific prediction. For David Kwan's claim: 60% driven by no prior diabetes history, 25% by provider HCC rate being 4.2x above peers, 15% by no supporting lab evidence. That structured signal is what the LLM uses to generate a traceable, specific explanation — not a generic flag.

---

## AI Approach

### AI Boundary Statement

```
Rules engine   → deterministic checks (always right, no ML needed)
ML layer       → behavioral pattern detection (population-level learning)
LLM layer      → plain-English explanation generation only
Human reviewer → every final decision
SIU analyst    → determines fraud — ClaimGuard never does
```

Fraud requires a legal determination of intent. Only law enforcement, the OIG, or a court can make that call. ClaimGuard is a **payment integrity tool with SIU workflow integration** — not a fraud detection system.

### Why Not a Pure LLM End-to-End

Claims anomaly detection requires precision, determinism, and auditability. Three reasons gradient boosting over LLM for detection:

1. **Structured tabular data** — claims data is not text. Gradient boosting was built for this data type.
2. **Interpretability** — SHAP values give a traceable explanation for every flag. Regulators can audit it.
3. **Regulatory defensibility** — "the provider's HCC rate is 4.2x above peers" is defensible in a RADV audit. An LLM confidence score is not.

### RAG — Optional Enhancement for Phase 2

RAG (Retrieval Augmented Generation) would allow the LLM to retrieve the member's 24-month claim history from a vector database before generating the explanation — grounding the reason code in specific clinical evidence rather than structured signals alone. Not required for Phase 1. Significantly improves explanation specificity in Phase 2.

---

## Demo Scenarios

Three synthetic claim scenarios built on known MA industry patterns:

**Claim A — Clean (Robert Harmon, 71M)**
Routine office visit. Auto-clears. LOW risk. Demonstrates the system doesn't flag everything — precision matters more than recall in Phase 1.

**Claim B — Location Conflict (Gloria Esteves, 68F)**
ECG at Lakewood Heart Center, Denver CO at 9:00 AM.
Office visit at Suncoast Medical Group, Tampa FL at 11:30 AM.
Distance: 1,698 miles. Time window: 2.5 hours.
Physical presence at both locations is not clinically possible. HIGH risk. Escalated to SIU.

**Claim C — HCC Anomaly (David Kwan, 74M)**
Diagnosis E11.649 — Type 2 Diabetes with Hypoglycemia (HCC 18) submitted by Dr. Marcus Bell, Endocrinology.
No prior diabetes diagnosis in 24-month member history. No A1C labs. No endocrinology referrals.
Provider HCC 18/19 submission rate: 4.2x above specialty peer average.
HIGH risk. Flagged for medical record review before encounter submission.

---

## Application Screens

1. **Claims Ingestion** — Batch load with row-by-row animation
2. **Anomaly Report** — Color-coded risk badges, signal summary, clickable queue
3. **Location Conflict Detail** — SVG map (Denver→Tampa), typing explanation panel, reviewer actions
4. **HCC Anomaly Detail** — 24-month longitudinal history timeline, behavioral scoring explanation
5. **Reviewer Dashboard** — Donut chart, activity feed, feedback loop banner
6. **Compliance Dashboard** — RAF exposure estimate, provider alert, RADV audit readiness panel

---

## Reviewer Workflow

```
HIGH-risk flag detected
      ↓
SHAP values calculated — feature attribution
      ↓
LLM generates plain-English explanation
      ↓
SIU Analyst reviews in queue
      ↓
Decision: Valid / Data Error / Escalate to SIU
      ↓
Decision logged — timestamp + reviewer ID (RADV audit trail)
      ↓
SIU notification panel fires on escalation
      ↓
Reviewer decision stored as training label (feedback loop)
```

---

## Tech Stack

**Phase 1 Prototype (current)**

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v6 |
| Styling | Tailwind CSS |
| Data | Hardcoded synthetic JSON — no backend |
| Deployment | Render |

**Production Architecture (Phase 2+)**

| Layer | Technology | Purpose |
|---|---|---|
| Ingestion | REST API — EDI 837 / HL7 FHIR | Claim intake and normalization |
| Rules Engine | Python — Haversine, hash comparison | Deterministic anomaly detection |
| ML Layer | XGBoost / LightGBM + SHAP | Behavioral scoring and explainability |
| LLM Layer | GPT-4 / Claude via API (BAA required) | Plain-English explanation generation |
| RAG (optional) | Vector DB — Pinecone / pgvector | Member history retrieval for grounding |
| Backend | REST API — HIPAA-eligible cloud | Claim processing and reviewer queue |
| Auth | Role-based access control | SIU analyst vs compliance leader views |
| Audit Log | Immutable decision store | RADV audit trail |
| Feedback Store | Labeled training data pipeline | Model retraining inputs |

---

## Data Standards

| Standard | Role in ClaimGuard |
|---|---|
| EDI 837 | Primary claim ingestion format from payer claims system |
| HL7 FHIR | Alternative ingestion format via FHIR Claim resource |
| RAPS | CMS risk adjustment processing — ClaimGuard sits upstream |
| EDPS | CMS encounter data processing — ClaimGuard sits upstream |
| ICD-10-CM | Diagnosis code standard for HCC mapping |
| HCC V28 | Current CMS HCC model version — model retraining required on version updates |

---

## Roadmap

> **Note:** Phases 2, 3, and 4 are contingent on payer data access, engineering resources, and ML infrastructure. Phase 1 MVP is demonstrable with synthetic claim data today.

| Phase | Scope | AI Layer | Dependencies |
|---|---|---|---|
| **Phase 1 — MVP** | Location conflict, HCC anomaly scoring, explanation panel, reviewer queue, SIU notification, compliance dashboard | Rules engine + prototype | Synthetic data — demonstrable now |
| **Phase 2 — Intelligence** | Supervised ML on real claims, provider peer benchmarking, feedback loop, model retraining pipeline | Gradient boosting on real claims history | Payer data access + ML engineering |
| **Phase 3 — Scale** | Pre-submission workflow orchestration, encounter file hold automation, multi-plan SaaS deployment | Reinforcement learning from reviewer feedback | Engineering team + integration access |
| **Phase 4 — RAF Platform** | Member risk stratification — undercoding detection, surface legitimate undocumented HCCs | Population-level member risk pattern detection | Clinical coding partnership + human validation gate |

**Phase 4 vision:** ClaimGuard as a two-sided RAF Integrity Platform. Phases 1–3 protect the plan from overcoding liability and RADV clawback. Phase 4 helps the plan identify legitimate risk adjustment revenue left on the table — same pattern detection engine, opposite direction.

---

## Success Metrics

| Metric | Target | Why It Matters |
|---|---|---|
| Precision on HIGH-risk flags | 80%+ at launch | Low precision destroys reviewer trust and adoption |
| Explanation comprehension | 90%+ reviewers understand flag without help | Auditability and reviewer confidence |
| False positive rate | <20% on HIGH-risk flags | Phase 1 prioritizes precision over recall |
| Model drift trigger | Retrain if precision drops below 70% | CMS model updates (V28) shift distributions |

**North Star Metric:** Number of high-risk claims corrected or withheld from CMS encounter submission per month — the direct measure of RADV exposure avoided.

---

## Market Context

| Competitor | Approach | Gap vs ClaimGuard |
|---|---|---|
| Cotiviti | Retrospective payment integrity audits | Post-submission, reactive — finds problems after they reach CMS |
| Reveleer | Risk adjustment analytics, RADV audit support | Audit prep, not pre-submission real-time detection |
| SmarterDx | Clinical documentation improvement for HCC coding | Provider-side, not payer SIU workflow |
| HiLabs | AI for claims data quality and risk adjustment | Data quality focus, less reviewer workflow integration |
| Codoxo | Forensic AI for FWA detection | Strong on retrospective audit risk scoring |

**ClaimGuard's differentiation:** Pre-submission, real-time behavioral pattern detection with plain-English explainability and SIU workflow integration. Incumbents find problems after they reach CMS. ClaimGuard catches them before the encounter file leaves the building.

---

## Note on Data

Built with synthetic claim data constructed from known Medicare Advantage industry patterns. Real PHI lives inside payer systems behind HIPAA walls and does not leave that environment. This prototype validates the detection logic, reviewer workflow, and compliance dashboard UX. Production deployment requires real payer claims history, member history, and provider data inside a HIPAA-compliant payer environment with a signed BAA in place.

---

## Background

Built by a Senior AI PM with 9 years of Medicare Advantage payer operations experience — spanning HCC/RAF data integrity, encounter submission, RADV audit preparation, claims adjudication logic, EDI/HL7/FHIR data standards, Power BI dashboards, and SIU workflow. ClaimGuard is built from the inside out: the system that was missing while watching claims with unsupported HCC codes sail through the rules engine and into the encounter file, year after year, until a RADV audit surfaced them.

**Related:** [EncounterIQ](https://github.com/dhanumanthiah/encounteriq) — GenAI copilot for payer-side encounter submission reconciliation. Downstream of ClaimGuard in the MA data flow.

---

## Built With

- Product architecture and PRD — Claude (Anthropic)
- React prototype — Ember AI
- AI PM Bootcamp — Marily Nika

---

*Demo Day May 2026*
