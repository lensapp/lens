/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import "./command-container.scss";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Dialog } from "../dialog";
import { CommandDialog } from "./command-dialog";
import type { ClusterId } from "../../../common/cluster-types";
import { CommandOverlay } from "./command-overlay";
import { isMac } from "../../../common/vars";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { broadcastMessage, ipcRendererOn } from "../../../common/ipc";
import { getMatchedClusterId } from "../../navigation";
import type { Disposer } from "../../utils";

export interface CommandContainerProps {
  clusterId?: ClusterId;
}

function addWindowEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): Disposer {
  window.addEventListener(type, listener, options);

  return () => {
    window.removeEventListener(type, listener);
  };
}

@observer
export class CommandContainer extends React.Component<CommandContainerProps> {
  private escHandler(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      CommandOverlay.close();
    }
  }

  handleCommandPalette = () => {
    const clusterIsActive = getMatchedClusterId() !== undefined;

    if (clusterIsActive) {
      broadcastMessage(`command-palette:${catalogEntityRegistry.activeEntity.getId()}:open`);
    } else {
      CommandOverlay.open(<CommandDialog />);
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
    const action = this.props.clusterId
      ? () => CommandOverlay.open(<CommandDialog />)
      : this.handleCommandPalette;
    const ipcChannel = this.props.clusterId
      ? `command-palette:${this.props.clusterId}:open`
      : "command-palette:open";

    disposeOnUnmount(this, [
      ipcRendererOn(ipcChannel, action),
      addWindowEventListener("keydown", this.onKeyboardShortcut(action)),
      addWindowEventListener("keyup", (e) => this.escHandler(e), true),
    ]);
  }

  render() {
    return (
      <Dialog
        isOpen={CommandOverlay.isOpen}
        animated={true}
        onClose={CommandOverlay.close}
        modal={false}
      >
        <div id="command-container">
          {CommandOverlay.component}
        </div>
      </Dialog>
    );
  }
}
