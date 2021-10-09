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
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { observer } from "mobx-react";
import { editor, Uri } from "monaco-editor";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";
import { cssNames, disposer, toJS } from "../../utils";
import { MonacoValidator, monacoValidators } from "./monaco-validators";
import debounce from "lodash/debounce";

export interface MonacoEditorProps {
  id?: string; // associating editor's ID with created model.uri
  value?: string; // initial text value for editor
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  theme?: "vs" /* default, light theme */ | "vs-dark" | "hc-black" | string;
  language?: "yaml" | "json"; // configure bundled list of languages in via MonacoWebpackPlugin({languages: []})
  options?: Partial<editor.IStandaloneEditorConstructionOptions>; // customize editor's initialization options
  onChange?: onMonacoContentChangeCallback;
  onError?: onMonacoErrorCallback; // provide syntax validation errors, etc.
  onDidLayoutChange?(info: editor.EditorLayoutInfo): void;
  onDidContentSizeChange?(evt: editor.IContentSizeChangedEvent): void;
}

// `props.onChange` called via editor's api value changes / user input, but when `props.value` changes
export interface onMonacoContentChangeCallback {
  (value: string, data: {
    model: editor.ITextModel, // current model
    event: editor.IModelContentChangedEvent;
  }): void;
}

export interface onMonacoErrorCallback {
  (error: string): void; // TODO: provide validation or some another occurred error
}

export const defaultEditorProps: Partial<MonacoEditorProps> = {
  language: "yaml",
  get theme(): MonacoEditorProps["theme"] {
    // theme for monaco-editor defined in `src/renderer/themes/lens-*.json`
    return ThemeStore.getInstance().activeTheme.monacoTheme;
  }
};

@observer
export class MonacoEditor extends React.Component<MonacoEditorProps> {
  static defaultProps = defaultEditorProps as object;
  static viewStates = new WeakMap<editor.ITextModel, editor.ICodeEditorViewState>();

  public staticId = `editor-id#${Math.round(1e7 * Math.random())}`;
  public dispose = disposer();

  @observable.ref containerElem: HTMLElement;
  @observable.ref editor: editor.IStandaloneCodeEditor;
  @observable dimensions: { width?: number, height?: number } = {};
  @observable unmounting = false;
  validationErrors = observable.array<string>();

  constructor(props: MonacoEditorProps) {
    super(props);
    makeObservable(this);
  }

  @computed get options(): editor.IStandaloneEditorConstructionOptions {
    return toJS({
      ...UserStore.getInstance().editorConfiguration,
      ...(this.props.options ?? {}),
    });
  }

  /**
   * Monitor editor's dom container element box-size and sync with monaco's dimensions
   * @private
   */
  private bindResizeObserver() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        this.setDimensions(width, height);
      }
    });

    const containerElem = this.editor.getContainerDomNode();

    resizeObserver.observe(containerElem);

    return () => resizeObserver.unobserve(containerElem);
  }

  onModelChange = (model: editor.ITextModel, oldModel?: editor.ITextModel) => {
    console.info("[MONACO]: model change", { model, oldModel });

    this.saveViewState(oldModel); // save current view-model state in the editor
    this.editor.setModel(model);
    this.editor.restoreViewState(this.getViewState(model)); // restore cursor position, selection, etc.
    this.editor.layout();
    this.editor.focus(); // keep focus in editor, e.g. when clicking between dock-tabs
  };

  @computed get editorId(): string {
    return this.props.id ?? this.staticId;
  }

  @computed get model(): editor.ITextModel {
    return this.getModelById(this.editorId);
  }

  componentDidMount() {
    try {
      this.createEditor();

      if (this.props.autoFocus) {
        this.editor.focus();
      }
      console.info(`[MONACO]: editor did mounted`);
    } catch (error) {
      console.error(`[MONACO]: mounting failed`, { error, editor, component: this });
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
    this.destroy();
  }

  private createEditor() {
    if (!this.containerElem || this.editor || this.unmounting) {
      return;
    }
    const { language, theme, readOnly, value: defaultValue } = this.props;

    this.editor = editor.create(this.containerElem, {
      model: this.model,
      value: defaultValue,
      language,
      theme,
      readOnly,
      ...this.options,
    });
    console.info(`[MONACO]: editor created for language=${language}, theme=${theme}`);

    const onDidLayoutChangeDisposer = this.editor.onDidLayoutChange(layoutInfo => {
      this.props.onDidLayoutChange?.(layoutInfo);
      // console.info("[MONACO]: onDidLayoutChange()", layoutInfo);
    });

    const onValueChangeDisposer = this.editor.onDidChangeModelContent(event => {
      const value = this.editor.getValue();
      // console.info("[MONACO]: value changed", { value, event });

      this.validateLazy(value);
      this.props.onChange?.(value, {
        model: this.model,
        event,
      });
    });

    const onContentSizeChangeDisposer = this.editor.onDidContentSizeChange((params) => {
      this.props.onDidContentSizeChange?.(params);
      // console.info("[MONACO]: onDidContentSizeChange():", params)
    });

    this.dispose.push(
      reaction(() => this.model, this.onModelChange),
      reaction(() => this.props.theme, editor.setTheme),
      reaction(() => this.props.value, value => this.setValue(value)),
      reaction(() => this.options, opts => this.editor.updateOptions(opts)),

      () => onDidLayoutChangeDisposer.dispose(),
      () => onValueChangeDisposer.dispose(),
      () => onContentSizeChangeDisposer.dispose(),
      this.bindResizeObserver(),
    );
  }

  destroy(): void {
    if (!this.editor) return;

    this.dispose();
    this.editor.dispose();
    this.editor = null;
  }

  @action
  setDimensions(width: number, height: number) {
    console.info(`[MONACO]: refreshing dimensions to width=${width} and height=${height}`);
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
    const model = editor.getModels().find(model => String(model.uri) === String(uri));

    if (model) {
      return model; // model with corresponding props.id exists
    }

    // creating new temporary model if not exists regarding to props.ID
    const { language, value } = this.props;

    return editor.createModel(value, language, uri);
  }

  setValue(value = ""): void {
    if (value == this.getValue()) return;

    this.editor.setValue(value);
    this.validateLazy(value);
  }

  getValue(opts?: { preserveBOM: boolean; lineEnding: string; }): string {
    return this.editor?.getValue(opts) ?? "";
  }

  // avoid excessive validations during typing
  validateLazy = debounce((value: string) => this.validate(value), 250);

  @action
  async validate(value: string = this.getValue()): Promise<void> {
    const { language } = this.props;
    const validators: MonacoValidator[] = [];
    const syntaxValidator: MonacoValidator = monacoValidators[language];

    if (syntaxValidator) {
      validators.push(syntaxValidator);
    }

    this.validationErrors.clear();

    for (const validate of validators) {
      try {
        await validate(value);
      } catch (error) {
        error = String(error);
        this.validationErrors.push(error);
        this.props.onError?.(error); // emit error outside via callback
      }
    }
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
