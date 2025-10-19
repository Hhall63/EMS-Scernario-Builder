# Integration Roadmap

This plan replaces the prior review notes. Follow the four phases below to merge the TSOP "2&3" prototype into `index.html`, maintain feature parity, and add the requested layout/visibility controls without flooding the Play screen.

---

## Phase 1 — Adopt TSOP runtime & treatment rendering
**Goal:** Replace the legacy random-walk runtime in `index.html` with the TSOP baseline/priority engine so vitals, treatments, injects, and audio behave consistently.

1. **Reset flow parity**
   - Mirror TSOP's `resetRun()` behavior: clear `injectAutoOff`, rebuild treatment buttons, seed vitals/baselines, and call `renderAll()` afterward.
   - Ensure newborn/OB hooks (added in Phase 2) can register during reset.
2. **Per-second vitals application**
   - Replace the existing jitter in `applyEffectsPerSecond()` with TSOP's decay-to-baseline algorithm that honors treatment priority, overrides, min/cap, and decay flags.【F:TSOPs 2&3.html†L794-L912】
   - Port any helper utilities required (e.g., `clampVitals`, `resolvePriority`).
3. **Static render parity**
   - Merge TSOP's `renderStatic()` updates so Play text, skin descriptors, HR/RR descriptors, and ALS badges refresh each render without duplicating DOM code.【F:TSOPs 2&3.html†L982-L1051】
4. **Audio buttons**
   - Update `renderAudioButtons()` to always build buttons (muted when empty) and call a lightweight state-sync helper each render.【F:TSOPs 2&3.html†L1517-L1554】
5. **Regression checklist**
   - Start/Pause/Reset flows work.
   - Treatments toggle correctly and decay toward baseline when off.
   - Audio buttons remain responsive (loop, play, stop).

---

## Phase 2 — Integrate OB & newborn modules
**Goal:** Bring the obstetric/newborn builder panels and runtime hooks from TSOP into the main app so Play displays the same extended content.

1. **Builder mounts**
   - Copy TSOP builder mount functions: backstory, talking points, APGAR, newborn vitals, newborn treatments, and supporting helpers (`drawNbTreatments`, etc.).【F:TSOPs 2&3.html†L2110-L2299】
   - Invoke these mounts during app initialization alongside existing `drawInjects()` and treatment rendering.
2. **Scenario schema expansion**
   - Extend the default scenario object to include `text.backstory`, `text.talkingPoints`, `apgar`, `apgarNotes`, `nbVitals`, and `nbTreatments` with TSOP defaults.【F:TSOPs 2&3.html†L2791-L2859】
   - Update `save()`/`load()` plus any migration helpers to persist these fields; ensure legacy scenarios default missing keys.
3. **Runtime hooks**
   - Port `resetRunNB`, `applyEffectsPerSecondNB`, `renderOBPlay`, `buildNbTxButtons`, and integrate them into the standard tick/reset/render pipeline.【F:TSOPs 2&3.html†L2398-L2453】【F:TSOPs 2&3.html†L2572-L2593】
   - Confirm newborn vitals reset correctly and respond to treatments/injects.
4. **Validation & testing**
   - Verify builder inputs map to Play view.
   - Ensure exports/imports carry the expanded data.

---

## Phase 3 — Adopt TSOP utility enhancements
**Goal:** Align utility features (inject beep patterns, global reset, ETA pill placement) to improve usability.

1. **Inject beep patterns**
   - Add the TSOP dropdown UI to each inject row and adapt `blast()`/`tick()` to honor the selected pattern without duplicating wrappers.【F:TSOPs 2&3.html†L2640-L2774】
2. **Global reset button**
   - Introduce the TSOP "Clear All" control that regenerates the expanded default scenario and re-renders the builder/play surfaces.【F:TSOPs 2&3.html†L2791-L2859】
3. **ETA pill relocation**
   - Move the editable ETA pill from the sticky footer into the lung-sound header per TSOP, ensuring a single authoritative updater remains.【F:TSOPs 2&3.html†L2880-L2938】
4. **Smoke tests**
   - Confirm beep selection persists per inject.
   - Verify global reset wipes both legacy and new fields.
   - Validate ETA editing still works in Play mode.

---

## Phase 4 — Reorganize builder UI & add "Display on Play" toggles
**Goal:** Prevent blank Play boxes by grouping builder sections and letting authors choose what renders.

1. **Builder layout**
   - Restructure the builder (`#build`) into collapsible sections (e.g., `<details>`/accordion) covering Meta, Text, SAMPLE, OPQRST, Treatments, OB/Newborn, etc.
   - Default empty sections to collapsed to avoid visual clutter.
2. **Visibility controls**
   - Add a "Display on Play" checkbox (or toggle) to each major section; persist state in `scenario.displayOnPlay` (new object with sensible defaults).
   - Update `save()`/`load()` to include these flags and migrate older saves to `true`.
3. **Conditional rendering**
   - Update `renderStatic()` and OB/Newborn render helpers to skip sections whose flag is `false`, ensuring the Play screen only shows opted-in content.
   - Hide placeholder boxes when a section has no visible content.
4. **UX validation**
   - Confirm builder preview mirrors Play output when toggling visibility.
   - Ensure toggles do not break existing autosave or export behavior.

---

## Final verification checklist
- ✅ Automated tests or lint (if available).
- ✅ Manual Playthrough: create a full scenario using new builder sections, ensure Play reflects visibility toggles and runtime behavior.
- ✅ Scenario import/export roundtrip with new schema fields.
- ✅ Confirm no empty boxes appear on Play when sections are hidden.

Document any deviations, TODOs, or follow-up questions directly beneath this plan in future revisions.
