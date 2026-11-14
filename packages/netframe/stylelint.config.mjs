// NetFrame — Stylelint config
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Base: stylelint-config-standard-scss. Purely stylistic rules that would only
// reformat intentional alignment/grouping, or rewrite compiled output
// (colour-function notation, `0px`), are off so `dist/` stays byte-identical.
// NetFrame naming/design conventions from AGENTS.md are enforced on top.

const NF_NAME = '^nf-[a-z0-9]+(-[a-z0-9]+)*$';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // --- Style-only / output-changing rules: off -------------------------
    'alpha-value-notation': null,
    'at-rule-empty-line-before': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'declaration-empty-line-before': null,
    'font-family-name-quotes': null,
    'length-zero-no-unit': null,
    'rule-empty-line-before': null,
    'scss/comment-no-empty': null,
    'scss/dollar-variable-colon-space-after': null,
    'scss/double-slash-comment-empty-line-before': null,
    'scss/operator-no-newline-after': null,

    // --- Kept, tuned to existing intentional code -------------------------
    // Tokens and themes consistently use 6-digit hex.
    'color-hex-length': 'long',
    'value-keyword-case': [
      'lower',
      { ignoreKeywords: ['optimizeLegibility', 'currentColor'], ignoreProperties: ['/^--nf-font-/'] },
    ],
    // Needed for Safari / iOS; the build's Autoprefixer does not add them back.
    'property-no-vendor-prefix': [true, { ignoreProperties: ['-webkit-text-size-adjust', '-webkit-backdrop-filter'] }],
    // Tooltip positions override individual sides on purpose.
    'declaration-block-no-redundant-longhand-properties': [true, { ignoreShorthands: ['inset'] }],

    // --- NetFrame conventions --------------------------------------------
    'selector-class-pattern': [NF_NAME, { message: (s) => `Class "${s}" must use the nf- prefix (kebab-case)` }],
    'custom-property-pattern': [NF_NAME, { message: (p) => `Custom property "${p}" must use the --nf- prefix` }],
    'keyframes-name-pattern': [NF_NAME, { message: (k) => `Keyframes "${k}" must use the nf- prefix` }],
    'scss/at-mixin-pattern': [NF_NAME, { message: (m) => `Mixin "${m}" must use the nf- prefix` }],
    'scss/dollar-variable-pattern': [NF_NAME, { ignore: 'local', message: (v) => `Variable "$${v}" must use the $nf- prefix` }],
    // Hard edges only: radius must be 0 or a --nf-radius-* token (all 0).
    'declaration-property-value-allowed-list': {
      'border-radius': ['0', '/^var\\(--nf-radius-[a-z]+\\)$/'],
    },
  },
  overrides: [
    {
      // Components take colours from tokens; palettes live in tokens/ and themes/.
      files: ['src/components/**/*.scss', 'src/utilities/**/*.scss'],
      rules: {
        'color-no-hex': [true, { message: 'Use a --nf-color-* token instead of a hex colour' }],
        'declaration-property-value-disallowed-list': [
          { cursor: ['pointer'] },
          { message: 'Interactive NetFrame components use cursor: crosshair' },
        ],
      },
    },
  ],
};
