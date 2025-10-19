# Agents Catalog and Runbook

> Single source of truth for agent behavior, tools, workflows, and guardrails for the EMT Scenario Dashboard. Drop this file at `docs/agents.md`.

---

## 0) Agent Registry

| ID       | Name             | Purpose                                              | Inputs                                      | Tools                               | Triggers                                           | Owner | Status |
|----------|------------------|------------------------------------------------------|---------------------------------------------|-------------------------------------|----------------------------------------------------|-------|--------|
| ag.build | ScenarioBuilder  | Maintain scenario JSON and reflect edits in Builder  | Field edits, JSON imports, audio picks      | fs.write, schema.validate           | `import.json`, `user.edit`, `audio.selected`       | you   | prod   |
| ag.play  | ScenarioRunner   | Drive Play UI from scenario and runtime state        | `start`, `pause`, `reset`, ticks, btn clicks| timer, audio.play, state.cache, ui  | `start`, `pause`, `reset`, `inject.fire`, `tx.toggle`| you | prod   |

---

## 1) Global Conventions

- **Schema root:** `/schema/scenario.v27.json`
- **Storage key:** `localStorage.emtScenarioRunnerV27`
- **Message shape (if using tool-calling):**
  ```json
  { "role": "system|user|agent", "name": "<agentId>", "content": "...", "tool_call": { "name": "", "args": {} } }
  ```
- **Defaults:** temperature 0.2, top_p 1.0, stop `["</END>"]`
- **Token budgets:** build ≤ 1000 tokens/op; play ≤ 512 tokens/tick
- **Retries:** 2 with jitter; **Timeouts:** tool 8s, UI op 2s
- **Rate limits:** ≤ 4 tool calls/sec/agent
- **PII & media:** never persist uploaded audio; strip `blob:` URLs before save

---

## 2) Tool Contracts

### fs.write
- **desc:** Write JSON to `/scenarios/` or update localStorage.
- **input:**
  ```json
  { "path": "scenarios/<slug>.json", "contents": "<stringified json>" }
  ```
- **output:** `{ "ok": true }`
- **limits:** 200KB. Deny absolute paths.

### schema.validate
- **desc:** Validate a scenario against `scenario.v27.json`.
- **input:** `{ "doc": { ... } }`
- **output:** `{ "ok": true, "errors": [] }`

### audio.play
- **desc:** Play loaded audio cue by index.
- **input:** `{ "index": 0, "loop": false }`
- **output:** `{ "ok": true }`

### timer
- **desc:** Start/stop 1s tick driving `tick()`.
- **input:** `{ "op": "start|stop" }`

### ui
- **desc:** Mutate DOM via `renderAll()` and builders.
- **input:** `{ "op": "render" }`

> Add real tools you expose and keep I/O schemas here.

---

## 3) Per-Agent Specs

### ag.build — ScenarioBuilder

- **Mission:** Maintain a valid scenario JSON and reflect edits into Builder preview.
- **Reads/Writes:** `localStorage.emtScenarioRunnerV27`, `/scenarios/*.json` (export/import).
- **Inputs:** User field changes, JSON import, audio file selection.
- **Outputs:** Updated JSON, validation results, preview diffs, autosave status.
- **System prompt (summary):**
  ```
  Update scenario JSON. Enforce schema. On import: migrate legacy fields, strip blob: URLs, clear prompts[]. Never persist base64 audio.
  ```
- **Core behaviors:**
  1. **Import JSON:** parse → validate → migrate (audio list, drop base64, add defaults) → persist → `load()` → `resetRun()` → `renderAll()`.
  2. **Field edit:** patch model → shallow-validate → autosave → `renderAll()`.
  3. **Audio pick:** create object URL for runtime only; do not persist `blob:` URL.
  4. **Treatments:** rebuild editor and buttons after save; preserve `_collapsed` state.
- **Failure modes:** storage quota exceeded, invalid time (use `parseTimeFlexible`), malformed JSON.
- **User feedback:** update `#autosave` to `saved|idle|storage full`.

### ag.play — ScenarioRunner

- **Mission:** Render Play view and manage runtime state (timers, injects, treatments, audio).
- **State keys:** `running, interval, tLeft, elapsed, activeTx, decayTx, appliedInjects, firedInject, triggeredOnce, injectAutoOff, currentAudioIdx, audioLoop, vitals, baseline`.
- **Inputs:** Start/Pause/Reset, treatment button clicks, 1s ticks, audio controls.
- **Outputs:** DOM updates, beeps, urgent modal, inject pills.
- **System prompt (summary):**
  ```
  Never mutate persisted scenario. Derive runtime state from scenario and render via renderAll(). Respect priority, override, min/cap, and oneShot semantics.
  ```
