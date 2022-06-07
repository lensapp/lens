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
import type { CommandOverlay } from "./command-overlay.injectable";
import commandOverlayInjectable from "./command-overlay.injectable";
import { isMac } from "../../../common/vars";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import { broadcastMessage, ipcRendererOn } from "../../../common/ipc";
import type { Disposer } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import windowAddEventListenerInjectable from "../../window/event-listener.injectable";
import type { IComputedValue } from "mobx";
import matchedClusterIdInjectable from "../../navigation/matched-cluster-id.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import hostedClusterIdInjectable from "../../../common/cluster-store/hosted-cluster-id.injectable";

interface Dependencies {
  addWindowEventListener: <K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) => Disposer;
  commandOverlay: CommandOverlay;
  clusterId?: ClusterId;
  matchedClusterId: IComputedValue<ClusterId>;
  entityRegistry: CatalogEntityRegistry;
}

@observer
class NonInjectedCommandContainer extends React.Component<Dependencies> {
  private escHandler(event: KeyboardEvent) {
    const { commandOverlay } = this.props;

    if (event.key === "Escape") {
      event.stopPropagation();
      commandOverlay.close();
    }
  }

  handleCommandPalette = () => {
    const { commandOverlay, entityRegistry } = this.props;
    const clusterIsActive = this.props.matchedClusterId.get() !== undefined;

    if (clusterIsActive) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      broadcastMessage(`command-palette:${entityRegistry.activeEntity!.getId()}:open`);
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

export const CommandContainer = withInjectables<Dependencies>(NonInjectedCommandContainer, {
  getProps: (di, props) => ({
    ...props,
    clusterId: di.inject(hostedClusterIdInjectable),
    addWindowEventListener: di.inject(windowAddEventListenerInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    matchedClusterId: di.inject(matchedClusterIdInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
  }),
});
