// NetFrame Docs — keep wide Markdown tables from widening the page
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// MDX renders Markdown tables as bare <table> elements. Wrapping each one in a
// labelled, keyboard-focusable region lets a genuinely wide table scroll inside
// itself while keeping real table semantics (unlike `display: block` on <table>).

export function wrapMarkdownTables(root: ParentNode = document): void {
  root.querySelectorAll<HTMLTableElement>('.docs-content table').forEach((table) => {
    if (table.classList.contains('nf-table')) return; // component demos manage their own wrapper
    if (table.closest('.docs-table-scroll, .nf-table-wrap, .demo-preview')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'docs-table-scroll';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Scrollable table');
    wrapper.tabIndex = 0;
    table.replaceWith(wrapper);
    wrapper.append(table);
  });
}
