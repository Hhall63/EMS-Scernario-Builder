# AED Voice Prompt Drill Scenario

## Overview
This scenario packages the AED voice prompt script into a reusable training asset for the Scenario Builder. Loading `AEDVoicePrompts.json` emulates the cadence of an automated external defibrillator coaching rescuers through pad placement, rhythm analysis, shock delivery, and CPR cycles. Instructors can pair the scenario with a CPR feedback manikin to reinforce the timing and messaging learners should expect during real deployments.

## How it works
- **Inject timeline:** Eight injects echo the AED prompts in chronological order so facilitators can keep track of where the crew should be in the resuscitation cycle.
- **Guided prompts:** Each voice line from the script appears in the `prompts` array with the second marker that aligns to the simulated AED playback. Toggle the Prompts editor on in Build mode to surface the list, adjust IDs, rewrite the spoken copy, or retime the cues.
- **Builder toggle:** The Prompts section can be hidden entirely when the feature is not needed. Unchecking the editor toggle preserves the data but removes the UI from the build surface.
- **Speech synthesis:** Each prompt can auto-play as spoken audio using the browser's speech engine. Choose a voice, adjust rate, pitch, and volume, or disable the speech toggle entirely when silent practice is preferred.
- **Play preview:** Play mode surfaces an ordered prompts panel that highlights the current line based on elapsed time. Enable the **Speak prompts aloud** toggle to hear the script during dry runs or turn it off for silent shadowing.
- **Treatment focus:** Quick actions for applying pads, delivering the shock, and maintaining high-quality compressions are surfaced in the treatment list to anchor discussion and evaluation metrics.
- **Cardiac arrest physiology:** Baseline vitals reflect a pulseless, apneic patient. You can pair the scenario with your own vital change injects or extend the treatments with post-ROSC targets depending on the learning objectives.

## Prompt schedule
| Time (s) | Prompt title | Scripted coaching |
| --- | --- | --- |
| 0 | Power on and pad placement | Unit on. Stay calm. Remove clothing from the chest. Attach pads to the patient's bare chest as shown. If needed, plug in the pads connector. |
| 18 | Analyzing rhythm | Do not touch the patient. Analyzing heart rhythm. |
| 23 | Shock advised | Shock advised. Charging. |
| 25 | Stand clear | Stand clear. Do not touch the patient. Press the flashing shock button now. |
| 29 | Post-shock CPR | Shock delivered. Begin CPR. Push hard and fast at a rate of 100 to 120 per minute. Allow full chest recoil. |
| 59 | Continue compressions | Continue CPR. Push hard and fast. |
| 89 | Continue compressions | Continue CPR. Push hard and fast. |
| 114 | Prepare to stop | Prepare to stop CPR. Do not touch the patient. |
| 119 | Re-analyze | Stop CPR. Do not touch the patient. Analyzing heart rhythm. |

## Builder controls
1. In Build mode, open the **Prompts** section and check **Enable prompts editor** to reveal the script.
2. Edit the **ID**, **Time**, **Title**, and **Prompt text** fields to match your device or curriculum. Time accepts seconds or `mm:ss` and normalizes to scenario time.
3. Use the move controls to reorder lines or click **Delete** to remove a prompt. The **Enabled** switch keeps a line for future runs without showing it during play.
4. Click **Add prompt** to append a new entry; the editor seeds the timestamp 30 seconds after the prior line for faster authoring.
5. Use the **Speak prompts during play** controls to select a voice, preview the cadence, and set the desired rate, pitch, and volume. These defaults apply whenever the scenario is launched.
6. Uncheck **Enable prompts editor** to hide the section while keeping your custom prompts stored in the scenario JSON.

## Play preview
- Open Play mode to see the scripted prompts listed beneath the Dispatch and General Impression cards.
- Toggle **Speak prompts aloud** to control whether the browser vocalizes each line; use **Stop speech** to immediately halt playback without clearing the timeline.
- The active prompt highlights in blue, completed lines fade, and upcoming lines display a countdown (“in 00:30”).
- Disabling a prompt in Build mode removes it from the Play preview, allowing quick dry-run adjustments without deleting content.

## Deployment tips
1. Load the scenario and synchronize the prompt timestamps with the AED trainer in the lab. Adjust any offsets in the Prompts editor before the session.
2. Brief learners that the prompts mimic a standard adult AED cycle so they can anticipate the workflow.
3. Use the Play preview to call out upcoming cues or to verify cadence during dry runs when audio playback is impractical.
4. Debrief how the crew responded to each prompt, emphasizing airway preparation, minimal interruptions, and rhythm checks.
5. Extend or customize the scenario by adding additional injects for rhythm changes or pharmacologic interventions as your curriculum evolves.
