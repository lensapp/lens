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
    const { disabled, className } = this.props;
    const { onDragEnter, onDragLeave, onDragOver, onDrop } = this;
    try {
      const contentElem = React.Children.only(this.props.children) as React.ReactElement<React.HTMLProps<HTMLElement>>;
      const isValidContentElem = React.isValidElement(contentElem);
      if (!disabled && isValidContentElem) {
        const contentElemProps: React.HTMLProps<HTMLElement> = {
          className: cssNames("DropFileInput", className, {
            droppable: this.dropAreaActive,
          }),
          onDragEnter,
          onDragLeave,
          onDragOver,
          onDrop,
        };
        return React.cloneElement(contentElem, contentElemProps);
      }
    } catch (err) {
      logger.error("Invalid root content-element for DropFileInput", { err: String(err) });
      return this.props.children;
    }
  }
}