- **Core behaviors:**
  1. **Reset:** seed vitals from `scenario.vitals`, rebuild `appliedInjects` sorted by `t`, clear sets, `renderAll()`.
  2. **Tick:** decrement timers, warn ≤120s, apply effects, auto-off inject tx, fire injects once, schedule triggers, `renderAll()`.
  3. **Treatments:** toggle `activeTx[id].on`; when OFF set `decayTx[id]=true`; if `urgent`, show modal.
  4. **Audio:** build buttons from `scenario.audios` with colors/flash; play/stop/loop using object URLs.
  5. **Mode switch:** hide/show Build vs Play; always call `renderAll()` after switch.

---

## 4) Workflows

### A) Import JSON → Play
1. User imports file.
2. **Build**: validate → migrate → save to localStorage.
3. `load()` hydrates Builder fields.
4. `resetRun()` seeds Play runtime.
5. `renderAll()` updates all Play panels.

### B) Inject chain
1. Sort injects by `t`.
2. At fire: beep, `txOn[]` activate, optional urgent popup, schedule `autoOff` at `t+dur`.
3. If `triggers[]`: enqueue target injects at `now+delay`, resort, de-dup future duplicates.
4. UI: active pill counts down; otherwise show next pill.

### C) Audio buttons
- Build list in editor. On Play, render buttons for rows with a valid URL.
- Flash background while playing if `flashOn`.

### D) Treatment click
- Toggle or oneShot. Apply `eff` per second, enforce `min/cap`, apply `set` descriptors.
- Highest `priority` with `override` controls hard floors/caps per vital.

---

## 5) Guardrails and Policy

- Do not persist `blob:` URLs or base64 audio.
- `parseTimeFlexible` accepts `^\d+$` or `m:ss`/`mm:ss`.
- Clamp vitals: HR 0–190, RR 0–50, SpO₂ 0–100, SBP 0–200, DBP 0–130, CBG 0–600.
- oneShot adds `eff*5` once then turns OFF.
- Override: for each vital, first seen by priority with `min|cap` wins.
- UI rendering lives in `renderStatic()`; `renderAll()` calls `renderStatic()` and `renderInjects()`.
- After import or significant edits, call `resetRun()` then `renderAll()`.

---

## 6) Configuration (reference)

```yaml
version: 27
storage_key: emtScenarioRunnerV27
timers:
  tick_ms: 1000
  warn_threshold_s: 120
audio:
  default_bg: "#fafafa"
  default_bg_on: "#c7f7c7"
render:
  flash_warn_class: "flash-warn"
```

---

## 7) Testing

- **Smoke:** import sample JSON → Play panels reflect Dispatch, GI, AVPU, SAMPLE, OPQRST, Skin.
- **Injects:**
  - zero-duration fires once, beeps, can chain.
  - duration shows active pill and auto-off turns treatments off and starts decay.
- **Treatments:** flash behavior, caps and floors honored, override precedence correct.
- **Audio:** buttons render only with URLs, loop toggle works, stop resets state.
- **Persistence:** reload retains scenario without audio blobs; autosave status updates.
- **Mode switch:** Build ↔ Play preserves state and re-renders.

---

## 8) Observability

- **Log panel:** `#log` collects: `import.ok|fail`, `apply.injects`, `inject.fire`, `tx.on|off`, `audio.play|stop`.
- **Event shape:** `{ t: <epoch_ms>, evt: "<code>", meta: { ... } }`

---

## 9) Versioning and Change Log

- **Header:** `meta.version` in scenario JSON.
- **Table:**

| Version | Change |
|---------|--------|
| 27      | audio list replaces single audio; drop base64; add `set` descriptors; Play rendering consolidated in `renderStatic()` |

---

## 10) Glossary

- **Scenario:** JSON document that seeds Builder and Play.
- **Inject:** time-based event that may toggle treatments and chain others.
- **Treatment:** effect with `eff`, `min`, `cap`, `set`, `priority`, `override`.
- **Descriptor:** non-numeric display state like `hrRate`, `skinColor`.

---

## 11) Checklists

- [ ] After **Import JSON** call `resetRun()` and `renderAll()`.
- [ ] All Play text panels render inside `renderStatic()`.
- [ ] `renderAll()` is idempotent; no stray top-level render code.
- [ ] No duplicate `const` declarations in same scope.
- [ ] Audio uses object URLs only at runtime; nothing persisted.
- [ ] Inject scheduling sorts after any mutation; deduplicate future duplicates.
- [ ] Autosave guards storage quota errors.

---

## Appendix A — Scenario Schema (outline)

> Keep the full JSON Schema at `/schema/scenario.v27.json`. Outline shown for quick reference.

