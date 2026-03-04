# sonofmagic

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

### Patch Changes

- 📦 **Dependencies** [`3568fda`](https://github.com/sonofmagic/sonofmagic/commit/3568fdaff070c2b7f08411cab6ba7d93b057fae4)
  → `@icebreakers/profile@4.0.0`

## 2.0.4

### Patch Changes

- 📦 **Dependencies** [`41d9c20`](https://github.com/sonofmagic/sonofmagic/commit/41d9c20361257d2e0c223402ece020eb4c240c88)
  → `@icebreakers/profile@1.1.1`

## 2.0.3

### Patch Changes

- Updated dependencies [[`efff63e`](https://github.com/sonofmagic/sonofmagic/commit/efff63e3f82452dd98a65b7c7f0af255dc895aff)]:
  - @icebreakers/profile@1.1.0

## 2.0.2

### Patch Changes

- Updated dependencies [[`2577559`](https://github.com/sonofmagic/sonofmagic/commit/2577559a7c603abc0e1288f5dc209ee1cffe6390)]:
  - @icebreakers/profile@1.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [[`632ccf6`](https://github.com/sonofmagic/sonofmagic/commit/632ccf64657b750742b722ba540556bc63f957c1)]:
  - @icebreakers/profile@1.0.1

## 2.0.0

### Major Changes

- [`7dab523`](https://github.com/sonofmagic/sonofmagic/commit/7dab52389e294e836ac086b46214e096dfaebeb3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: release sonofmagic v2.0.0

- [`c2e99a4`](https://github.com/sonofmagic/sonofmagic/commit/c2e99a433cf8a5012f1680e0c0e2333f938f9833) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 发个大版本

### Patch Changes

- Updated dependencies [[`c2e99a4`](https://github.com/sonofmagic/sonofmagic/commit/c2e99a433cf8a5012f1680e0c0e2333f938f9833)]:
  - @icebreakers/profile@1.0.0
