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

import React, { InputHTMLAttributes } from "react";

export interface FileInputSelection<T = string> {
  file: File;
  data?: T | any; // not available when readAsTexts={false}
  error?: string;
}

interface Props extends InputHTMLAttributes<any> {
  id?: string; // could be used with <label htmlFor={id}/> to open filesystem dialog
  accept?: string; // allowed file types to select, e.g. "application/json"
  readAsText?: boolean; // provide files content as text in selection-callback
  multiple?: boolean;
  onSelectFiles(...selectedFiles: FileInputSelection[]): void;
}

export class FileInput extends React.Component<Props> {
  protected input: HTMLInputElement;

  protected style: React.CSSProperties = {
    position: "absolute",
    display: "none",
  };

  selectFiles = () => {
    this.input.click(); // opens system dialog for selecting files
  };

  protected onChange = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(evt.target.files);

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
              error: reader.error ? String(reader.error) : null,
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
