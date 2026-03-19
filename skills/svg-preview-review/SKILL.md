---
name: svg-preview-review
description: Render generated SVG files into PNG previews, inspect spacing/composition problems visually, then adjust the SVG generator or source asset accordingly. Use when an SVG exists but the visual result is uncertain, looks wrong, feels too empty/crowded, or needs layout iteration based on actual rendered output rather than code inspection alone.
---

# SVG Preview Review

Preview the real rendered result before changing layout. Do not guess from XML alone when the issue is visual.

## Workflow

1. Identify the generated SVG to inspect.
   Typical targets in this repo are files under `assets/generated/`.

2. Render a PNG preview with Quick Look.
   Use:

   ```bash
   qlmanage -t -s 1400 -o /tmp <svg-path>
   ```

   Notes:
   - `qlmanage -t` is the preferred path in this environment.
   - Output usually lands at `/tmp/<filename>.png` or `/tmp/<filename>.svg.png`.
   - If needed, confirm the actual output name with `mdls` or `ls /tmp`.

3. Open the preview with the image viewer tool.
   Inspect the rendered image, not the SVG text.

4. Diagnose visual problems in concrete terms.
   Focus on:
   - Element spacing is too large or too tight
   - Content groups do not read as a unit
   - Icons feel detached from the QR or label they belong to
   - Text baseline or note placement is awkward
   - Decorative frames/backgrounds overpower the real content
   - The component width/height ratio creates too much dead space

5. Patch the generator, then regenerate the SVG and preview again.
   In this repo that usually means editing:
   - `packages/svg/src/index.ts`
   - `index.js`

6. Rebuild and regenerate after layout changes.
   Typical loop:

   ```bash
   pnpm --filter @icebreakers/svg build
   node index.js
   qlmanage -t -s 1400 -o /tmp assets/generated/<target>.svg
   ```

7. Validate before finishing.
   Run the narrowest useful checks first:

   ```bash
   pnpm --filter @icebreakers/svg test
   pnpm --filter @icebreakers/svg typecheck
   ```

   If the SVG generator affects repo-wide output, also run:

   ```bash
   pnpm typecheck
   ```

## Review Heuristics

- Prefer moving or resizing content before adding decoration.
- If the composition feels empty, first reduce canvas width/height and internal gaps.
- If the composition feels ugly, remove layers before adding new ones.
- For QR layouts, preserve scan reliability; style the container, not the encoded modules.
- Keep icons semantically attached to their target QR block.
- Put short notes near the related block, not in a neutral center area.

## Fallbacks

- If `qlmanage` succeeds, use it. It is the default preview path for this environment.
- If preview output naming is unclear, inspect `/tmp` and use `mdls` on the expected file.
- If SVG text and preview disagree, trust the preview and regenerate from the current built code again before patching further.
