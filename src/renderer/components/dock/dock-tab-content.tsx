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

import styles from "./dock-tab-content.module.css";
import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import type { DockTab, TabId } from "./dock.store";
import { dockStore } from "./dock.store";
import { cssNames } from "../../utils";
import { DockTabComponents, dockViewsManager } from "./dock.views-manager";
import { MonacoEditor } from "../monaco-editor";
import throttle from "lodash/throttle";

export interface DockTabContentProps extends React.HTMLAttributes<any> {
  className?: string;
  tab?: DockTab;
  bindContainerRef?(elem: HTMLElement): void;
}

@observer
export class DockTabContent extends React.Component<DockTabContentProps> {
  @observable.ref editor: MonacoEditor;

  constructor(props: DockTabContentProps) {
    super(props);
    makeObservable(this);

    disposeOnUnmount(this, [
      reaction(() => this.tabId, this.onTabChange, { delay: 100 }),

      // keep focus on editor's area when <Dock/> just opened
      reaction(() => dockStore.isOpen, isOpen => isOpen && this.focusEditor()),

      // focus to editor on dock's resize or turning into fullscreen mode
      dockStore.onResize(throttle(() => this.focusEditor(), 250)),
    ]);
  }

  @computed get tabId(): TabId | undefined {
    return this.props.tab?.id;
  }

  @computed get tabComponents(): DockTabComponents | undefined {
    return dockViewsManager.get(this.props.tab?.kind);
  }

  @observable error = "";

  @computed get editorIsVisible() {
    return Boolean(this.tabComponents?.editor);
  }

  focusEditor() {
    if (!this.editorIsVisible) return;

    this.editor.focus();
  }

  @action
  onTabChange = () => {
    this.error = ""; // reset any errors from another tab
    this.focusEditor(); // focus to editor if available via registered tab views
  };

  /**
   * Always keep editor in DOM while (while <Dock/> is open/rendered).
   * This allows to restore editor's model-view state (cursor pos, selection, etc.)
   * while switching between different tab.kind-s (e.g. "terminal" tab doesn't have editor)
   */
  renderEditor() {
    const { tabId, tabComponents: { editor } } = this;

    return (
      <MonacoEditor
        id={tabId}
        autoFocus={true}
        className={cssNames({ hidden: !this.editorIsVisible })}
        value={editor?.getValue(tabId) ?? ""}
        onChange={value => {
          this.error = "";
          editor?.setValue(tabId, value);
        }}
        onError={error => {
          this.error = this.editorIsVisible ? error : "";
        }}
        ref={editor => this.editor = editor}
      />
    );
  }

  render() {
    const { bindContainerRef, className, tab } = this.props;

    if (!tab) return null;
    const { InfoPanel, Content } = this.tabComponents;

    return (
      <div
        data-test-component="dock-tab-content"
        className={cssNames(styles.DockTabContent, className)}
        ref={bindContainerRef}
      >
        {InfoPanel && <InfoPanel tabId={this.tabId} error={this.error}/>}
        {Content && <Content {...this.props}/>}
        {this.renderEditor()}
        {this.props.children}
      </div>
    );
  }
}
