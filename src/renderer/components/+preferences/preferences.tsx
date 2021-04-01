import "./preferences.scss";

import React from "react";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";

import { userStore } from "../../../common/user-store";
import { isWindows } from "../../../common/vars";
import { appPreferenceRegistry } from "../../../extensions/registries/app-preference-registry";
import { themeStore } from "../../theme.store";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { PageLayout } from "../layout/page-layout";
import { SubTitle } from "../layout/sub-title";
import { Select, SelectOption } from "../select";
import { HelmCharts } from "./helm-charts";
import { KubectlBinaries } from "./kubectl-binaries";
import { navigation } from "../../navigation";
import { Tab, Tabs } from "../tabs";
import { FormSwitch, Switcher } from "../switch";

enum PreferencesTab {
  Application = "application",
  Proxy = "proxy",
  Kubernetes = "kubernetes",
  Extensions = "extensions"
}

@observer
export class Preferences extends React.Component {
  @observable httpProxy = userStore.preferences.httpsProxy || "";
  @observable shell = userStore.preferences.shell || "";
  @observable activeTab = PreferencesTab.Application;

  @computed get themeOptions(): SelectOption<string>[] {
    return themeStore.themes.map(theme => ({
      label: theme.name,
      value: theme.id,
    }));
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => navigation.location.hash, hash => {
        const fragment = hash.slice(1); // hash is /^(#\w.)?$/

        if (fragment) {
          // ignore empty framents
          document.getElementById(fragment)?.scrollIntoView();
        }
      }, {
        fireImmediately: true
      })
    ]);
  }

  onTabChange = (tabId: PreferencesTab) => {
    this.activeTab = tabId;
  };

  renderNavigation() {
    return (
      <Tabs className="flex column" scrollable={false} onChange={this.onTabChange}>
        <div className="header">Preferences</div>
        <Tab
          value={PreferencesTab.Application}
          label="Application"
          active={this.activeTab == PreferencesTab.Application}
        />
        <Tab
          value={PreferencesTab.Proxy}
          label="Proxy"
          active={this.activeTab == PreferencesTab.Proxy}
        />
        <Tab
          value={PreferencesTab.Kubernetes}
          label="Kubernetes"
          active={this.activeTab == PreferencesTab.Kubernetes}
        />
        <Tab
          value={PreferencesTab.Extensions}
          label="Extensions"
          active={this.activeTab == PreferencesTab.Extensions}
        />
      </Tabs>
    );
  }

  render() {
    const { preferences } = userStore;
    let defaultShell = process.env.SHELL || process.env.PTYSHELL;

    if (!defaultShell) {
      if (isWindows) {
        defaultShell = "powershell.exe";
      } else {
        defaultShell = "System default shell";
      }
    }

    return (
      <PageLayout
        showOnTop
        navigation={this.renderNavigation()}
        className="Preferences"
        contentGaps={false}
      >
        {this.activeTab == PreferencesTab.Application && (
          <section id="application">
            <section id="appearance">
              <h2>Appearance</h2>
              <SubTitle title="Theme"/>
              <Select
                options={this.themeOptions}
                value={preferences.colorTheme}
                onChange={({ value }: SelectOption) => preferences.colorTheme = value}
              />
            </section>

            <hr/>

            <section id="shell">
              <h2>Terminal Shell</h2>
              <SubTitle title="Shell Path"/>
              <Input
                theme="round-black"
                placeholder={defaultShell}
                value={this.shell}
                onChange={v => this.shell = v}
                onBlur={() => preferences.shell = this.shell}
              />
              <div className="hint">
                The path of the shell that the terminal uses.
              </div>
            </section>

            <hr/>

            <section id="startup">
              <h2>Start-up</h2>
              <FormSwitch
                control={
                  <Switcher
                    checked={preferences.openAtLogin}
                    onChange={v => preferences.openAtLogin = v.target.checked}
                    name="startup"
                  />
                }
                label="Automatically start Lens on login"
              />
            </section>
          </section>
        )}
        {this.activeTab == PreferencesTab.Proxy && (
          <section id="proxy">
            <h2>Proxy</h2>
            <SubTitle title="HTTP Proxy"/>
            <Input
              theme="round-black"
              placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
              value={this.httpProxy}
              onChange={v => this.httpProxy = v}
              onBlur={() => preferences.httpsProxy = this.httpProxy}
            />
            <small className="hint">
              Proxy is used only for non-cluster communication.
            </small>

            <SubTitle title="Certificate Trust"/>
            <Checkbox
              label="Allow untrusted Certificate Authorities"
              value={preferences.allowUntrustedCAs}
              onChange={v => preferences.allowUntrustedCAs = v}
            />
            <small className="hint">
              This will make Lens to trust ANY certificate authority without any validations.{" "}
              Needed with some corporate proxies that do certificate re-writing.{" "}
              Does not affect cluster communications!
            </small>
          </section>
        )}

        {this.activeTab == PreferencesTab.Kubernetes && (
          <section id="kubernetes">
            <section>
              <h1>Kubernetes</h1>
            </section>
            <section id="kubectl">
              <h2>Kubectl binary</h2>
              <KubectlBinaries preferences={preferences}/>
            </section>
            <section id="helm">
              <h2>Helm Charts</h2>
              <HelmCharts/>
            </section>
          </section>
        )}

        {this.activeTab == PreferencesTab.Extensions && (
          <section id="extensions">
            <section>
              <h1>Extensions</h1>
            </section>
            {appPreferenceRegistry.getItems().map(({ title, id, components: { Hint, Input } }, index) => {
              return (
                <section key={index} id={title}>
                  <h2 id={id}>{title}</h2>
                  <Input/>
                  <small className="hint">
                    <Hint/>
                  </small>
                </section>
              );
            })}
          </section>
        )}
      </PageLayout>
    );
  }
}
