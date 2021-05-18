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
import { Component, K8sApi, Navigation} from "@k8slens/extensions";

export interface NodeMenuProps extends Component.KubeObjectMenuProps<K8sApi.Node> {
}

export function NodeMenu(props: NodeMenuProps) {
  const { object: node, toolbar } = props;

  if (!node) return null;
  const nodeName = node.getName();

  const sendToTerminal = (command: string) => {
    Component.terminalStore.sendCommand(command, {
      enter: true,
      newTab: true,
    });
    Navigation.hideDetails();
  };

  const shell = () => {
    Component.createTerminalTab({
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

    Component.ConfirmDialog.open({
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
      <Component.MenuItem onClick={shell}>
        <Component.Icon svg="ssh" interactive={toolbar} title="Node shell"/>
        <span className="title">Shell</span>
      </Component.MenuItem>
      {!node.isUnschedulable() && (
        <Component.MenuItem onClick={cordon}>
          <Component.Icon material="pause_circle_filled" title="Cordon" interactive={toolbar}/>
          <span className="title">Cordon</span>
        </Component.MenuItem>
      )}
      {node.isUnschedulable() && (
        <Component.MenuItem onClick={unCordon}>
          <Component.Icon material="play_circle_filled" title="Uncordon" interactive={toolbar}/>
          <span className="title">Uncordon</span>
        </Component.MenuItem>
      )}
      <Component.MenuItem onClick={drain}>
        <Component.Icon material="delete_sweep" title="Drain" interactive={toolbar}/>
        <span className="title">Drain</span>
      </Component.MenuItem>
    </>
  );
}
