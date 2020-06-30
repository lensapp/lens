// Helper for selecting element's text content and copy in clipboard

export function copyToClipboard(elem: HTMLElement, resetSelection = true): boolean {
  let clearSelection: () => void;
  if (isSelectable(elem)) {
    elem.select();
    clearSelection = () => elem.setSelectionRange(0, 0)
  }
  else {
    const selection = window.getSelection();
    selection.selectAllChildren(elem);
    clearSelection = () => selection.removeAllRanges();
  }
  const copyResult = document.execCommand("copy");
  if (resetSelection) clearSelection();
  return copyResult;
}

function isSelectable(elem: HTMLElement): elem is HTMLInputElement {
  return !!(elem as HTMLInputElement).select;
}
