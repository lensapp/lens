/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect } from "react";
import { Route, Router, Switch } from "react-router";
import { ClusterManager } from "../../components/cluster-manager";
import { ErrorBoundary } from "../../components/error-boundary";
import { Notifications } from "../../components/notifications";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { CommandContainer } from "../../components/command-palette/command-container";
import { ipcRenderer } from "electron";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { observer } from "mobx-react";
import historyInjectable from "../../navigation/history.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { History } from "history";

interface Dependencies {
  history: History
}

export const NonInjectedRootFrame = observer(({ history }: Dependencies) => {
  useEffect(() => {
    ipcRenderer.send(IpcRendererNavigationEvents.LOADED);
  }, []);

  return (
    <Router history={history}>
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
});

export const RootFrame = withInjectables<Dependencies>(NonInjectedRootFrame, {
  getProps: (di) => ({
    history: di.inject(historyInjectable),
  }),
});
