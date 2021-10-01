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
import { action, computed, makeObservable, observable, reaction, toJS, when } from "mobx";
import { observer } from "mobx-react";
import { editor, Uri } from "monaco-editor";
import logger from "../../../common/logger";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";
import { cssNames, disposer } from "../../utils";

export interface MonacoEditorProps {
  id?: string; // associating editor's ID with created model.uri
  value?: string; // initial text value for editor
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  theme?: "vs" /* default, light theme */ | "vs-dark" | "hc-black" | string;
  language?: "yaml" | "json"; // configure bundled list of languages in via MonacoWebpackPlugin({languages: []})
  options?: editor.IStandaloneEditorConstructionOptions; // customize editor's initialization options
  onChange?: onChangeCallback;
  onError?: onErrorCallback;
  onDidLayoutChange?(info: editor.EditorLayoutInfo): void;
  onDidContentSizeChange?(evt: editor.IContentSizeChangedEvent): void;
}

export interface onChangeCallback {
  (value: string, data: {
    model: editor.ITextModel, // current model
    event: editor.IModelContentChangedEvent;
  }): void;
}

export interface onErrorCallback {
  (error: string): void; // TODO: provide validation or some another occurred error
}

export const defaultEditorProps: Partial<MonacoEditorProps> = {
  value: "",
  options: {},
  language: "yaml",
  autoFocus: false,
  get theme(): string {
    // theme for monaco-editor defined in `src/renderer/themes/lens-*.json`
    return ThemeStore.getInstance().activeTheme.monacoTheme;
  }
};

@observer
export class MonacoEditor extends React.Component<MonacoEditorProps> {
  static defaultProps = defaultEditorProps as object;
  static models = new WeakMap<MonacoEditor, editor.ITextModel[]>();
  static viewStates = new WeakMap<editor.ITextModel, editor.ICodeEditorViewState>();

  public staticId = `editor-id#${Math.round(1e7 * Math.random())}`;
  public disposeOnUnmount = disposer();

  @observable.ref containerElem: HTMLElement;
  @observable.ref editor: editor.IStandaloneCodeEditor;
  @observable dimensions: { width?: number, height?: number } = {};
  @observable unmounting = false;

  constructor(props: MonacoEditorProps) {
    super(props);
    makeObservable(this);

    MonacoEditor.models.set(this, []);
  }

  get whenEditorReady() {
    return when(() => Boolean(this.containerElem && this.editor));
  }

  get whenUnmounting() {
    return when(() => this.unmounting);
  }

  /**
   * Monitor editor's dom container element box-size and sync with monaco's dimensions
   * @private
   */
  private bindResizeObserver() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        logger.info(`[MONACO]: refreshing dimensions to width=${width} and height=${height}`, entry);
        this.setDimensions(width, height);
      }
    });

    const containerElem = this.editor.getContainerDomNode();

    resizeObserver.observe(containerElem);

    return () => resizeObserver.unobserve(containerElem);
  }

  onModelChange = (model: editor.ITextModel, oldModel?: editor.ITextModel) => {
    logger.info("[MONACO]: model change", { model, oldModel });

    this.saveViewState(oldModel); // save previously used view-model state
    this.editor.setModel(model);
    this.editor.restoreViewState(this.getViewState(model)); // restore cursor position, selection, etc.
    this.editor.layout();
  };

  @computed get model(): editor.ITextModel {
    const { language, value, id = this.staticId } = this.props;
    const model = this.getModelById(id);

    // model with matched props.id already exists, return
    if (model) return model;

    // creating new temporary model
    const uri = this.createUri(id);
    const newModel = editor.createModel(value, language, uri);

    logger.info(`[MONACO]: creating new model ${uri}`, newModel);
    MonacoEditor.models.get(this).push(newModel);

    return newModel;
  }

  @computed get globalEditorOptions() {
    return toJS(UserStore.getInstance().editorConfiguration);
  }

  componentDidMount() {
    this.createEditor();
    logger.info(`[MONACO]: editor did mounted`);

    if (this.props.autoFocus) {
      this.editor.focus();
    }
  }

  componentWillUnmount() {
    logger.info(`[MONACO]: unmounting editor..`);
    this.unmounting = true;
    this.disposeOnUnmount();
    MonacoEditor.models.get(this).forEach(model => model.dispose());
    MonacoEditor.models.delete(this);
    this.editor?.dispose();
  }

  private createEditor = (): void => {
    if (!this.containerElem || this.editor || this.unmounting) {
      return;
    }
    const { language, theme, readOnly, value: defaultValue, options } = this.props;

    this.editor = editor.create(this.containerElem, {
      model: this.model,
      value: defaultValue,
      language,
      theme,
      readOnly,
      ...this.globalEditorOptions,
      ...options,
    });
    logger.info(`[MONACO]: editor created for language=${language}, theme=${theme}`);

    const onDidLayoutChangeDisposer = this.editor.onDidLayoutChange(layoutInfo => {
      this.props.onDidLayoutChange?.(layoutInfo);
      // logger.info("[MONACO]: onDidLayoutChange()", layoutInfo);
    });

    const onValueChangeDisposer = this.editor.onDidChangeModelContent(event => {
      const value = this.editor.getValue();
      // logger.info("[MONACO]: value changed", { value, event });

      this.props.onChange?.(value, {
        model: this.model,
        event,
      });
    });

    const onContentSizeChangeDisposer = this.editor.onDidContentSizeChange((params) => {
      this.props.onDidContentSizeChange?.(params);
      // logger.info("[MONACO]: onDidContentSizeChange():", params)
    });

    this.disposeOnUnmount.push(
      reaction(() => this.model, this.onModelChange),
      () => onDidLayoutChangeDisposer.dispose(),
      () => onValueChangeDisposer.dispose(),
      () => onContentSizeChangeDisposer.dispose(),
      this.bindResizeObserver(),
    );
  };

  @action
  setDimensions(width: number, height: number) {
    this.dimensions.width = width;
    this.dimensions.height = height;
    this.editor?.layout({ width, height });
  }

  createUri(id: string): Uri {
    return Uri.file(`/monaco-editor/${id}`);
  }

  getViewState(model = this.model): editor.ICodeEditorViewState {
    return MonacoEditor.viewStates.get(model) ?? null;
  }

  saveViewState(model = this.model) {
    if (!model) return;
    MonacoEditor.viewStates.set(model, this.editor.saveViewState());
  }

  getModelById(id: string): editor.ITextModel | null {
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

  bindRef = (elem: HTMLElement) => this.containerElem = elem;

  render() {
    const { className } = this.props;

    return (
      <div
        className={cssNames("MonacoEditor", className)}
        ref={this.bindRef}
      />
    );
  }
}
