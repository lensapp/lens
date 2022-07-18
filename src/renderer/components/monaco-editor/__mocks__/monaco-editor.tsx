/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { editor } from "monaco-editor";
import React from "react";
import type { MonacoEditorProps, MonacoEditorRef } from "../monaco-editor";
import { monacoValidators } from "../monaco-validators";

class FakeMonacoEditor extends React.Component<MonacoEditorProps> {
  render() {
    const { id, value, onChange, onError, language = "yaml" } = this.props;

    return (
      <input
        data-testid={`monaco-editor-for-${id}`}

        onChange={(event) => {
          const newValue = event.target.value;

          onChange?.(
            newValue,
            {} as editor.IModelContentChangedEvent,
          );

          const validator = monacoValidators[language];

          try {
            validator(newValue);
          } catch(e) {
            onError?.(e);
          }
        }}
        value={value}
      />
    );
  }
}

export const MonacoEditor = React.forwardRef<
  MonacoEditorRef,
  MonacoEditorProps
>((props, ref) => <FakeMonacoEditor innerRef={ref} {...props} />);
