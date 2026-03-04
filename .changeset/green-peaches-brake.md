---
'@icebreakers/profile': major
sonofmagic: major
yangqiming: major
---

Consolidate the recent CLI and packaging upgrades across the fixed release group.

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
