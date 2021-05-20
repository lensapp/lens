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

import "./drop-file-input.scss";
import React from "react";
import { autobind, cssNames, IClassName } from "../../utils";
import { observable } from "mobx";
import { observer } from "mobx-react";
import logger from "../../../main/logger";

export interface DropFileInputProps extends React.DOMAttributes<any> {
  className?: IClassName;
  disabled?: boolean;
  onDropFiles(files: File[], meta: DropFileMeta): void;
}

export interface DropFileMeta<T extends HTMLElement = any> {
  evt: React.DragEvent<T>;
}

@observer
export class DropFileInput<T extends HTMLElement = any> extends React.Component<DropFileInputProps> {
  @observable dropAreaActive = false;

  @autobind()
  onDragEnter() {
    this.dropAreaActive = true;
  }

  @autobind()
  onDragLeave() {
    this.dropAreaActive = false;
  }

  @autobind()
  onDragOver(evt: React.DragEvent<T>) {
    if (this.props.onDragOver) {
      this.props.onDragOver(evt);
    }
    evt.preventDefault(); // enable onDrop()-callback
    evt.dataTransfer.dropEffect = "move";
  }

  @autobind()
  onDrop(evt: React.DragEvent<T>) {
    if (this.props.onDrop) {
      this.props.onDrop(evt);
    }
    this.dropAreaActive = false;
    const files = Array.from(evt.dataTransfer.files);

    if (files.length > 0) {
      this.props.onDropFiles(files, { evt });
    }
  }

  render() {
    const { onDragEnter, onDragLeave, onDragOver, onDrop } = this;
    const { disabled, className } = this.props;

    try {
      const contentElem = React.Children.only(this.props.children) as React.ReactElement<React.HTMLProps<HTMLElement>>;

      if (disabled) {
        return contentElem;
      }

      if (React.isValidElement(contentElem)) {
        const contentElemProps: React.HTMLProps<HTMLElement> = {
          className: cssNames("DropFileInput", contentElem.props.className, className, {
            droppable: this.dropAreaActive,
          }),
          onDragEnter,
          onDragLeave,
          onDragOver,
          onDrop,
        };

        return React.cloneElement(contentElem, contentElemProps);
      }

      return null;
    } catch (err) {
      logger.error(`Error: <DropFileInput/> must contain only single child element`);

      return this.props.children;
    }
  }
}
