/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-window.scss";

import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { cssNames, disposer } from "../../../utils";
import type { Terminal } from "./terminal";
import type { TerminalStore } from "./store";
import type { Theme } from "../../../themes/store";
import { TabKind, TabId, DockStore } from "../dock/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";
import terminalStoreInjectable from "./store.injectable";
import activeThemeInjectable from "../../../themes/active-theme.injectable";
import type { IComputedValue } from "mobx";

interface Dependencies {
  dockStore: DockStore;
  terminalStore: TerminalStore;
  activeTheme: IComputedValue<Theme>;
}

const NonInjectedTerminalWindow = observer(({ dockStore, terminalStore, activeTheme }: Dependencies) => {
  const element = useRef<HTMLDivElement>();
  const [terminal, setTerminal] = useState<Terminal | null>(null);

  const activate = (tabId: TabId) => {
    terminal?.detach(); // detach previous

    const newTerminal = terminalStore.getTerminal(tabId);

    setTerminal(newTerminal);
    newTerminal.attachTo(element.current);
  };

  useEffect(() => disposer(
    dockStore.onTabChange(({ tabId }) => activate(tabId), {
      tabKind: TabKind.TERMINAL,
      fireImmediately: true,
    }),

    // refresh terminal available space (cols/rows) when <Dock/> resized
    dockStore.onResize(() => terminal?.fitLazy(), {
      fireImmediately: true,
    }),
  ), []);

  return (
    <div
      className={cssNames("TerminalWindow", activeTheme.get().type)}
      ref={element}
    />
  );
});

export const TerminalWindow = withInjectables<Dependencies>(NonInjectedTerminalWindow, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    terminalStore: di.inject(terminalStoreInjectable),
    activeTheme: di.inject(activeThemeInjectable),
    ...props,
  }),
});
