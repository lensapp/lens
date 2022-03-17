/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./editor-panel.module.scss";
import throttle from "lodash/throttle";
import React from "react";
import { makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { DockStore, TabId } from "./dock/store";
import { cssNames } from "../../utils";
import type { MonacoEditorProps } from "../monaco-editor";
import { MonacoEditor } from "../monaco-editor";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "./dock/store.injectable";

export interface EditorPanelProps {
  tabId: TabId;
  value: string;
  className?: string;
  autoFocus?: boolean; // default: true
  onChange: MonacoEditorProps["onChange"];
  onError?: MonacoEditorProps["onError"];
}

interface Dependencies {
  dockStore: DockStore;
}

const defaultProps: Partial<EditorPanelProps> = {
  autoFocus: true,
};

@observer
class NonInjectedEditorPanel extends React.Component<EditorPanelProps & Dependencies> {
  static defaultProps = defaultProps as object;

  @observable.ref editor: MonacoEditor | null = null;

  constructor(props: EditorPanelProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      // keep focus on editor's area when <Dock/> just opened
      reaction(() => this.props.dockStore.isOpen, isOpen => isOpen && this.editor?.focus(), {
        fireImmediately: true,
      }),

      // focus to editor on dock's resize or turning into fullscreen mode
      this.props.dockStore.onResize(throttle(() => this.editor?.focus(), 250)),
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

export const EditorPanel = withInjectables<Dependencies, EditorPanelProps>(
  NonInjectedEditorPanel,

  {
    getProps: (di, props) => ({
      dockStore: di.inject(dockStoreInjectable),
      ...props,
    }),
  },
);
