/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-window.scss";

import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { cssNames, disposer } from "../../../utils";
import type { Terminal } from "./terminal";
import type { ITerminalTab, TerminalStore } from "./store";
import type { Theme } from "../../../themes/store";
import type { DockStore } from "../dock/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";
import terminalStoreInjectable from "./store.injectable";
import activeThemeInjectable from "../../../themes/active-theme.injectable";
import type { IComputedValue } from "mobx";

export interface TerminalWindowProps {
  tab: ITerminalTab;
}

interface Dependencies {
  dockStore: DockStore;
  terminalStore: TerminalStore;
  activeTheme: IComputedValue<Theme>;
}

const NonInjectedTerminalWindow = observer(({ dockStore, terminalStore, activeTheme, tab }: Dependencies & TerminalWindowProps) => {
  const element = useRef<HTMLDivElement>();
  const [terminal, setTerminal] = useState<Terminal | null>(null);

  useEffect(() => {
    terminal?.detach(); // detach previous
    terminalStore.connect(tab);

    const newTerminal = terminalStore.getTerminal(tab.id);

    setTerminal(newTerminal);
    newTerminal.attachTo(element.current);
  }, [tab.id]);

  useEffect(() => disposer(
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

export const TerminalWindow = withInjectables<Dependencies, TerminalWindowProps>(NonInjectedTerminalWindow, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    terminalStore: di.inject(terminalStoreInjectable),
    activeTheme: di.inject(activeThemeInjectable),
    ...props,
  }),
});
