/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { injectSystemCAs } from "../../../common/system-ca";
import React from "react";
import { Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { ClusterManager } from "../../components/cluster-manager";
import { ErrorBoundary } from "../../components/error-boundary";
import { Notifications } from "../../components/notifications";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { CommandContainer } from "../../components/command-palette/command-container";
import { ipcRenderer } from "electron";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { ClusterFrameHandler } from "../../components/cluster-manager/lens-views";
import historyInjectable from "../../navigation/history.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { History } from "history";

injectSystemCAs();

interface Dependencies {
  history: History
}

@observer
class NonInjectedRootFrame extends React.Component<Dependencies> {
  static displayName = "RootFrame";

  constructor(props: Dependencies) {
    super(props);

    ClusterFrameHandler.createInstance();
  }

  componentDidMount() {
    ipcRenderer.send(IpcRendererNavigationEvents.LOADED);
  }

  render() {
    return (
      <Router history={this.props.history}>
        <ErrorBoundary>
          <Switch>
            <Route component={ClusterManager} />
          </Switch>
        </ErrorBoundary>
        <Notifications />
        <ConfirmDialog />
        <CommandContainer />
      </Router>
    );
  }
}

export const RootFrame = withInjectables(NonInjectedRootFrame, {
  getProps: (di) => ({ history: di.inject(historyInjectable) }),
});
