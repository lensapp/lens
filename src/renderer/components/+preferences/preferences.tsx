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
import { observable, reaction, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";

import { AppPreferenceKind, AppPreferenceKindRegistry, AppPreferenceRegistry, RegisteredAppPreference } from "../../../extensions/registries/app-preference-registry";
import { SubTitle } from "../layout/sub-title";
import { navigation } from "../../navigation";
import { Tab, Tabs } from "../tabs";
import { SettingLayout } from "../layout/setting-layout";
import { iter } from "../../utils";

@observer
export class Preferences extends React.Component {
  @observable activeTab: string = AppPreferenceKind.Application;

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => navigation.location.hash, hash => {
        const fragment = hash.slice(1); // hash is /^(#\w.)?$/

        if (fragment.length > 0) {
          const settingsItem = AppPreferenceRegistry.getInstance().getItems().find(item => item.id === fragment);

          if (settingsItem) {
            this.activeTab = settingsItem.showInPreferencesTab;
            setTimeout(() => {
              document.getElementById(fragment)?.scrollIntoView();
            }, 150);
          }
        }
      }, {
        fireImmediately: true
      })
    ]);
  }

  onTabChange = (tabId: string) => {
    this.activeTab = tabId;
  };

  renderNavigation() {
    const activeTabs = new Set(
      iter.map(
        iter.filter(
          AppPreferenceRegistry.getInstance().getItems(),
          item => !item.hide,
        ),
        item => item.showInPreferencesTab
      )
    );
    const tabs = AppPreferenceKindRegistry.getInstance().getItems();

    return (
      <Tabs className="flex column" scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
        <div className="header">Preferences</div>
        {
          ...tabs
            .filter(tab => activeTabs.has(tab.id))
            .map(tab => <Tab key={tab.id} value={tab.id} label={tab.title} data-testid={`${tab.id}-tab`} />)
        }
      </Tabs>
    );
  }

  renderActiveTab() {
    const entries = AppPreferenceRegistry.getInstance().getItems().filter(item => (
      item.showInPreferencesTab === this.activeTab
      && !item.hide
    ));
    const tab = AppPreferenceKindRegistry.getInstance().getItems().find(item => item.id === this.activeTab);

    return (
      <section id={tab.id}>
        <h2 data-testid={`${tab.id}-header`}>{tab.title}</h2>
        {...entries.map(this.renderPreference)}
      </section>
    );
  }

  renderPreference = ({ title, id, components: { Hint, Input } }: RegisteredAppPreference) => {
    return (
      <React.Fragment key={id}>
        <section id={id} className="small">
          <SubTitle title={title}/>
          <Input/>
          {
            Hint && (
              <small className="hint">
                <Hint/>
              </small>
            )
          }
        </section>
        <hr className="small"/>
      </React.Fragment>
    );
  };

  render() {
    return (
      <SettingLayout
        navigation={this.renderNavigation()}
        className="Preferences"
        contentGaps={false}
      >
        {this.renderActiveTab()}
      </SettingLayout>
    );
  }
}
