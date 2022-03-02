/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import "./command-container.scss";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Dialog } from "../dialog";
import { CommandDialog } from "./command-dialog";
import type { ClusterId } from "../../../common/cluster-types";
import commandOverlayInjectable, { CommandOverlay } from "./command-overlay.injectable";
import { isMac } from "../../../common/vars";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { broadcastMessage, ipcRendererOn } from "../../../common/ipc";
import { getMatchedClusterId } from "../../navigation";
import type { Disposer } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import windowAddEventListenerInjectable from "../../window/event-listener.injectable";

export interface CommandContainerProps {
  clusterId?: ClusterId;
}

interface Dependencies {
  addWindowEventListener: <K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) => Disposer;
  commandOverlay: CommandOverlay;
}

@observer
class NonInjectedCommandContainer extends React.Component<CommandContainerProps & Dependencies> {
  private escHandler(event: KeyboardEvent) {
    const { commandOverlay } = this.props;

    if (event.key === "Escape") {
      event.stopPropagation();
      commandOverlay.close();
    }
  }

  handleCommandPalette = () => {
    const { commandOverlay } = this.props;
    const clusterIsActive = getMatchedClusterId() !== undefined;

    if (clusterIsActive) {
      broadcastMessage(`command-palette:${catalogEntityRegistry.activeEntity.getId()}:open`);
    } else {
      commandOverlay.open(<CommandDialog />);
    }
  };

  onKeyboardShortcut(action: () => void) {
    return ({ key, shiftKey, ctrlKey, altKey, metaKey }: KeyboardEvent) => {
      const ctrlOrCmd = isMac ? metaKey && !ctrlKey : !metaKey && ctrlKey;

      if (key === "p" && shiftKey && ctrlOrCmd && !altKey) {
        action();
      }
    };
  }

  componentDidMount() {
    const { clusterId, addWindowEventListener, commandOverlay } = this.props;

    const action = clusterId
      ? () => commandOverlay.open(<CommandDialog />)
      : this.handleCommandPalette;
    const ipcChannel = clusterId
      ? `command-palette:${clusterId}:open`
      : "command-palette:open";

    disposeOnUnmount(this, [
      ipcRendererOn(ipcChannel, action),
      addWindowEventListener("keydown", this.onKeyboardShortcut(action)),
      addWindowEventListener("keyup", (e) => this.escHandler(e), true),
    ]);
  }

  render() {
    const { commandOverlay } = this.props;

    return (
      <Dialog
        isOpen={commandOverlay.isOpen}
        animated={true}
        onClose={commandOverlay.close}
        modal={false}
      >
        <div id="command-container">
          {commandOverlay.component}
        </div>
      </Dialog>
    );
  }
}

export const CommandContainer = withInjectables<Dependencies, CommandContainerProps>(NonInjectedCommandContainer, {
  getProps: (di, props) => ({
    addWindowEventListener: di.inject(windowAddEventListenerInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    ...props,
  }),
});
