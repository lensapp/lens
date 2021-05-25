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

import React from "react";
import jsYaml from "js-yaml";
import { observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import { AceEditor } from "../ace-editor";
import { dockStore, TabId } from "./dock.store";
import { DockTabStore } from "./dock-tab.store";
import type { Ace } from "ace-builds";

interface Props {
  className?: string;
  tabId: TabId;
  value: string;
  onChange(value: string, error?: string): void;
}

@observer
export class EditorPanel extends React.Component<Props> {
  static cursorPos = new DockTabStore<Ace.Point>();

  public editor: AceEditor;

  @observable yamlError = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    // validate and run callback with optional error
    this.onChange(this.props.value || "");

    disposeOnUnmount(this, [
      dockStore.onTabChange(this.onTabChange, { delay: 250 }),
      dockStore.onResize(this.onResize, { delay: 250 }),
    ]);
  }

  validate(value: string) {
    try {
      jsYaml.safeLoadAll(value);
      this.yamlError = "";
    } catch (err) {
      this.yamlError = err.toString();
    }
  }

  onTabChange = () => {
    this.editor.focus();
  };

  onResize = () => {
    this.editor.resize();
    this.editor.focus();
  };

  onCursorPosChange = (pos: Ace.Point) => {
    EditorPanel.cursorPos.setData(this.props.tabId, pos);
  };

  onChange = (value: string) => {
    this.validate(value);

    if (this.props.onChange) {
      this.props.onChange(value, this.yamlError);
    }
  };

  render() {
    const { value, tabId } = this.props;
    let { className } = this.props;

    className = cssNames("EditorPanel", className);
    const cursorPos = EditorPanel.cursorPos.getData(tabId);

    return (
      <AceEditor
        autoFocus mode="yaml"
        className={className}
        value={value}
        cursorPos={cursorPos}
        onChange={this.onChange}
        onCursorPosChange={this.onCursorPosChange}
        ref={e => this.editor = e}
      />
    );
  }
}
