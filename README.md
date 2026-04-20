# ClaimGuard Pattern Pulse

**🔴 Live Demo:** https://claimsight-frontend.onrender.com

Explainable AI anomaly detection for adjudicated Medicare 
Advantage claims. Detects behavioral anomalies before CMS 
encounter submission and routes HIGH-risk flags to SIU 
analysts for human review.

## The Problem
Medicare Advantage paid $23.67B in improper payments in 2025. 
CMS is auditing all MA contracts PY2018–2024 with extrapolation 
authority. One unsupported HCC code in an audit sample can 
translate into millions in recovery. Rules engines cannot catch 
behavioral patterns. ClaimGuard can.

## What ClaimGuard Detects
- Same-member, same-day location conflicts
- HCC anomaly scoring vs. 24-month member history
- Provider HCC submission rate vs. specialty peer cohort
- Unsupported RAF-driving diagnosis codes pre-submission

## AI Boundary
Rules engine → deterministic checks
AI layer → behavioral pattern detection
Human reviewer → every final decision
SIU determines fraud — ClaimGuard never does

## 6 Screens
1. Claims Ingestion
2. Anomaly Report Dashboard
3. Location Conflict Detail + SVG Map
4. HCC Anomaly Detail + Longitudinal Timeline
5. Reviewer Dashboard
6. Compliance Dashboard — RAF exposure + RADV readiness

## Tech Stack
React 18 | React Router v6 | Tailwind CSS | Synthetic data

## Note on Data
Built with synthetic claim data based on known MA industry 
patterns. Production requires real payer claims history, 
member history, and provider data inside a HIPAA-compliant 
payer environment.

## Built for
AI PM Bootcamp — Demo Day May 2026
