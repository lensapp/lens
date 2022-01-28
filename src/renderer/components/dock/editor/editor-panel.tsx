/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import throttle from "lodash/throttle";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useRef } from "react";
import { cssNames, disposer } from "../../../utils";
import { MonacoEditor, MonacoEditorProps } from "../../monaco-editor";
import type { DockStore, TabId } from "../dock/store";
import dockStoreInjectable from "../dock/store.injectable";
import styles from "./editor-panel.module.scss";

export interface EditorPanelProps {
  tabId: TabId;
  value: string;
  className?: string;
  /**
   * If `true` then the editor will be focused on mounting
   *
   * @default true
   */
  autoFocus?: boolean;
  onChange: MonacoEditorProps["onChange"];
  onError?: MonacoEditorProps["onError"];
}

interface Dependencies {
  dockStore: DockStore;
}

const NonInjectedEditorPanel = observer(({
  dockStore,
  tabId,
  value,
  onChange,
  onError,
  autoFocus = true,
  className,
}: Dependencies & EditorPanelProps) => {
  const editor = useRef<React.ElementRef<typeof MonacoEditor>>();

  useEffect(() => disposer(
    // keep focus on editor's area when <Dock/> just opened
    reaction(
      () => dockStore.isOpen,
      isOpen => {
        if (isOpen) {
          editor.current?.focus();
        }
      },
      {
        fireImmediately: true,
      },
    ),

    // focus to editor on dock's resize or turning into fullscreen mode
    dockStore.onResize(throttle(() => editor.current?.focus(), 250)),
  ), []);

  if (!tabId) {
    return null;
  }

  return (
    <MonacoEditor
      autoFocus={autoFocus}
      id={tabId}
      value={value}
      className={cssNames(styles.EditorPanel, className)}
      onChange={onChange}
      onError={onError}
      ref={editor}
    />
  );
});

export const EditorPanel = withInjectables<Dependencies, EditorPanelProps>(NonInjectedEditorPanel, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    ...props,
  }),
});
