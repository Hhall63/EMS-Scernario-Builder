# Code Review Notes

### Plan

1. Move all Play text rendering into `renderStatic()`.
2. Set `p-hr-desc` and `p-rr-desc` there too.
3. Delete the stray top-level rendering block.

### Patch

```diff
--- a/index.html
+++ b/index.html
@@ -730,6 +730,39 @@ function renderStatic(){
   const hrDesc = `Rate: ${desc.hrRate||'normal'} | Rhythm: ${desc.hrRhythm||'regular'} | Quality: ${desc.hrQuality||'normal'}`;
   const rrDesc = `Rate: ${desc.rrRate||'normal'} | Rhythm: ${desc.rrRhythm||'regular'} | Quality: ${desc.rrQuality||'normal'}`;
 
+  // show HR/RR descriptors
+  set('p-hr-desc', hrDesc);
+  set('p-rr-desc', rrDesc);
+
   // SAMPLE block
   if (byId('p-sample')){
     const s = scenario.sample;
     byId('p-sample').innerHTML =
       `<div><strong>S:</strong> ${s.s||''}</div>
        <div><strong>A:</strong> ${s.a||''}</div>
        <div><strong>M:</strong> ${s.m||''}</div>
        <div><strong>P:</strong> ${s.p||''}</div>
        <div><strong>L:</strong> ${s.l||''}</div>
        <div><strong>E:</strong> ${s.e||''}</div>`;
   }
+
+  // OPQRST block
+  if (byId('p-opqrst')){
+    const o=scenario.opqrst||{};
+    byId('p-opqrst').innerHTML =
+      `<div><strong>O:</strong> ${o.o||''}</div>
+       <div><strong>P:</strong> ${o.p||''}</div>
+       <div><strong>Q:</strong> ${o.q||''}</div>
+       <div><strong>R:</strong> ${o.r||''}</div>
+       <div><strong>S:</strong> ${o.s||''}</div>
+       <div><strong>T:</strong> ${o.t||''}</div>`;
+  }
+
+  // Physical bullets
+  const physEl = byId('p-physical');
+  if (physEl){
+    const raw = scenario.sample.phys || '';
+    const items = raw.split(/\n+|[.;]\s+/).map(s=>s.trim()).filter(Boolean);
+    physEl.innerHTML = items.length ? `<ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul>` : '—';
+  }
+
+  // Dispatch, GI, AVPU/NOI/C-spine
+  const pd=byId('p-dispatch'), pg=byId('p-gi'), pa=byId('p-ancillary');
+  if (pd) pd.textContent=scenario.text.dispatch||'';
+  if (pg) pg.textContent=scenario.text.gi||'';
+  if (pa) pa.innerHTML = `<div><strong>AVPU:</strong> ${scenario.text.avpu||''}</div>
+    <div><strong>NOI/MOI:</strong> ${scenario.text.noi||''}</div>
+    <div><strong>C-spine:</strong> ${scenario.text.cspine||''}</div>`;
+
+  // Skin triplet
+  const skinEl=byId('p-skin');
+  if (skinEl){
+    skinEl.textContent = `${scenario.vitals.skinColor||'--'} / ${scenario.vitals.skinTemp||'--'} / ${scenario.vitals.skinMoist||'--'}`;
+  }
+
+  // ALS badges and checkboxes
+  const alsA=byId('als-badge'), alsP=byId('p-als-badge');
+  if (alsA) alsA.classList.toggle('hidden', !scenario.flags.als);
+  if (alsP) alsP.classList.toggle('hidden', !scenario.flags.als);
+  const cb=byId('flag-als-build'), cp=byId('flag-als-play');
+  if (cb) cb.checked=!!scenario.flags.als;
+  if (cp) cp.checked=!!scenario.flags.als;
+
+  // Keep audio button visuals in sync each render (buttons themselves built elsewhere)
+  if (typeof updateAudioButtonStates==='function') updateAudioButtonStates();
 }
 
-// OPQRST block
-if (byId('p-opqrst')){
-  const o=scenario.opqrst||{};
-  byId('p-opqrst').innerHTML =
-    `<div><strong>O:</strong> ${o.o||''}</div>
-     <div><strong>P:</strong> ${o.p||''}</div>
-     <div><strong>Q:</strong> ${o.q||''}</div>
-     <div><strong>R:</strong> ${o.r||''}</div>
-     <div><strong>S:</strong> ${o.s||''}</div>
-     <div><strong>T:</strong> ${o.t||''}</div>`;
-}
-// Physical: bullet points under the AVPU block
-const physEl = byId('p-physical');
-if (physEl){
-  const raw = scenario.sample.phys || '';
-  const items = raw
-    .split(/\n+|[.;]\s+/)   // split on new lines or sentence-ish breaks
-    .map(s => s.trim())
-    .filter(Boolean);
-  physEl.innerHTML = items.length
-    ? `<ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul>`
-    : '—';
-  }
-
-  const pd=byId('p-dispatch'), pg=byId('p-gi'), pa=byId('p-ancillary');
-  if (pd) pd.textContent=scenario.text.dispatch||'';
-  if (pg) pg.textContent=scenario.text.gi||'';
-  if (pa) pa.innerHTML = `<div><strong>AVPU:</strong> ${scenario.text.avpu||''}</div>
-    <div><strong>NOI/MOI:</strong> ${scenario.text.noi||''}</div>
-    <div><strong>C-spine:</strong> ${scenario.text.cspine||''}</div>`;
-
-  const skinEl=byId('p-skin');
-  if (skinEl){
-    skinEl.textContent = `${scenario.vitals.skinColor||'--'} / ${scenario.vitals.skinTemp||'--'} / ${scenario.vitals.skinMoist||'--'}`;
-  }
-
-  const alsA=byId('als-badge'), alsP=byId('p-als-badge');
-  if (alsA) alsA.classList.toggle('hidden', !scenario.flags.als);
-  if (alsP) alsP.classList.toggle('hidden', !scenario.flags.als);
-  const cb=byId('flag-als-build'), cp=byId('flag-als-play');
-  if (cb) cb.checked=!!scenario.flags.als;
-  if (cp) cp.checked=!!scenario.flags.als;
-
-  // Rebuild audio buttons, then sync their visual state (playing/idle)
-  renderAudioButtons();
-  updateAudioButtonStates();
+// ⬆ moved into renderStatic()
 
 function renderAll(){ renderStatic(); renderInjects(); }
```

Now `renderAll()` (called by `resetRun()`, `tick()`, and `save()`) updates the Play screen after import.

**a.** Want me to also mirror the Build preview (“SAMPLE & Physical”) live with the same renderer?
**b.** Add a tiny `renderPlayOnce()` to rebuild audio buttons only when audios change, not every tick?
