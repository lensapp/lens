/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./preferences.scss";

import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { matchPath, Redirect, Route, RouteProps, Switch } from "react-router";
import {
  appRoute,
  appURL,
  editorURL,
  extensionRoute,
  extensionURL,
  kubernetesRoute,
  kubernetesURL,
  preferencesURL,
  proxyRoute,
  proxyURL,
  editorRoute,
  telemetryRoute,
  telemetryURL,
  terminalRoute,
  terminalURL,
} from "../../../common/routes";
import { navigateWithoutHistoryChange, navigation } from "../../navigation";
import { SettingLayout } from "../layout/setting-layout";
import { Tab, Tabs } from "../tabs";
import { Application } from "./application";
import { Kubernetes } from "./kubernetes";
import { Editor } from "./editor";
import { Terminal } from "./terminal";
import { LensProxy } from "./proxy";
import { Telemetry } from "./telemetry";
import { Extensions } from "./extensions";
import { sentryDsn } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import appPreferencesInjectable from "./app-preferences/app-preferences.injectable";

interface Dependencies {
  appPreferenceItems: IComputedValue<RegisteredAppPreference[]>
}

const NonInjectedPreferences: React.FC<Dependencies> = ({ appPreferenceItems }) => {

  function renderNavigation() {
    const extensions = appPreferenceItems.get();
    const telemetryExtensions = extensions.filter(e => e.showInPreferencesTab == "telemetry");
    const currentLocation = navigation.location.pathname;
    const isActive = (route: RouteProps) => !!matchPath(currentLocation, { path: route.path, exact: route.exact });

    return (
      <Tabs className="flex column" scrollable={false} onChange={(url) => navigateWithoutHistoryChange({ pathname: url })}>
        <div className="header">Preferences</div>
        <Tab value={appURL()} label="Application" data-testid="application-tab" active={isActive(appRoute)}/>
        <Tab value={proxyURL()} label="Proxy" data-testid="proxy-tab" active={isActive(proxyRoute)}/>
        <Tab value={kubernetesURL()} label="Kubernetes" data-testid="kubernetes-tab" active={isActive(kubernetesRoute)}/>
        <Tab value={editorURL()} label="Editor" data-testid="editor-tab" active={isActive(editorRoute)}/>
        <Tab value={terminalURL()} label="Terminal" data-testid="terminal-tab" active={isActive(terminalRoute)}/>
        {(telemetryExtensions.length > 0 || !!sentryDsn) &&
          <Tab value={telemetryURL()} label="Telemetry" data-testid="telemetry-tab" active={isActive(telemetryRoute)}/>
        }
        {extensions.filter(e => !e.showInPreferencesTab).length > 0 &&
          <Tab value={extensionURL()} label="Extensions" data-testid="extensions-tab" active={isActive(extensionRoute)}/>
        }
      </Tabs>
    );
  }

  return (
    <SettingLayout
      navigation={renderNavigation()}
      className="Preferences"
      contentGaps={false}
    >
      <Switch>
        <Route path={appURL()} component={Application}/>
        <Route path={proxyURL()} component={LensProxy}/>
        <Route path={kubernetesURL()} component={Kubernetes}/>
        <Route path={editorURL()} component={Editor}/>
        <Route path={terminalURL()} component={Terminal}/>
        <Route path={telemetryURL()} component={Telemetry}/>
        <Route path={extensionURL()} component={Extensions}/>
        <Redirect exact from={`${preferencesURL()}/`} to={appURL()}/>
      </Switch>
    </SettingLayout>
  );
};

export const Preferences = withInjectables<Dependencies>(
  observer(NonInjectedPreferences),

  {
    getProps: (di) => ({
      appPreferenceItems: di.inject(appPreferencesInjectable),
    }),
  },
);
