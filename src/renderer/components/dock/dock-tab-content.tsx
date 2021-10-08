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

import "./dock-tab-content.scss";
import React from "react";
import { observer } from "mobx-react";
import { computed, makeObservable } from "mobx";
import type { DockTab, TabId } from "./dock.store";
import { cssNames } from "../../utils";
import { DockTabComponents, dockViewsManager } from "./dock.views-manager";
import { MonacoEditor } from "../monaco-editor";

export interface DockTabContentProps extends React.HTMLAttributes<any> {
  className?: string;
  tab: DockTab;
  bindContainerRef?(elem: HTMLElement): void;
}

@observer
export class DockTabContent extends React.Component<DockTabContentProps> {
  constructor(props: DockTabContentProps) {
    super(props);
    makeObservable(this);
  }

  @computed get tabId(): TabId {
    return this.props.tab.id;
  }

  @computed get tabComponents(): DockTabComponents {
    return dockViewsManager.get(this.props.tab.kind);
  }

  /**
   * Always keep editor in DOM while (while <Dock/> is open/rendered).
   * This allows to restore editor's model-view state (cursor pos, selection, etc.)
   * while switching between different tab.kind-s (e.g. "terminal" tab doesn't have editor)
   */
  renderEditor() {
    const { tabId } = this;
    const { editor } = this.tabComponents;

    return (
      <MonacoEditor
        id={tabId}
        className={cssNames({ hidden: !editor })}
        value={editor?.getValue(tabId)}
        onChange={value => editor?.setValue(tabId, value)}
        onError={error => editor?.onError?.(tabId, error)}
      />
    );
  }

  render() {
    const { children: bottomContent, bindContainerRef, className, tab } = this.props;

    if (!tab) return null;
    const { Content } = this.tabComponents;

    return (
      <div className={cssNames("DockTabContent flex column", className)} ref={bindContainerRef}>
        {Content && <Content {...this.props}/>}
        {this.renderEditor()}
        {bottomContent}
      </div>
    );
  }
}
