# Entry room review · v36

Changed only `dist/escape-kit.js`, `dist/escape-designs.js` and new `dist/physical-entry-v36.css` for the Room widgets.

- The lock no longer repeats the source clue through an accordion. Players return to the photographed scene target to inspect the revealed clue. Tool collection, combination/use, ordered entry, source discovery and final key actions remain intact.
- Physical clue and lock panels use each theme's actual entry photo, a readable zoom of the relevant object, paper texture for tags/worker notes, and metal input controls. Tag text is explicitly dark ink; lock status and scene-return control retain readable contrasting colors.
- Garage black-box video is discovered at the desk SD reader/laptop with brief, people and clock. The wall retains the entry record. Both hotspot and record-group labels describe these locations.
- New CSS is scoped to `.escape-experience`, `.room-inventory` and `.physical-room-detail`. It does not style adventure devices or endings. Include it after the compiled page CSS.

Verification: `scripts/audit-escape.mjs` passed all eight themes, 8,059 candidate inputs, save migration, wrong use, discoveries and final-key transitions. Both JS syntax checks passed. A separate headless Edge harness loaded the actual compiled CSS plus the new sheet and actual Room actions for all eight themes at tiers 1–5, desktop 1000px and mobile 390px (80 combinations). Source clues remained available, no clue tags/documents appeared in lock, dark tag text computed as rgb(41,45,40), controls stayed within the panel, and expected inputs unlocked the room. Mobile photographs were inspected visually; a pale feedback box and a low-contrast return control found in the first render were corrected and rechecked.

Bounded harness and mobile screenshots are in the parent `work` directory as `entry-qa-v36.cjs`, `entry-clue-mobile-v36.png` and `entry-lock-mobile-v36.png`. No publication or Git changes performed.
