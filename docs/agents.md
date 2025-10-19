# EMS Scenario Builder – Agent Operations Manual

## Scope & Instruction Order
- Applies to the entire repository.
- Obey instruction precedence: system → developer → user → this manual → in-repo comments/configuration.
- Pause immediately if instructions conflict or compromise data integrity; surface the conflict before acting.

## Repository Orientation
- `docs/package.json` hosts the npm scripts for validation, linting, unit tests, and end-to-end tests.
- `docs/scenarios/` contains source-of-truth scenario JSON files; treat them as production assets.
- `docs/schema/scenario.v27.json` defines the contract for every scenario payload; schema compliance is mandatory.
- `docs/index.md` links lightweight documentation entry points; keep it current when adding guides.

## Standard Workflow
1. Restate the request, flag assumptions, and wait for confirmation when scope is ambiguous.
2. Review relevant assets (scenarios, schema, scripts) before making changes.
3. Sketch the implementation approach (including affected files, tests, and risks) prior to editing.
4. Execute changes in focused commits; keep logical steps isolated for reviewability.
5. Cross-check outputs against schema, tests, and documentation.
6. Summarize work, surface caveats, and include test evidence in the PR message.

## Data & Implementation Guidelines
- Maintain two-space indentation for JSON; preserve key ordering unless the change requires reordering.
- Scenario JSON **must** include the top-level objects required by the schema: `meta`, `text`, `flags`, `timing`, `injects`, `vitals`, `sample`, `opqrst`, `audios`, `treatments`, and `prompts`.
- Respect schema constraints (required keys, enums, numeric ranges). Update or extend the schema before introducing fields that fall outside existing definitions.
- Use stable, descriptive `id` values for injects, treatments, and audio entries; avoid collisions with existing identifiers.
- Keep narrative strings (dispatch notes, SAMPLE history, OPQRST) concise but clinically meaningful. Break long passages with explicit `\n` line breaks for readability.
- When extending treatments, supply `eff`, `min`, and `cap` objects that reflect realistic physiology; document rationale in the PR.
- Validate backwards compatibility—do not delete or rename fields that downstream consumers rely upon without stakeholder approval.

## Automation & Testing
Run the following from the repository root (install dependencies in `docs/` first):
1. `npm run validate:json` – ensures every scenario matches the schema.
2. `npm run lint` – enforces JavaScript/TypeScript style and catches common errors.
3. `npm run test:unit` – executes deterministic unit tests in band with coverage.
4. `npm run test:e2e` – runs Playwright smoke tests for scenario interactions.
5. `npm run test:all` – orchestrates validation, linting, unit, and e2e suites in one pass.

Re-run the specific checks that cover the files you touched after every change; include the exact commands and outcomes in the PR body.

## Documentation Expectations
- Update scenario documentation or changelogs alongside behavioral changes.
- Document new scripts, schema revisions, or conventions in the docs folder; cross-link from `docs/index.md`.
- For new scenarios, add author metadata, describe intended training objectives, and reference supporting materials if available.

## Git & PR Hygiene
- Use imperative, descriptive commit messages (“Add hypoglycemia scenario vitals override”).
- Keep diffs minimal—avoid opportunistic refactors unless scoped work allows.
- In PR descriptions, provide: summary, implementation notes, test commands & results, schema/consumer impacts, outstanding questions.
- Request review from domain stakeholders (training/EMS SMEs) when altering clinical content.

## Continuous Improvement
- Capture recurring issues or tribal knowledge in this manual.
- Propose schema or tooling enhancements when manual validation becomes error-prone.
- Default to creating task stubs for future work if blocked or out-of-scope items arise.


