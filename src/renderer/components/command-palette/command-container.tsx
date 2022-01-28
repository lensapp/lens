/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import "./command-container.scss";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { Dialog } from "../dialog";
import { CommandDialog } from "./command-dialog";
import type { ClusterId } from "../../../common/cluster-types";
import commandOverlayInjectable, { CommandOverlay } from "./command-overlay.injectable";
import { isMac } from "../../../common/vars";
import { broadcastMessage, ipcRendererOn } from "../../../common/ipc";
import { getMatchedClusterId } from "../../navigation";
import { disposer, Disposer } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import addWindowEventListenerInjectable from "../../event-listeners/add-window-event-listener.injectable";

export interface CommandContainerProps {
  clusterId?: ClusterId;
}

interface Dependencies {
  addWindowEventListener: <K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) => Disposer;
  commandOverlay: CommandOverlay,
}

const NonInjectedCommandContainer = observer(({ commandOverlay, addWindowEventListener, clusterId }: Dependencies & CommandContainerProps) => {
  const escHandler = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      commandOverlay.close();
    }
  };

  const handleCommandPalette = () => {
    const clusterId = getMatchedClusterId();
    const clusterIsActive = clusterId !== undefined;

    if (clusterIsActive) {
      broadcastMessage(`command-palette:${clusterId}:open`);
    } else {
      commandOverlay.open(<CommandDialog />);
    }
  };

  const onKeyboardShortcut = (action: () => void) => {
    return ({ key, shiftKey, ctrlKey, altKey, metaKey }: KeyboardEvent) => {
      const ctrlOrCmd = isMac ? metaKey && !ctrlKey : !metaKey && ctrlKey;

      if (key === "p" && shiftKey && ctrlOrCmd && !altKey) {
        action();
      }
    };
  };

  useEffect(() => {
    const action = clusterId
      ? () => commandOverlay.open(<CommandDialog />)
      : handleCommandPalette;
    const ipcChannel = clusterId
      ? `command-palette:${clusterId}:open`
      : "command-palette:open";

    return disposer(
      ipcRendererOn(ipcChannel, action),
      addWindowEventListener("keydown", onKeyboardShortcut(action)),
      addWindowEventListener("keyup", (e) => escHandler(e), true),
    );
  }, []);

  return (
    <Dialog
      onClose={commandOverlay.close}
      isOpen={commandOverlay.isOpen}
      modal={false}
    >
      <div id="command-container">
        {commandOverlay.component}
      </div>
    </Dialog>
  );
});

export const CommandContainer = withInjectables<Dependencies, CommandContainerProps>(NonInjectedCommandContainer, {
  getProps: (di, props) => ({
    addWindowEventListener: di.inject(addWindowEventListenerInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    ...props,
  }),
});
