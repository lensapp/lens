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
import "./preferences.scss";

import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { matchPath, Redirect, Route, RouteComponentProps, RouteProps, Switch } from "react-router";

import {
  appRoute,
  appURL,
  extensionRoute,
  extensionURL,
  kubernetesRoute,
  kubernetesURL,
  preferencesURL,
  proxyRoute,
  proxyURL,
  telemetryRoute,
  telemetryURL,
} from "../../../common/routes";
import { AppPreferenceRegistry, RegisteredAppPreference } from "../../../extensions/registries/app-preference-registry";
import { navigate, navigation } from "../../navigation";
import { SettingLayout } from "../layout/setting-layout";
import { SubTitle } from "../layout/sub-title";
import { Tab, Tabs } from "../tabs";
import { Application } from "./application";
import { Kubernetes } from "./kubernetes";
import { LensProxy } from "./proxy";
import { Telemetry } from "./telemetry";
import { boundMethod } from "autobind-decorator";

interface Props extends RouteComponentProps<any> {
}

@observer
export class Preferences extends React.Component<Props> {
  @observable historyLength: number | undefined;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.historyLength = this.props.history?.length;
  }

  @boundMethod
  onClose() {
    const stepsToGoBack = navigation.length - this.historyLength + 1;

    if (isNaN(stepsToGoBack)) {
      navigation.goBack();
    } else {
      navigation.go(-stepsToGoBack);
    }
  }

  renderNavigation() {
    const extensions = AppPreferenceRegistry.getInstance().getItems().filter(e => !e.showInPreferencesTab);
    const currentLocation = navigation.location.pathname;
    const isActive = (route: RouteProps) => !!matchPath(currentLocation, { path: route.path, exact: route.exact });

    return (
      <Tabs className="flex column" scrollable={false} onChange={(url) => navigate(url)}>
        <div className="header">Preferences</div>
        <Tab value={appURL()} label="Application" data-testid="application-tab" active={isActive(appRoute)}/>
        <Tab value={proxyURL()} label="Proxy" data-testid="proxy-tab" active={isActive(proxyRoute)}/>
        <Tab value={kubernetesURL()} label="Kubernetes" data-testid="kube-tab" active={isActive(kubernetesRoute)}/>
        <Tab value={telemetryURL()} label="Telemetry" data-testid="telemetry-tab" active={isActive(telemetryRoute)}/>
        {extensions.length > 0 &&
          <Tab value={extensionURL()} label="Extensions" data-testid="extensions-tab" active={isActive(extensionRoute)}/>
        }
      </Tabs>
    );
  }

  render() {
    return (
      <SettingLayout
        navigation={this.renderNavigation()}
        className="Preferences"
        contentGaps={false}
        back={this.onClose}
      >
        <Switch>
          <Route path={appURL()} component={Application}/>
          <Route path={proxyURL()} component={LensProxy}/>
          <Route path={kubernetesURL()} component={Kubernetes}/>
          <Route path={telemetryURL()} component={Telemetry}/>
          <Route path={extensionURL()} component={Telemetry}/>
          <Redirect exact from={`${preferencesURL()}/`} to={appURL()}/>
        </Switch>
      </SettingLayout>
    );
  }
}

export function ExtensionSettings({ title, id, components: { Hint, Input } }: RegisteredAppPreference) {
  return (
    <React.Fragment>
      <section id={id} className="small">
        <SubTitle title={title}/>
        <Input/>
        <div className="hint">
          <Hint/>
        </div>
      </section>
      <hr className="small"/>
    </React.Fragment>
  );
}
