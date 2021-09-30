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

import "./monaco-editor.scss";
import React from "react";
import { computed, makeObservable, reaction, toJS } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import * as monaco from "monaco-editor";
import logger from "../../../common/logger";
import ReactMonacoEditor, { EditorDidMount, MonacoEditorProps } from "react-monaco-editor";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";
import { cssNames } from "../../utils";
import { dockStore } from "../dock/dock.store";

interface Props extends MonacoEditorProps {
  id?: string; // associate editor's model.uri with some ID (e.g. DockStore.TabId)
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  theme?: "vs" /* default, light theme */ | "vs-dark" | "hc-black" | string;
  language?: "yaml" | "json"; // configure bundled list of languages in via MonacoWebpackPlugin({languages: []})
  onError?(error: string): void; // TODO: validation or some another occurred error
}

export const defaultEditorProps: Partial<Props> = {
  language: "yaml",
  get theme(): string {
    // theme for monaco-editor defined in `src/renderer/themes/lens-*.json`
    return ThemeStore.getInstance().activeTheme.monacoTheme;
  }
};

@observer
export class MonacoEditor extends React.Component<Props> {
  static defaultProps = defaultEditorProps as object;
  static models = new WeakMap<MonacoEditor, monaco.editor.ITextModel[]>();
  static viewStates = new WeakMap<monaco.editor.ITextModel, monaco.editor.ICodeEditorViewState>();

  public editor: monaco.editor.IStandaloneCodeEditor = null;
  public staticId = `editor-id#${Math.round(1e7 * Math.random())}`;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
    MonacoEditor.models.set(this, []);

    disposeOnUnmount(this, [
      reaction(() => this.model, this.onModelChange),
      dockStore.onTabChange(() => this.saveViewState()), // backup cursor position, etc.
    ]);
  }

  onModelChange = (model: monaco.editor.ITextModel, oldModel?: monaco.editor.ITextModel) => {
    logger.info("[MONACO]: model change", { model, oldModel });
    this.editor.setModel(model);
    this.editor.restoreViewState(this.getViewState(model));
    this.editor.layout();
    this.editor.focus();
  };

  @computed get model(): monaco.editor.ITextModel {
    const { language, value, id = this.staticId } = this.props;
    const model = this.getModelById(id);

    // model with matched props.id already exists, return
    if (model) return model;

    // creating new temporary model
    const uri = this.createUri(id);
    const newModel = monaco.editor.createModel(value, language, uri);

    MonacoEditor.models.get(this).push(newModel);
    logger.info(`[MONACO]: creating new model ${uri}`, newModel);

    return newModel;
  }

  editorDidMount: EditorDidMount = (editor, monaco) => {
    this.props.editorDidMount?.(editor, monaco);
    this.editor = editor;

    if (this.props.autoFocus) {
      this.editor.focus();
    }
  };

  componentWillUnmount() {
    logger.info(`[MONACO]: unmounting editor..`);
    MonacoEditor.models.get(this).forEach(model => model.dispose());
    MonacoEditor.models.delete(this);
  }

  createUri(id: string): monaco.Uri {
    return monaco.Uri.file(`/monaco-editor/${id}`);
  }

  getViewState(model = this.model): monaco.editor.ICodeEditorViewState {
    return MonacoEditor.viewStates.get(model) ?? null;
  }

  saveViewState(model = this.model, state = this.editor.saveViewState()) {
    if (!model || !state) return;
    MonacoEditor.viewStates.set(model, state);
  }

  getModelById(id: string): monaco.editor.ITextModel | null {
    const uri = this.createUri(id);

    for (const model of MonacoEditor.models.get(this)) {
      if (String(model.uri) === String(uri)) return model;
    }

    return null;
  }

  setValue(value: string) {
    this.editor.setValue(value);
  }

  getValue(opts?: { preserveBOM: boolean; lineEnding: string; }) {
    return this.editor.getValue(opts);
  }

  render() {
    const { autoFocus, readOnly, className, options = {}, ...reactMonacoEditorProps } = this.props;
    const globalOptions = toJS(UserStore.getInstance().editorConfiguration);

    return (
      <React.Fragment>
        <ReactMonacoEditor
          {...reactMonacoEditorProps}
          className={cssNames("MonacoEditor", className)}
          editorDidMount={this.editorDidMount}
          options={{
            automaticLayout: true, // auto detection available width/height from parent container
            autoDetectHighContrast: true,
            model: this.model,
            readOnly,
            ...globalOptions,
            ...options,
          }}
        />
      </React.Fragment>
    );
  }
}
