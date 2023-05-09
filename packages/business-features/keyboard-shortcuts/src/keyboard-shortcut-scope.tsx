import type { SafeReactNode, SingleOrMany } from "@k8slens/utilities";
import React from "react";

export interface KeyboardShortcutScopeProps {
  id: string;
  children: SingleOrMany<SafeReactNode>;
}

export const KeyboardShortcutScope = ({ id, children }: KeyboardShortcutScopeProps) => (
  <div data-keyboard-shortcut-scope={id} data-keyboard-shortcut-scope-test={id} tabIndex={-1}>
    {children}
  </div>
);