```json
{
  "type": "object",
  "required": ["meta", "text", "vitals", "timing"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["title", "version"],
      "properties": {
        "title": { "type": "string" },
        "version": { "type": "integer" },
        "author": { "type": "string" }
      }
    },
    "text": {
      "type": "object",
      "properties": {
        "dispatch": { "type": "string" },
        "gi": { "type": "string" },
        "avpu": { "type": "string" },
        "noi": { "type": "string" },
        "cspine": { "type": "string" },
        "hospitalEta": { "type": "string" }
      }
    },
    "flags": {
      "type": "object",
      "properties": { "als": { "type": "boolean" } }
    },
    "timing": {
      "type": "object",
      "required": ["minutes"],
      "properties": { "minutes": { "type": "integer", "minimum": 1 } }
    },
    "injects": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "t"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "t": { "type": "integer", "minimum": 0 },
          "dur": { "type": "integer", "minimum": 0 },
          "hideAfter": { "type": "integer", "minimum": 0 },
          "bg": { "type": "string" },
          "txOn": { "type": "array", "items": { "type": "string" } },
          "triggers": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": { "id": { "type": "string" }, "delay": { "type": "integer", "minimum": 0 } }
            }
          }
        }
      }
    },
    "vitals": {
      "type": "object",
      "required": ["hr", "rr", "spo2", "sbp", "dbp", "cbg"],
      "properties": {
        "hr": { "type": "number" },
        "rr": { "type": "number" },
        "spo2": { "type": "number" },
        "sbp": { "type": "number" },
        "dbp": { "type": "number" },
        "cbg": { "type": "number" },
        "skinColor": { "type": "string" },
        "skinTemp": { "type": "string" },
        "skinMoist": { "type": "string" },
        "hrRate": { "type": "string" },
        "hrRhythm": { "type": "string" },
        "hrQuality": { "type": "string" },
        "rrRate": { "type": "string" },
        "rrRhythm": { "type": "string" },
        "rrQuality": { "type": "string" }
      }
    },
    "sample": {
      "type": "object",
      "properties": { "s": { "type": "string" }, "a": { "type": "string" }, "m": { "type": "string" }, "p": { "type": "string" }, "l": { "type": "string" }, "e": { "type": "string" }, "phys": { "type": "string" } }
    },
    "opqrst": {
      "type": "object",
      "properties": { "o": { "type": "string" }, "p": { "type": "string" }, "q": { "type": "string" }, "r": { "type": "string" }, "s": { "type": "string" }, "t": { "type": "string" } }
    },
    "audios": {
      "type": "array",
      "items": { "type": "object", "properties": { "id": { "type": "string" }, "label": { "type": "string" }, "url": { "type": "string" }, "bg": { "type": "string" }, "bgOn": { "type": "string" }, "flashOn": { "type": "boolean" }, "name": { "type": "string" } } }
    },
    "treatments": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "label", "mode"],
        "properties": {
          "id": { "type": "string" },
          "label": { "type": "string" },
          "mode": { "type": "string", "enum": ["toggle", "oneShot"] },
          "priority": { "type": "integer" },
          "override": { "type": "boolean" },
          "bg": { "type": "string" },
          "bgOn": { "type": "string" },
          "flashOn": { "type": "boolean" },
          "eff": { "type": "object", "properties": { "hr": { "type": "number" }, "rr": { "type": "number" }, "spo2": { "type": "number" }, "sbp": { "type": "number" }, "dbp": { "type": "number" }, "cbg": { "type": "number" } } },
          "min": { "type": "object", "properties": { "hr": { "type": "number" }, "rr": { "type": "number" }, "spo2": { "type": "number" }, "sbp": { "type": "number" }, "dbp": { "type": "number" }, "cbg": { "type": "number" } } },
          "cap": { "type": "object", "properties": { "hr": { "type": "number" }, "rr": { "type": "number" }, "spo2": { "type": "number" }, "sbp": { "type": "number" }, "dbp": { "type": "number" }, "cbg": { "type": "number" } } },
          "set": { "type": "object", "properties": { "hrRate": { "type": "string" }, "hrRhythm": { "type": "string" }, "hrQuality": { "type": "string" }, "rrRate": { "type": "string" }, "rrRhythm": { "type": "string" }, "rrQuality": { "type": "string" }, "skinColor": { "type": "string" }, "skinTemp": { "type": "string" }, "skinMoist": { "type": "string" } } },
          "_collapsed": { "type": "boolean" },
          "urgent": { "type": "boolean" },
          "urgentMsg": { "type": "string" }
        }
      }
    },
    "prompts": { "type": "array" }
  }
}
```
