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

import styles from "./monaco-editor.module.css";
import React from "react";
import { observer } from "mobx-react";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { editor, Uri } from "monaco-editor";
import { MonacoTheme, MonacoValidator, monacoValidators } from "./index";
import { debounce, merge } from "lodash";
import { cssNames, disposer } from "../../utils";
import { UserStore } from "../../../common/user-store";
import { ThemeStore } from "../../theme.store";

export type MonacoEditorId = string;

export interface MonacoEditorProps {
  id?: MonacoEditorId; // associating editor's ID with created model.uri
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  readOnly?: boolean;
  theme?: MonacoTheme;
  language?: "yaml" | "json"; // supported list of languages, configure in `webpack.renderer.ts`
  options?: Partial<editor.IStandaloneEditorConstructionOptions>; // customize editor's initialization options
  value?: string;
  onChange?(value: string, evt: editor.IModelContentChangedEvent): void; // catch latest value updates
  onError?(error?: Error | unknown): void; // provide syntax validation error, etc.
  onDidLayoutChange?(info: editor.EditorLayoutInfo): void;
  onDidContentSizeChange?(evt: editor.IContentSizeChangedEvent): void;
  onModelChange?(model: editor.ITextModel, prev?: editor.ITextModel): void;
}

export const defaultEditorProps: Partial<MonacoEditorProps> = {
  language: "yaml",
  get theme(): MonacoTheme {
    // theme for monaco-editor defined in `src/renderer/themes/lens-*.json`
    return ThemeStore.getInstance().activeTheme.monacoTheme;
  },
};

@observer
export class MonacoEditor extends React.Component<MonacoEditorProps> {
  static defaultProps = defaultEditorProps as object;
  static viewStates = new WeakMap<Uri, editor.ICodeEditorViewState>();

  static createUri(id: MonacoEditorId): Uri {
    return Uri.file(`/monaco-editor/${id}`);
  }

  public staticId = `editor-id#${Math.round(1e7 * Math.random())}`;
  public dispose = disposer();

  // TODO: investigate how to replace with "common/logger"
  //  currently leads for stucking UI forever & infinite loop.
  //  e.g. happens on tab change/create, maybe some other cases too.
  logger = console;

  @observable.ref containerElem: HTMLElement;
  @observable.ref editor: editor.IStandaloneCodeEditor;
  @observable dimensions: { width?: number, height?: number } = {};
  @observable unmounting = false;

  constructor(props: MonacoEditorProps) {
    super(props);
    makeObservable(this);
  }

  @computed get id() {
    return this.props.id ?? this.staticId;
  }

  @computed get model(): editor.ITextModel {
    const uri = MonacoEditor.createUri(this.id);
    const model = editor.getModel(uri);

    if (model) {
      return model; // already exists
    }

    const { language, value } = this.props;

    return editor.createModel(value, language, uri);
  }

  @computed get options(): editor.IStandaloneEditorConstructionOptions {
    return merge({},
      UserStore.getInstance().editorConfiguration,
      this.props.options,
    );
  }

  @computed get logMetadata() {
    return {
      editorId: this.id,
      model: this.model,
    };
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
    this.logger?.info("[MONACO]: model change", { model, oldModel }, this.logMetadata);

    if (oldModel) {
      this.saveViewState(oldModel);
    }

    this.editor.setModel(model);
    this.restoreViewState(model);
    this.editor.layout();
    this.editor.focus(); // keep focus in editor, e.g. when clicking between dock-tabs
    this.props.onModelChange?.(model, oldModel);
    this.validateLazy();
  };

  /**
   * Save current view-model state in the editor.
   * This will allow restore cursor position, selected text, etc.
   * @param {editor.ITextModel} model
   */
  private saveViewState(model: editor.ITextModel) {
    MonacoEditor.viewStates.set(model.uri, this.editor.saveViewState());
  }

  private restoreViewState(model: editor.ITextModel) {
    const viewState = MonacoEditor.viewStates.get(model.uri);

    if (viewState) {
      this.editor.restoreViewState(viewState);
    }
  }

  componentDidMount() {
    try {
      this.createEditor();
      this.logger?.info(`[MONACO]: editor did mount`, this.logMetadata);
    } catch (error) {
      this.logger?.error(`[MONACO]: mounting failed: ${error}`, this.logMetadata);
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
    this.saveViewState(this.model);
    this.destroy();
  }

  private createEditor() {
    if (!this.containerElem || this.editor || this.unmounting) {
      return;
    }
    const { language, theme, readOnly, value: defaultValue } = this.props;

    this.editor = editor.create(this.containerElem, {
      model: this.model,
      detectIndentation: false, // allow `option.tabSize` to use custom number of spaces for [Tab]
      value: defaultValue,
      language,
      theme,
      readOnly,
      ...this.options,
    });

    this.logger?.info(`[MONACO]: editor created for language=${language}, theme=${theme}`, this.logMetadata);
    this.validateLazy(); // validate initial value
    this.restoreViewState(this.model); // restore previous state if any

    if (this.props.autoFocus) {
      this.editor.focus();
    }

    const onDidLayoutChangeDisposer = this.editor.onDidLayoutChange(layoutInfo => {
      this.props.onDidLayoutChange?.(layoutInfo);
    });

    const onValueChangeDisposer = this.editor.onDidChangeModelContent(event => {
      const value = this.editor.getValue();

      this.props.onChange?.(value, event);
      this.validateLazy(value);
    });

    const onContentSizeChangeDisposer = this.editor.onDidContentSizeChange((params) => {
      this.props.onDidContentSizeChange?.(params);
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
    this.dimensions.width = width;
    this.dimensions.height = height;
    this.editor?.layout({ width, height });
  }

  setValue(value = ""): void {
    if (value == this.getValue()) return;

    this.editor.setValue(value);
    this.validate(value);
  }

  getValue(opts?: { preserveBOM: boolean; lineEnding: string; }): string {
    return this.editor?.getValue(opts) ?? "";
  }

  focus() {
    this.editor?.focus();
  }

  @action
  validate = (value = this.getValue()) => {
    const validators: MonacoValidator[] = [
      monacoValidators[this.props.language], // parsing syntax check
    ].filter(Boolean);

    for (const validate of validators) {
      try {
        validate(value);
      } catch (error) {
        this.props.onError?.(error); // emit error outside
      }
    }
  };

  // avoid excessive validations during typing
  validateLazy = debounce(this.validate, 250);

  bindRef = (elem: HTMLElement) => this.containerElem = elem;

  render() {
    const { className, style } = this.props;

    return (
      <div
        data-test-component="monaco-editor"
        className={cssNames(styles.MonacoEditor, className)}
        style={style}
        ref={this.bindRef}
      />
    );
  }
}
