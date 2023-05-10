import type { StrictReactNode } from "@k8slens/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import React, { useEffect } from "react";

import invokeShortcutInjectable, { InvokeShortcut } from "./invoke-shortcut.injectable";

export interface KeyboardShortcutListenerProps {
  children: StrictReactNode;
}

interface Dependencies {
  invokeShortcut: InvokeShortcut;
}

const NonInjectedKeyboardShortcutListener = ({
  children,
  invokeShortcut,
}: KeyboardShortcutListenerProps & Dependencies) => {
  useEffect(() => {
    document.addEventListener("keydown", invokeShortcut);

    return () => {
      document.removeEventListener("keydown", invokeShortcut);
    };
  });

  return <>{children}</>;
};

export const KeyboardShortcutListener = withInjectables<Dependencies, KeyboardShortcutListenerProps>(
  NonInjectedKeyboardShortcutListener,

  {
    getProps: (di, props) => ({
      invokeShortcut: di.inject(invokeShortcutInjectable),
      ...props,
    }),
  },
);
