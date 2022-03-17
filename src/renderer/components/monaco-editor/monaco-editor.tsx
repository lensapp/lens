/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./monaco-editor.module.scss";
import React from "react";
import { observer } from "mobx-react";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { editor, Uri } from "monaco-editor";
import type { MonacoTheme } from "./monaco-themes";
import { type MonacoValidator, monacoValidators } from "./monaco-validators";
import { debounce, merge } from "lodash";
import { autoBind, cssNames, disposer } from "../../utils";
import { UserStore } from "../../../common/user-store";
import { ThemeStore } from "../../theme.store";
import logger from "../../../main/logger";

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
  value: string;
  onChange?(value: string, evt: editor.IModelContentChangedEvent): void; // catch latest value updates
  onError?(error: unknown): void; // provide syntax validation error, etc.
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
  static readonly defaultProps = defaultEditorProps as object;
  static readonly viewStates = new WeakMap<Uri, editor.ICodeEditorViewState>();

  static createUri(id: MonacoEditorId): Uri {
    return Uri.file(`/monaco-editor/${id}`);
  }

  private staticId = `editor-id#${Math.round(1e7 * Math.random())}`;
  private dispose = disposer();

  @observable.ref containerElem: HTMLDivElement | null = null;
  @observable.ref editor!: editor.IStandaloneCodeEditor;
  @observable readonly dimensions: { width?: number; height?: number } = {};
  @observable unmounting = false;

  constructor(props: MonacoEditorProps) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  @computed get id(): MonacoEditorId {
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

  @computed
  private get logMetadata() {
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

  protected onModelChange(model: editor.ITextModel, oldModel?: editor.ITextModel) {
    logger.info("[MONACO]: model change", { model, oldModel }, this.logMetadata);

    if (oldModel) {
      this.saveViewState(oldModel);
    }

    this.editor.setModel(model);
    this.restoreViewState(model);
    this.editor.layout();
    this.editor.focus(); // keep focus in editor, e.g. when clicking between dock-tabs
    this.props.onModelChange?.(model, oldModel);
    this.validateLazy();
  }

  /**
   * Save current view-model state in the editor.
   * This will allow restore cursor position, selected text, etc.
   */
  protected saveViewState(model: editor.ITextModel) {
    const viewState = this.editor?.saveViewState();

    if (viewState) {
      MonacoEditor.viewStates.set(model.uri, viewState);
    }
  }

  protected restoreViewState(model: editor.ITextModel) {
    const viewState = MonacoEditor.viewStates.get(model.uri);

    if (viewState) {
      this.editor?.restoreViewState(viewState);
    }
  }

  componentDidMount() {
    try {
      this.createEditor();
      logger.info(`[MONACO]: editor did mount`, this.logMetadata);
    } catch (error) {
      logger.error(`[MONACO]: mounting failed: ${error}`, this.logMetadata);
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
    this.saveViewState(this.model);

    if (this.editor) {
      this.dispose();
      this.editor.dispose();
    }

  }

  protected createEditor() {
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

    logger.info(`[MONACO]: editor created for language=${language}, theme=${theme}`, this.logMetadata);
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
      reaction(() => this.props.theme, theme => {
        if (theme) {
          editor.setTheme(theme);
        }
      }),
      reaction(() => this.props.value, value => this.setValue(value)),
      reaction(() => this.options, opts => this.editor.updateOptions(opts)),

      () => onDidLayoutChangeDisposer.dispose(),
      () => onValueChangeDisposer.dispose(),
      () => onContentSizeChangeDisposer.dispose(),
      this.bindResizeObserver(),
    );
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

  getValue(opts?: { preserveBOM: boolean; lineEnding: string }): string {
    return this.editor?.getValue(opts) ?? "";
  }

  focus() {
    this.editor?.focus();
  }

  @action
  validate(value = this.getValue()) {
    const validators: MonacoValidator[] = [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      monacoValidators[this.props.language!], // parsing syntax check
    ].filter(Boolean);

    for (const validate of validators) {
      try {
        validate(value);
      } catch (error) {
        this.props.onError?.(error); // emit error outside
      }
    }
  }

  // avoid excessive validations during typing
  validateLazy = debounce(this.validate, 250);

  render() {
    const { className, style } = this.props;

    return (
      <div
        data-test-id="monaco-editor"
        className={cssNames(styles.MonacoEditor, className)}
        style={style}
        ref={elem => this.containerElem = elem}
      />
    );
  }
}
