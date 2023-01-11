/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { InputHTMLAttributes } from "react";
import React from "react";

export interface FileInputSelection<T = string> {
  file: File;
  data?: T | any; // not available when readAsTexts={false}
  error?: string;
}

export interface FileInputProps extends InputHTMLAttributes<any> {
  id?: string; // could be used with <label htmlFor={id}/> to open filesystem dialog
  accept?: string; // allowed file types to select, e.g. "application/json"
  readAsText?: boolean; // provide files content as text in selection-callback
  multiple?: boolean;
  onSelectFiles(...selectedFiles: FileInputSelection[]): void;
}

export class FileInput extends React.Component<FileInputProps> {
  protected input: HTMLInputElement | null = null;

  protected style: React.CSSProperties = {
    position: "absolute",
    display: "none",
  };

  selectFiles = () => {
    this.input?.click(); // opens system dialog for selecting files
  };

  protected onChange = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(evt.target.files ?? []);

    if (!fileList.length) {
      return;
    }
    let selectedFiles: FileInputSelection[] = fileList.map(file => ({ file }));

    if (this.props.readAsText) {
      const readingFiles: Promise<FileInputSelection>[] = fileList.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            resolve({
              file,
              data: reader.result,
              error: reader.error ? String(reader.error) : undefined,
            });
          };
          reader.readAsText(file);
        });
      });

      selectedFiles = await Promise.all(readingFiles);
    }
    this.props.onSelectFiles(...selectedFiles);
  };

  render() {
    const { onSelectFiles, readAsText, ...props } = this.props;

    return (
      <input
        type="file"
        style={this.style}
        onChange={this.onChange}
        ref={e => this.input = e}
        {...props}
      />
    );
  }
}
