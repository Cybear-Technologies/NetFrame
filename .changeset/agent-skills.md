---
"netframe": patch
---

Ship agent skills in the package for Claude Code, GitHub Copilot and Codex: `netframe-usage`, `netframe-theming` and `netframe-interactive` under `skills/`, with class, token and interaction-pattern references generated from the shipped source and verified in CI. Install them with `npx netframe skills <claude|copilot|codex|all>` (new `netframe` binary: dependency-free, offline, writes only the `netframe-*` skill folders). Docs add an Agents page, `/llms.txt` and `/llms-full.txt`.

- Add the `nf-text-subtle` utility class. The docs and examples already used it, but it was missing from the CSS.
- Improve the documented drawer controller: Escape, focus trap and restore, inert page and closed panel, with browser tests.
- Docs fixes: removed the non-existent `nf-glitch-primary` and `nf-visually-hidden` entries, described every class, updated colour names to Hot Pink.
- README: current install, Sass, fonts, browser baseline, accessibility and agent sections.
