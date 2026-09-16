**Comparison target**

- Source visual truth: user-supplied Night Arrival mobile mockup (`2EEC1452-A378-45B4-BE55-1B3B334CF743.jpeg`).
- Intended implementation: mobile home hero at `/fr`, `src/components/MobileNightHero.tsx`
- Intended viewport: 393 × 852 CSS px, portrait, initial page state.

**Evidence status**

- Source visual was opened and reviewed.
- A browser-rendered implementation capture could not be produced. This Work session does not expose the required Sites preview service, and the local Next.js development server previously exits before listening because Node reports `uv_interface_addresses returned Unknown system error 1` while Next.js resolves network hosts.
- Therefore no implementation screenshot path, pixel dimensions, density normalization, same-state full-view comparison, focused-region comparison, browser console check, or interaction test is available.

**Findings**

- [P0] Rendered mobile verification unavailable.
  Location: local development preview.
  Evidence: `npm run dev` fails during Next.js startup before an HTTP endpoint is available.
  Impact: the selected mobile composition, tap targets, responsive wrapping, primary booking link, and desktop preservation cannot be visually confirmed in a browser.
  Fix: restore a working local preview environment, capture `/fr` at 393 × 852, test the availability CTA, date links, menu and mobile navigation, inspect the console, then repeat the comparison against the source visual.

**Required fidelity surfaces**

- Fonts and typography: blocked pending browser capture.
- Spacing and layout rhythm: blocked pending browser capture.
- Colors and visual tokens: blocked pending browser capture.
- Image quality and asset fidelity: new `hero-night-arrival.webp` is generated and placed in the mobile hero; crop and compression still require rendered review.
- Copy and content: blocked pending browser capture.

**Open Questions**

- None about the selected direction: the user selected the third visible concept, “Night Arrival”.

**Implementation Checklist**

1. Start the local Next.js preview successfully.
2. Capture the initial `/fr` view at 393 × 852 and compare it with the selected source.
3. Test availability and both date-selection links, the menu, mobile navigation, and browser console errors.
4. Resolve any P0/P1/P2 differences, recapture, and update this report.

**Follow-up Polish**

- None until a browser-rendered comparison is available.

final result: blocked
