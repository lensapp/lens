// CSS-selectors for searching elements to interact in tests

export function getMainMenuSelectors(itemId: string) {
  const baseSelector = `.Sidebar [data-test-id="${itemId}"]`;

  return {
    sidebarItemRoot: baseSelector,
    expandIcon: `${baseSelector} .expand-icon`,
    pageLink(href: string) {
      return `${baseSelector} a[href^="/${href}"]`;
    }
  };
}
