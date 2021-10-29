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

import MonacoEditor, { monaco } from "react-monaco-editor";
import React from "react";
import yaml from "js-yaml";
import { observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { dockStore, TabId } from "./dock.store";
import { monacoModelsManager } from "./monaco-model-manager";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";

import "monaco-editor";

interface Props {
  className?: string;
  tabId: TabId;
  value?: string;
  onChange(value: string, error?: string): void;
}


@observer
export class EditorPanel extends React.Component<Props> {
  model: monaco.editor.ITextModel;
  public editor: monaco.editor.IStandaloneCodeEditor;
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

  editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    this.editor = editor;
    const model = monacoModelsManager.getModel(this.props.tabId);

    model.setValue(this.props.value ?? "");
    this.editor.setModel(model);
  };

  validate(value: string) {
    try {
      yaml.loadAll(value);
      this.yamlError = "";
    } catch (err) {
      this.yamlError = err.toString();
    }
  }

  onTabChange = () => {
    this.editor.focus();
    const model = monacoModelsManager.getModel(this.props.tabId);

    model.setValue(this.props.value ?? "");
    this.editor.setModel(model);
  };

  onResize = () => {
    this.editor.focus();
  };

  onChange = (value: string) => {
    this.validate(value);
    this.props.onChange?.(value, this.yamlError);
  };

  render() {
    return (
      <MonacoEditor
        options={{ model: null, ...UserStore.getInstance().getEditorOptions() }}
        theme={ThemeStore.getInstance().activeTheme.monacoTheme}
        language = "yaml"
        onChange = {this.onChange}
        editorDidMount={this.editorDidMount}
      />
    );
  }
}
