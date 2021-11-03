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

import styles from "./editor-panel.module.css";
import throttle from "lodash/throttle";
import React from "react";
import { makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { dockStore, TabId } from "./dock.store";
import { cssNames } from "../../utils";
import { MonacoEditor, MonacoEditorProps } from "../monaco-editor";

export interface EditorPanelProps {
  tabId: TabId;
  value: string;
  className?: string;
  autoFocus?: boolean; // default: true
  onChange: MonacoEditorProps["onChange"];
  onError?: MonacoEditorProps["onError"];
}

const defaultProps: Partial<EditorPanelProps> = {
  autoFocus: true,
};

@observer
export class EditorPanel extends React.Component<EditorPanelProps> {
  static defaultProps = defaultProps as object;

  @observable.ref editor?: MonacoEditor;

  constructor(props: EditorPanelProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      // keep focus on editor's area when <Dock/> just opened
      reaction(() => dockStore.isOpen, isOpen => isOpen && this.editor?.focus(), {
        fireImmediately: true,
      }),

      // focus to editor on dock's resize or turning into fullscreen mode
      dockStore.onResize(throttle(() => this.editor?.focus(), 250)),
    ]);
  }

  render() {
    const { className, autoFocus, tabId, value, onChange, onError } = this.props;

    if (!tabId) return null;

    return (
      <MonacoEditor
        autoFocus={autoFocus}
        id={tabId}
        value={value}
        className={cssNames(styles.EditorPanel, className)}
        onChange={onChange}
        onError={onError}
        ref={monaco => this.editor = monaco}
      />
    );
  }
}
