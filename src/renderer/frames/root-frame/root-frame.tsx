/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { injectSystemCAs } from "../../../common/system-ca";
import React from "react";
import { observer } from "mobx-react";
import { ClusterManager } from "../../components/cluster-manager";
import { ErrorBoundary } from "../../components/error-boundary";
import { Notifications } from "../../components/notifications";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { CommandContainer } from "../../components/command-palette/command-container";
import { ipcRenderer } from "electron";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { ClusterFrameHandler } from "../../components/cluster-manager/lens-views";

injectSystemCAs();

@observer
export class RootFrame extends React.Component {
  static displayName = "RootFrame";

  constructor(props: any) {
    super(props);

    ClusterFrameHandler.createInstance();
  }

  componentDidMount() {
    ipcRenderer.send(IpcRendererNavigationEvents.LOADED);
  }

  render() {
    return (
      <>
        <ErrorBoundary>
          <ClusterManager />
        </ErrorBoundary>
        <Notifications />
        <ConfirmDialog />
        <CommandContainer />
      </>
    );
  }
}
