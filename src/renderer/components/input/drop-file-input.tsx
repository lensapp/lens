/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drop-file-input.scss";
import React from "react";
import type { IClassName } from "../../utils";
import { autoBind, cssNames } from "../../utils";
import { observable, makeObservable } from "mobx";
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
  dragCounter = 0; // Counter preventing firing onDragLeave() too early (https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element)

  constructor(props: DropFileInputProps) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  onDragEnter() {
    this.dragCounter++;
    this.dropAreaActive = true;
  }

  onDragLeave() {
    this.dragCounter--;

    if (this.dragCounter == 0) {
      this.dropAreaActive = false;
    }
  }

  onDragOver(evt: React.DragEvent<T>) {
    if (this.props.onDragOver) {
      this.props.onDragOver(evt);
    }
    evt.preventDefault(); // enable onDrop()-callback
    evt.dataTransfer.dropEffect = "move";
  }

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
