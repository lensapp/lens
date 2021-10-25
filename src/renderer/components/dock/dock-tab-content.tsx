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
import throttle from "lodash/throttle";
import React from "react";
import { action, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { dockStore, TabId } from "./dock.store";
import { cssNames } from "../../utils";
import { MonacoEditor, MonacoEditorProps } from "../monaco-editor";
import { DockTabContext } from "./dock-tab-context";

export interface DockTabContentProps extends React.HTMLAttributes<any> {
  tabId: TabId;
  className?: string;
  withEditor?: boolean;
  editorValue?: MonacoEditorProps["value"];
  editorOnChange?: MonacoEditorProps["onChange"];
}

@observer
export class DockTabContent extends React.Component<DockTabContentProps> {
  @observable.ref editor?: MonacoEditor;
  @observable error = "";

  constructor(props: DockTabContentProps) {
    super(props);
    makeObservable(this);

    disposeOnUnmount(this, [
      // keep focus on editor's area when <Dock/> just opened
      reaction(() => dockStore.isOpen, isOpen => isOpen && this.editor?.focus()),

      // focus to editor on dock's resize or turning into fullscreen mode
      dockStore.onResize(throttle(() => this.editor?.focus(), 250)),
    ]);
  }

  render() {
    const { className, tabId, withEditor, editorValue, editorOnChange } = this.props;
    const { error } = this;

    if (!tabId) return null;

    return (
      <div className={cssNames(styles.DockTabContent, className)}>
        <DockTabContext.Provider value={{ error }}>
          {this.props.children}

          {withEditor && (
            <MonacoEditor
              autoFocus
              id={tabId}
              className={styles.editor}
              value={editorValue ?? ""}
              onChange={action((value, evt) => {
                this.error = ""; // reset first
                editorOnChange?.(value, evt);
              })}
              onError={error => this.error = String(error)}
              onModelChange={() => this.error = ""}
              ref={monaco => this.editor = monaco}></MonacoEditor>
          )}
        </DockTabContext.Provider>
      </div>
    );
  }
}
