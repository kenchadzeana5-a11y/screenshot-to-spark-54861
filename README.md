# Startup Signal — AI Customer Complaint & Opportunity Discovery Agent

* **Live Demo:** https://screenshot-to-spark-54861.lovable.app
* **Survey Results Dataset:** `validation_survey_results.xlsx` (included in this repository)

## Overview
**Startup Signal** is a bilingual (English / Georgian) AI product discovery agent built for founders and product managers. It transforms raw, unstructured customer complaints into validated startup opportunities and actionable product roadmaps using a two-step, hallucination-resistant AI workflow.

## Two-Step AI Agent Architecture
1. **Step 1 — Theme Clustering & Opportunity Agent:** Groups unstructured feedback into prioritized pain-point clusters, calculates frequency, assigns severity & frustration scores, and generates concrete startup/fix recommendations.
2. **Step 2 — Evidence Verification Agent:** Extracts verbatim customer quotes with exact Complaint IDs and explains the grouping reasoning to eliminate AI hallucinations.
3. **Interactive Q&A ("Ask Questions"):** Allows founders to query the dataset in natural language for instant, data-backed answers.

## Problem Validation (Survey, N = 17)
* **88.2%** of surveyed founders, PMs, and business owners regularly or occasionally receive customer complaints, while **76.5%** lack an automated analysis tool.
* **94.1%** expressed interest in using an AI complaint-discovery tool and emphasized the need for exact counts, verbatim quotes, and concise AI explanations.

## Tech Stack & Data
* **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons
* **AI Engine:** Google Gemini / OpenAI API integration + built-in deterministic fallback engine
* **Benchmark Dataset:** Public consumer complaint data sourced from the **Consumer Financial Protection Bureau (CFPB)** (`consumerfinance.gov`).
* **Evaluation:** Benchmarked against 10 manually labeled CFPB complaints achieving **90% clustering accuracy**.
