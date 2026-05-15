# @icebreakers/profile

## 4.0.1

### Patch Changes

- 🐛 **Add an offline fallback list for highlighted repositories when GitHub data is unavailable.** [`543ef92`](https://github.com/sonofmagic/sonofmagic/commit/543ef9274c10b20e01485667e374aa009c6c7318) by @sonofmagic

- 🐛 **Add repository spotlight details and actions to the interactive project browser.** [`c37cf22`](https://github.com/sonofmagic/sonofmagic/commit/c37cf22113c572fb604ca1625a7312cce52dbdd1) by @sonofmagic

- 🐛 **Replace the repository loading spinner dependency with nanospinner and remove the unused graphemer dependency.** [`e761c0a`](https://github.com/sonofmagic/sonofmagic/commit/e761c0a6172be4e163aebe74a6e9ced09a6da644) by @sonofmagic

- 🐛 **Add a projects direct command that prints highlighted repository details.** [`871ae58`](https://github.com/sonofmagic/sonofmagic/commit/871ae58a84e32909be569f7424152a54dbb55a62) by @sonofmagic

- 🐛 **Fetch highlighted GitHub repositories directly so the repository picker shows live star and fork counts even when the user repository list request fails.** [`8337099`](https://github.com/sonofmagic/sonofmagic/commit/8337099d9e29c12893517a56be3fbaffa069a0c3) by @sonofmagic

- 🐛 **Add timeline direct command, JSON health output, and localized repository spotlight details.** [`3e7e596`](https://github.com/sonofmagic/sonofmagic/commit/3e7e596e2a13a95a07c17458a455910851541d52) by @sonofmagic

- 🐛 **Remove the deprecated developer card mini-program menu entry and related WeChat copy.** [`c64bda5`](https://github.com/sonofmagic/sonofmagic/commit/c64bda5084da9234599f18550194f4ad3d216432) by @sonofmagic

- 🐛 **Add JSON output for highlighted projects and file output support for Markdown exports.** [`b38b94c`](https://github.com/sonofmagic/sonofmagic/commit/b38b94c459e5df828497d2a76c7319387ead7de4) by @sonofmagic

- 🐛 **Add a local health command for validating profile links, fallback repositories, i18n, and Markdown export data.** [`469e9eb`](https://github.com/sonofmagic/sonofmagic/commit/469e9ebc5e2daf85c9c0db5e1617a85b42639b73) by @sonofmagic

- 🐛 **Add an interactive engineering timeline and a Markdown export command for the profile CLI.** [`7828b28`](https://github.com/sonofmagic/sonofmagic/commit/7828b28dff79f38d0f7ff20e56888d4e6659f2d5) by @sonofmagic

## 4.0.0

### Major Changes

- 🚀 **Consolidate the recent CLI and packaging upgrades across the fixed release group.** [`3568fda`](https://github.com/sonofmagic/sonofmagic/commit/3568fdaff070c2b7f08411cab6ba7d93b057fae4) by @sonofmagic
  Breaking changes:

  - Ship ESM-only builds and remove CJS outputs.
  - Drop support for Node.js versions lower than `20.19.0` and align engines to `^20.19.0 || >=22.12.0`.

  Improvements:

  - Migrate package builds from `tsup` to `tsdown`.
  - Add direct output commands to the shared profile CLI:
    - `summary [--lang zh|en]`
    - `links`
    - `contact`
    - `url <target>`
  - Add release safeguards and tests around fixed-version consistency and cross-package CLI delegation.

## 1.1.1

### Patch Changes

- 🐛 **Refresh the profile console content with privacy-safe public identity details and a more professional bilingual narrative.** [`41d9c20`](https://github.com/sonofmagic/sonofmagic/commit/41d9c20361257d2e0c223402ece020eb4c240c88) by @sonofmagic
  - redact personal/private contact exposure and keep only public channels
  - enrich Chinese and English profile copy using public information from icebreaker.top
  - refine project timeline, highlighted repositories, and toolchain focus descriptions

## 1.1.0

### Minor Changes

- [`efff63e`](https://github.com/sonofmagic/sonofmagic/commit/efff63e3f82452dd98a65b7c7f0af255dc895aff) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Add automatic light/dark terminal theming plus logging helpers that satisfy lint rules.

## 1.0.2

### Patch Changes

- [`2577559`](https://github.com/sonofmagic/sonofmagic/commit/2577559a7c603abc0e1288f5dc209ee1cffe6390) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: update 20251001

## 1.0.1

### Patch Changes

- [`632ccf6`](https://github.com/sonofmagic/sonofmagic/commit/632ccf64657b750742b722ba540556bc63f957c1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: improve photo switch

## 1.0.0

### Major Changes

- [`c2e99a4`](https://github.com/sonofmagic/sonofmagic/commit/c2e99a433cf8a5012f1680e0c0e2333f938f9833) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 发个大版本
