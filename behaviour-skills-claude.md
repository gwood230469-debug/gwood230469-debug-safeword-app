# Behaviour & Skills — Claude

## Purpose
This document summarizes the typical behaviour, core skills, strengths, limitations, and recommended prompt patterns for the Claude family of models (Anthropic). It is intended as a quick-reference guide for prompt authors, engineers, and product designers.

## High-level behaviour
- Safety-first orientation: Claude is designed to follow safety and policy constraints, avoid harmful outputs, and refuse unsafe requests.
- Helpful and cooperative: Prefers clarifying questions when the user intent is ambiguous, and aims to be polite and informative.
- Instruction-following: Optimized for following explicit instructions and chains of thought when requested.
- Conservative factuality: Tends toward conservative answers and may hedge when uncertain.

## Core skills
- Natural language understanding: Good at parsing complex instructions, intent detection, and context retention across turns.
- Summarization: Accurate multi-paragraph summarization, extractive and abstractive styles.
- Code assistance: Generates, explains, and refactors code in many languages; performance varies by language/complexity.
- Reasoning & problem solving: Strong at stepwise reasoning for conceptual tasks and many logic problems; explicit stepwise prompts improve results.
- Editing & rewriting: Rewrites text for tone, clarity, concision, or format conversion.
- Knowledge synthesis: Aggregates and synthesizes information, but knowledge cutoff and safety filters apply.
- Conversation & persona: Can maintain a consistent, user-specified persona or tone when requested.
- Limited multimodal handling: Some Claude variants support images; behaviour differs by model/version.

## Strengths
- Safety and alignment engineering reduces toxic or disallowed outputs.
- Good at following detailed, multi-step instructions.
- Produces well-structured prose suitable for docs, summaries, and explanations.
- Helpful for code review, doc generation, and drafting content.

## Limitations
- Not guaranteed up-to-date — check knowledge cutoff for factual recency.
- May produce plausible-sounding but incorrect statements (hallucinations).
- Sensitive to prompt phrasing; small changes can alter output style and correctness.
- Can be overly verbose or conservative unless instructed otherwise.
- May refuse creative or edge-case prompts if flagged by safety filters.

## Best practices for prompting
- Be explicit: use clear instructions and example inputs/outputs.
- Use stepwise decomposition: ask for numbered steps or chain-of-thought when needed.
- Specify format: provide exact output formats (JSON schema, markdown headings, code block languages).
- Control verbosity: add constraints like "in 3 sentences" or "summarise in bullet points".
- Ask for uncertainty signals: "If you are unsure, say 'I don't know' and list assumptions."
- Use system-style preface: provide context, role, or constraints at the start of the conversation.

## Prompt patterns (examples)
- Summarization:
  - "Summarize the following text in 4 bullet points and include one suggested follow-up question."
- Code generation:
  - "Write a Python function `fetch_data(url)` that retries up to 3 times, raises ValueError on 4xx, and logs errors. Provide tests using pytest."
- Stepwise reasoning:
  - "Break down how to design a REST API for a notes app into numbered design decisions, with pros/cons for each."
- Safety-aware reply:
  - "Provide a safe, non-actionable explanation of why the following action is hazardous and suggest harm-minimizing alternatives."

## Output formatting tips
- Request code fenced blocks and specify the language for syntax highlighting.
- For machine-readable outputs, ask for strict JSON matching a schema.
- When iterating, provide the previous output and clearly mark what changed.

## Handling uncertainty and hallucinations
- Encourage the model to cite sources or indicate uncertainty: "If you are unsure, state your confidence and list assumptions."
- Validate critical facts with external sources; treat model output as draft-level until verified.

## Tuning model behaviour
- Temperature / randomness: Lower temperature for deterministic, precise outputs; higher for creative tasks.
- System context: Use a strong initial system prompt to set role, policies, and constraints.
- Few-shot examples: Provide 1–3 examples to anchor desired style/format.

## Safety and content policy considerations
- Avoid prompting the model to produce disallowed content (illegal instructions, personal data misuse, etc.).
- Use refusal language templates when requiring the model to decline unsafe requests.

## Example prompt templates
- "You are an expert technical writer. Convert the following API docs into a one-page README with code examples: <API TEXT>"
- "You are a security analyst. Review the snippet below and list potential vulnerabilities with severity (low/med/high). If nothing is wrong, say 'No issues found'."

## Quick checklist for reviewers
- Did the prompt specify role and output format?
- Did the prompt bound verbosity and style?
- Are assumptions and unknowns requested explicitly?
- Is there an instruction to verify facts or cite sources when needed?

## Further reading & references
- Consult Anthropic's official docs for model-specific behavior, version differences, and safety guidelines.
- Combine Claude outputs with external verification (search, tests, linters) for production use.
