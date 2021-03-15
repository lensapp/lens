import "./preferences.scss";

import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";

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
import { ScrollSpy } from "../scroll-spy/scroll-spy";

@observer
export class Preferences extends React.Component {
  @observable httpProxy = userStore.preferences.httpsProxy || "";
  @observable shell = userStore.preferences.shell || "";

  @computed get themeOptions(): SelectOption<string>[] {
    return themeStore.themes.map(theme => ({
      label: theme.name,
      value: theme.id,
    }));
  }

  render() {
    const { preferences } = userStore;
    const header = <h2>Preferences</h2>;
    let defaultShell = process.env.SHELL || process.env.PTYSHELL;

    if (!defaultShell) {
      if (isWindows) {
        defaultShell = "powershell.exe";
      } else {
        defaultShell = "System default shell";
      }
    }

    return (
      <ScrollSpy htmlFor="ScrollSpyRoot" render={navigation => (
        <PageLayout
          showOnTop
          navigation={navigation}
          className="Preferences"
          contentGaps={false}
          header={header}
        >
          <section id="application" title="Application">
            <section>
              <h1>Application</h1>
            </section>
            <section id="appearance">
              <h2>Appearance</h2>
              <SubTitle title="Theme"/>
              <Select
                options={this.themeOptions}
                value={preferences.colorTheme}
                onChange={({ value }: SelectOption) => preferences.colorTheme = value}
              />
            </section>
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
              <small className="hint">
                The path of the shell that the terminal uses.
              </small>
            </section>
            <section id="startup">
              <h2>Start-up</h2>
              <SubTitle title="Automatic Start-up"/>
              <Checkbox
                label="Automatically start Lens on login"
                value={preferences.openAtLogin}
                onChange={v => preferences.openAtLogin = v}
              />
            </section>
          </section>

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

          <section id="extensions">
            <section>
              <h1>Extensions</h1>
            </section>
            {appPreferenceRegistry.getItems().map(({ title, components: { Hint, Input } }, index) => {
              return (
                <section key={index} id={title}>
                  <h2>{title}</h2>
                  <Input/>
                  <small className="hint">
                    <Hint/>
                  </small>
                </section>
              );
            })}
          </section>
        </PageLayout>
      )}/>
    );
  }
}
