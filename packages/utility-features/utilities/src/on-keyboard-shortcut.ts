/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

function parseKeyDownDescriptor(descriptor: string): (event: KeyboardEvent) => boolean {
  const parts = new Set((
    descriptor
      .split("+")
      .filter(Boolean)
      .map(part => part.toLowerCase())
  ));

  if (parts.size === 0) {
    return () => true;
  }

  const hasShift = parts.delete("shift");
  const hasAlt = parts.delete("alt");

  const rawHasCtrl = parts.delete("ctrl");
  const rawHasControl = parts.delete("control");
  const hasCtrl = rawHasCtrl || rawHasControl;

  const rawHasMeta = parts.delete("meta");
  const rawHasCmd = parts.delete("cmd");
  const hasMeta = rawHasCmd || rawHasMeta; // This means either matches

  const [key, ...rest] = [...parts];

  if (rest.length !== 0) {
    throw new Error("only single key combinations are currently supported");
  }

  return (event) => {
    return event.altKey === hasAlt
      && event.shiftKey === hasShift
      && event.ctrlKey === hasCtrl
      && event.metaKey === hasMeta
      && event.key.toLowerCase() === key.toLowerCase();
  };
}

export function onKeyboardShortcut(descriptor: string, action: () => void): (this: Window, ev: WindowEventMap["keydown"]) => any {
  const isMatchingEvent = parseKeyDownDescriptor(descriptor);

  return (event) => {
    if (isMatchingEvent(event)) {
      action();
    }
  };
}
