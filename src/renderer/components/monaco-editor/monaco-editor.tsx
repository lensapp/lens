/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./monaco-editor.module.scss";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { observer } from "mobx-react";
import { action, IComputedValue, reaction } from "mobx";
import { editor, Uri } from "monaco-editor";
import type { MonacoTheme } from "./monaco-themes";
import { MonacoValidator, monacoValidators } from "./monaco-validators";
import { debounce, merge } from "lodash";
import { cssNames, disposer } from "../../utils";
import type { UserPreferencesStore } from "../../../common/user-preferences";
import type { Theme } from "../../themes/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeThemeInjectable from "../../themes/active-theme.injectable";
import userPreferencesStoreInjectable from "../../../common/user-preferences/store.injectable";
import type { LensLogger } from "../../../common/logger";

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
interface Dependencies {
  readonly activeTheme: IComputedValue<Theme>;
  readonly userStore: UserPreferencesStore;
  readonly logger: LensLogger;
}

function createUri(id: MonacoEditorId): Uri {
  return Uri.file(`/monaco-editor/${id}`);
}

const viewStates = new WeakMap<Uri, editor.ICodeEditorViewState>();

export interface MonacoEditorRef {
  focus: () => void;
}

const NonInjectedMonacoEditor = observer(forwardRef<MonacoEditorRef, Dependencies & MonacoEditorProps>(({
  language = "yaml",
  activeTheme,
  userStore,
  id: propsId,
  className,
  style,
  autoFocus,
  readOnly,
  theme = activeTheme.get().monacoTheme,
  options: propsOptions,
  value: defaultValue,
  onChange,
  onError,
  onDidLayoutChange,
  onDidContentSizeChange,
  onModelChange: propsOnModelChange,
  logger,
}, ref) => {
  const [staticId] = useState(`editor-id#${Math.round(1e7 * Math.random())}`);
  const containerElem = useRef<HTMLDivElement>();
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor | undefined>();
  const [unmounting, setUnmounting] = useState(false);
  const [dispose] = useState(() => disposer());

  const id = propsId ?? staticId;
  const uri = createUri(id);
  const model = editor.getModel(uri) ?? editor.createModel(defaultValue, language, uri);
  const options = merge(
    {},
    userStore.editorConfiguration,
    propsOptions,
  );
  const logMetadata = { editorId: id, model };

  const validate = action((value = getValue()) => {
    const validators: MonacoValidator[] = [
      monacoValidators[language], // parsing syntax check
    ].filter(Boolean);

    for (const validate of validators) {
      try {
        validate(value);
      } catch (error) {
        onError?.(error); // emit error outside
      }
    }
  });

  const [validateLazy] = useState(() => debounce(validate, 250));

  /**
   * Monitor editor's dom container element box-size and sync with monaco's dimensions
   */
  const bindResizeObserver = () => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        setDimensions(width, height);
      }
    });

    const containerElem = editorRef.getContainerDomNode();

    resizeObserver.observe(containerElem);

    return () => resizeObserver.unobserve(containerElem);
  };

  const onModelChange = (model: editor.ITextModel, oldModel?: editor.ITextModel) => {
    logger?.info("[MONACO]: model change", { model, oldModel }, logMetadata);

    if (oldModel) {
      saveViewState(oldModel);
    }

    editorRef.setModel(model);
    restoreViewState(model);
    editorRef.layout();
    editorRef.focus(); // keep focus in editor, e.g. when clicking between dock-tabs
    propsOnModelChange?.(model, oldModel);
    validateLazy();
  };

  /**
   * Save current view-model state in the editor.
   * This will allow restore cursor position, selected text, etc.
   * @param {editor.ITextModel} model
   */
  const saveViewState = (model: editor.ITextModel) => {
    viewStates.set(model.uri, editorRef.saveViewState());
  };

  const restoreViewState = (model: editor.ITextModel) => {
    const viewState = viewStates.get(model.uri);

    if (viewState) {
      editorRef.restoreViewState(viewState);
    }
  };

  const createEditor = () => {
    if (!containerElem.current || editorRef || unmounting) {
      return;
    }

    const _editor = editor.create(containerElem.current, {
      model,
      detectIndentation: false, // allow `option.tabSize` to use custom number of spaces for [Tab]
      value: defaultValue,
      language,
      theme,
      readOnly,
      ...options,
    });

    setEditorRef(_editor);

    logger?.info(`[MONACO]: editor created for language=${language}, theme=${theme}`, logMetadata);
    validateLazy(); // validate initial value
    restoreViewState(model); // restore previous state if any

    if (autoFocus) {
      editorRef.focus();
    }

    const onDidLayoutChangeDisposer = editorRef.onDidLayoutChange(layoutInfo => {
      onDidLayoutChange?.(layoutInfo);
    });

    const onValueChangeDisposer = editorRef.onDidChangeModelContent(event => {
      const value = editorRef.getValue();

      onChange?.(value, event);
      validateLazy(value);
    });

    const onContentSizeChangeDisposer = editorRef.onDidContentSizeChange((params) => {
      onDidContentSizeChange?.(params);
    });

    dispose.push(
      reaction(() => model, onModelChange),
      reaction(() => theme, editor.setTheme),
      reaction(() => defaultValue, value => setValue(value)),
      reaction(() => options, opts => editorRef.updateOptions(opts)),

      () => onDidLayoutChangeDisposer.dispose(),
      () => onValueChangeDisposer.dispose(),
      () => onContentSizeChangeDisposer.dispose(),
      bindResizeObserver(),
    );
  };

  const destroy = () => {
    if (!editorRef) return;

    dispose();
    editorRef.dispose();
    setEditorRef(undefined);
  };

  const setDimensions = (width: number, height: number) => {
    editorRef?.layout({ width, height });
  };

  const setValue = (value = "") => {
    if (value == getValue()) return;

    editorRef.setValue(value);
    validate(value);
  };

  const getValue = (opts?: { preserveBOM: boolean; lineEnding: string; }) => {
    return editorRef?.getValue(opts) ?? "";
  };

  const focus = () => {
    editorRef?.focus();
  };

  useImperativeHandle(ref, () => ({
    focus,
  }));

  useEffect(() => {
    try {
      createEditor();
      logger?.info(`[MONACO]: editor did mount`, logMetadata);
    } catch (error) {
      logger?.error(`[MONACO]: mounting failed: ${error}`, logMetadata);
    }

    return () => {
      setUnmounting(true);
      saveViewState(model);
      destroy();
    };
  }, []);

  return (
    <div
      data-test-component="monaco-editor"
      className={cssNames(styles.MonacoEditor, className)}
      style={style}
      ref={containerElem}
    />
  );
}));

export const MonacoEditor = withInjectables<Dependencies, MonacoEditorProps>(NonInjectedMonacoEditor, {
  getProps: (di, props) => ({
    activeTheme: di.inject(activeThemeInjectable),
    userStore: di.inject(userPreferencesStoreInjectable),
    logger: {
      ...console,
      silly: console.debug,
    },
    ...props,
  }),
});
