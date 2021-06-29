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

import React from "react";
import { Renderer } from "@k8slens/extensions";

type Node = Renderer.K8sApi.Node;

const {
  Component: {
    terminalStore,
    createTerminalTab,
    ConfirmDialog,
    MenuItem,
    Icon,
  },
  Navigation
} = Renderer;


export interface NodeMenuProps extends Renderer.Component.KubeObjectMenuProps<Node> {
}

export function NodeMenu(props: NodeMenuProps) {
  const { object: node, toolbar } = props;

  if (!node) return null;
  const nodeName = node.getName();

  const sendToTerminal = (command: string) => {
    terminalStore.sendCommand(command, {
      enter: true,
      newTab: true,
    });
    Navigation.hideDetails();
  };

  const shell = () => {
    createTerminalTab({
      title: `Node: ${nodeName}`,
      node: nodeName,
    });
    Navigation.hideDetails();
  };

  const cordon = () => {
    sendToTerminal(`kubectl cordon ${nodeName}`);
  };

  const unCordon = () => {
    sendToTerminal(`kubectl uncordon ${nodeName}`);
  };

  const drain = () => {
    const command = `kubectl drain ${nodeName} --delete-local-data --ignore-daemonsets --force`;

    ConfirmDialog.open({
      ok: () => sendToTerminal(command),
      labelOk: `Drain Node`,
      message: (
        <p>
          Are you sure you want to drain <b>{nodeName}</b>?
        </p>
      ),
    });
  };

  return (
    <>
      <MenuItem onClick={shell}>
        <Icon svg="ssh" interactive={toolbar} tooltip={toolbar && "Node shell"}/>
        <span className="title">Shell</span>
      </MenuItem>
      {
        node.isUnschedulable()
          ? (
            <MenuItem onClick={unCordon}>
              <Icon material="play_circle_filled" tooltip={toolbar && "Uncordon"} interactive={toolbar} />
              <span className="title">Uncordon</span>
            </MenuItem>
          )
          : (
            <MenuItem onClick={cordon}>
              <Icon material="pause_circle_filled" tooltip={toolbar && "Cordon"} interactive={toolbar} />
              <span className="title">Cordon</span>
            </MenuItem>
          )
      }
      <MenuItem onClick={drain}>
        <Icon material="delete_sweep" tooltip={toolbar && "Drain"} interactive={toolbar}/>
        <span className="title">Drain</span>
      </MenuItem>
    </>
  );
}
