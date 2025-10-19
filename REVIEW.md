# Code Review Notes

## Major Functional Issues
- `renderStatic` never closes before defining `renderAll`, `buildTxButtons`, and other helpers. Those function declarations therefore live inside `renderStatic`'s scope instead of the global scope but are referenced globally (e.g., `renderAll()` calls on load). In the browser this throws `ReferenceError: renderAll is not defined`, halting the app as soon as the script executes. Add a closing brace `}` immediately after the `updateAudioButtonStates();` call inside `renderStatic` so the subsequent helpers become global again. 【F:index.html†L988-L1139】
