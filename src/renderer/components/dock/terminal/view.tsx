/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-window.scss";

import React, { useEffect, useRef, useState } from "react";
import { cssNames } from "../../../utils";
import type { Terminal } from "./terminal";
import type { TerminalStore } from "./store";
import type { LensTheme } from "../../../themes/lens-theme";
import type { DockTab, DockStore } from "../dock/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";
import terminalStoreInjectable from "./store.injectable";
import activeThemeInjectable from "../../../themes/active.injectable";
import type { IComputedValue } from "mobx";

export interface TerminalWindowProps {
  tab: DockTab;
}

interface Dependencies {
  dockStore: DockStore;
  terminalStore: TerminalStore;
  activeTheme: IComputedValue<LensTheme>;
}

const NonInjectedTerminalWindow = (props: TerminalWindowProps & Dependencies) => {
  const {
    activeTheme,
    dockStore,
    tab,
    terminalStore,
  } = props;

  const [terminal, setTerminal] = useState<Terminal>();
  const element = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const { terminal } = terminalStore.connect(tab);

    setTerminal(terminal);

    if (element.current) {
      terminal.attachTo(element.current);
    }
  }, [tab.id]);

  useEffect(() => dockStore.onResize(
    () => {
      terminal?.onResize();
    }, {
      fireImmediately: true,
    }), []);

  return (
    <div
      className={cssNames("TerminalWindow", activeTheme.get().type)}
      ref={element}
    />
  );
};

export const TerminalWindow = withInjectables<Dependencies, TerminalWindowProps>(NonInjectedTerminalWindow, {
  getProps: (di, props) => ({
    ...props,
    dockStore: di.inject(dockStoreInjectable),
    terminalStore: di.inject(terminalStoreInjectable),
    activeTheme: di.inject(activeThemeInjectable),
  }),
});

