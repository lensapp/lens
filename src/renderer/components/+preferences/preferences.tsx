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

import React from "react";
import moment from "moment-timezone";
import { computed, observable, reaction, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";

import { isWindows, sentryDsn } from "../../../common/vars";
import { AppPreferenceRegistry, RegisteredAppPreference } from "../../../extensions/registries/app-preference-registry";
import { UserStore } from "../../../common/user-store";
import { ThemeStore } from "../../theme.store";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import { Select, SelectOption } from "../select";
import { HelmCharts } from "./helm-charts";
import { KubectlBinaries } from "./kubectl-binaries";
import { navigation } from "../../navigation";
import { Tab, Tabs } from "../tabs";
import { FormSwitch, Switcher } from "../switch";
import { KubeconfigSyncs } from "./kubeconfig-syncs";
import { SettingLayout } from "../layout/setting-layout";
import { Checkbox } from "../checkbox";

enum Pages {
  Application = "application",
  Proxy = "proxy",
  Kubernetes = "kubernetes",
  Telemetry = "telemetry",
  Extensions = "extensions",
  Other = "other"
}

@observer
export class Preferences extends React.Component {
  @observable httpProxy = UserStore.getInstance().httpsProxy || "";
  @observable shell = UserStore.getInstance().shell || "";
  @observable activeTab = Pages.Application;

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  @computed get themeOptions(): SelectOption<string>[] {
    return ThemeStore.getInstance().themes.map(theme => ({
      label: theme.name,
      value: theme.id,
    }));
  }

  timezoneOptions: SelectOption<string>[] = moment.tz.names().map(zone => ({
    label: zone,
    value: zone,
  }));

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => navigation.location.hash, hash => {
        const fragment = hash.slice(1); // hash is /^(#\w.)?$/

        if (fragment) {
          // ignore empty fragments
          document.getElementById(fragment)?.scrollIntoView();
        }
      }, {
        fireImmediately: true
      })
    ]);
  }

  onTabChange = (tabId: Pages) => {
    this.activeTab = tabId;
  };

  renderNavigation() {
    const extensions = AppPreferenceRegistry.getInstance().getItems().filter(e => !e.showInPreferencesTab);

    return (
      <Tabs className="flex column" scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
        <div className="header">Preferences</div>
        <Tab value={Pages.Application} label="Application" data-testid="application-tab"/>
        <Tab value={Pages.Proxy} label="Proxy" data-testid="proxy-tab"/>
        <Tab value={Pages.Kubernetes} label="Kubernetes" data-testid="kube-tab"/>
        <Tab value={Pages.Telemetry} label="Telemetry" data-testid="telemetry-tab"/>
        {extensions.length > 0 &&
          <Tab value={Pages.Extensions} label="Extensions" data-testid="extensions-tab"/>
        }
      </Tabs>
    );
  }

  renderExtension({ title, id, components: { Hint, Input } }: RegisteredAppPreference) {
    return (
      <React.Fragment key={id}>
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

  render() {
    const extensions = AppPreferenceRegistry.getInstance().getItems();
    const telemetryExtensions = extensions.filter(e => e.showInPreferencesTab == Pages.Telemetry);
    const defaultShell = process.env.SHELL
      || process.env.PTYSHELL
      || (
        isWindows
          ? "powershell.exe"
          : "System default shell"
      );

    return (
      <SettingLayout
        navigation={this.renderNavigation()}
        className="Preferences"
        contentGaps={false}
      >
        {this.activeTab == Pages.Application && (
          <section id="application">
            <h2 data-testid="application-header">Application</h2>
            <section id="appearance">
              <SubTitle title="Theme"/>
              <Select
                options={this.themeOptions}
                value={UserStore.getInstance().colorTheme}
                onChange={({ value }: SelectOption) => UserStore.getInstance().colorTheme = value}
                themeName="lens"
              />
            </section>

            <hr/>

            <section id="shell">
              <SubTitle title="Terminal Shell Path"/>
              <Input
                theme="round-black"
                placeholder={defaultShell}
                value={this.shell}
                onChange={v => this.shell = v}
                onBlur={() => UserStore.getInstance().shell = this.shell}
              />
            </section>

            <hr/>

            <section id="other">
              <SubTitle title="Start-up"/>
              <FormSwitch
                control={
                  <Switcher
                    checked={UserStore.getInstance().openAtLogin}
                    onChange={v => UserStore.getInstance().openAtLogin = v.target.checked}
                    name="startup"
                  />
                }
                label="Automatically start Lens on login"
              />
            </section>

            <hr />

            <section id="locale">
              <SubTitle title="Locale Timezone" />
              <Select
                options={this.timezoneOptions}
                value={UserStore.getInstance().localeTimezone}
                onChange={({ value }: SelectOption) => UserStore.getInstance().setLocaleTimezone(value)}
                themeName="lens"
              />
            </section>
          </section>
        )}
        {this.activeTab == Pages.Proxy && (
          <section id="proxy">
            <section>
              <h2 data-testid="proxy-header">Proxy</h2>
              <SubTitle title="HTTP Proxy"/>
              <Input
                theme="round-black"
                placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
                value={this.httpProxy}
                onChange={v => this.httpProxy = v}
                onBlur={() => UserStore.getInstance().httpsProxy = this.httpProxy}
              />
              <small className="hint">
                Proxy is used only for non-cluster communication.
              </small>
            </section>

            <hr className="small"/>

            <section className="small">
              <SubTitle title="Certificate Trust"/>
              <FormSwitch
                control={
                  <Switcher
                    checked={UserStore.getInstance().allowUntrustedCAs}
                    onChange={v => UserStore.getInstance().allowUntrustedCAs = v.target.checked}
                    name="startup"
                  />
                }
                label="Allow untrusted Certificate Authorities"
              />
              <small className="hint">
                This will make Lens to trust ANY certificate authority without any validations.{" "}
                Needed with some corporate proxies that do certificate re-writing.{" "}
                Does not affect cluster communications!
              </small>
            </section>
          </section>
        )}
        {this.activeTab == Pages.Kubernetes && (
          <section id="kubernetes">
            <section id="kubectl">
              <h2 data-testid="kubernetes-header">Kubernetes</h2>
              <KubectlBinaries />
            </section>
            <hr/>
            <section id="kube-sync">
              <h2 data-testid="kubernetes-sync-header">Kubeconfig Syncs</h2>
              <KubeconfigSyncs />
            </section>
            <hr/>
            <section id="helm">
              <h2>Helm Charts</h2>
              <HelmCharts/>
            </section>
          </section>
        )}
        {this.activeTab == Pages.Telemetry && (
          <section id="telemetry">
            <h2 data-testid="telemetry-header">Telemetry</h2>
            {telemetryExtensions.map(this.renderExtension)}
            {sentryDsn ? (
              <React.Fragment key='sentry'>
                <section id='sentry' className="small">
                  <SubTitle title='Automatic Error Reporting' />
                  <Checkbox
                    label="Allow automatic error reporting"
                    value={UserStore.getInstance().allowErrorReporting}
                    onChange={value => {
                      UserStore.getInstance().allowErrorReporting = value;
                    }}
                  />
                  <div className="hint">
                    <span>
                    Automatic error reports provide vital information about issues and application crashes.
                    It is highly recommended to keep this feature enabled to ensure fast turnaround for issues you might encounter.
                    </span>
                  </div>
                </section>
                <hr className="small" />
              </React.Fragment>) :
              // we don't need to shows the checkbox at all if Sentry dsn is not a valid url
              null
            }
          </section>
        )}
        {this.activeTab == Pages.Extensions && (
          <section id="extensions">
            <h2>Extensions</h2>
            {extensions.filter(e => !e.showInPreferencesTab).map(this.renderExtension)}
          </section>
        )}
      </SettingLayout>
    );
  }
}
