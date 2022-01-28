/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./file-picker.scss";

import React from "react";
import fse from "fs-extra";
import path from "path";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import _ from "lodash";

export interface FileUploadProps {
    uploadDir: string;
    rename?: boolean;
    handler?(path: string[]): void;
}

export interface MemoryUseProps {
    handler?(file: File[]): void;
}

enum FileInputStatus {
  CLEAR = "clear",
  PROCESSING = "processing",
  ERROR = "error",
}

export enum OverLimitStyle {
  REJECT = "reject",
  CAP = "cap",
}

export enum OverSizeLimitStyle {
  REJECT = "reject",
  FILTER = "filter",
}

export enum OverTotalSizeLimitStyle {
  REJECT = "reject",
  FILTER_LAST = "filter-last",
  FILTER_LARGEST = "filter-largest",
}

export interface BaseProps {
    accept?: string;
    label: React.ReactNode;
    multiple?: boolean;

    // limit is the optional maximum number of files to upload
    // the larger number is upper limit, the lower is lower limit
    // the lower limit is capped at 0 and the upper limit is capped at Infinity
    limit?: [number, number];

    // default is "Reject"
    onOverLimit?: OverLimitStyle;

    // individual files are checked before the total size.
    maxSize?: number;
    // default is "Reject"
    onOverSizeLimit?: OverSizeLimitStyle;

    maxTotalSize?: number;
    // default is "Reject"
    onOverTotalSizeLimit?: OverTotalSizeLimitStyle;
}

export type Props = BaseProps & (MemoryUseProps | FileUploadProps);

const defaultProps: Partial<Props> = {
  maxSize: Infinity,
  onOverSizeLimit: OverSizeLimitStyle.REJECT,
  maxTotalSize: Infinity,
  onOverLimit: OverLimitStyle.REJECT,
  onOverTotalSizeLimit: OverTotalSizeLimitStyle.REJECT,
};

@observer
export class FilePicker extends React.Component<Props> {
  static defaultProps = defaultProps as Object;

  @observable status = FileInputStatus.CLEAR;
  @observable errorText?: string;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  handleFileCount(files: File[]): File[] {
    const { limit: [minLimit, maxLimit] = [0, Infinity], onOverLimit } = this.props;

    if (files.length > maxLimit) {
      switch (onOverLimit) {
        case OverLimitStyle.CAP:
          files.length = maxLimit;
          break;
        case OverLimitStyle.REJECT:
          throw `Too many files. Expected at most ${maxLimit}. Got ${files.length}.`;
      }
    }

    if (files.length < minLimit) {
      throw `Too many files. Expected at most ${maxLimit}. Got ${files.length}.`;
    }

    return files;
  }

  handleIndividualFileSizes(files: File[]): File[] {
    const { onOverSizeLimit, maxSize } = this.props;

    switch (onOverSizeLimit) {
      case OverSizeLimitStyle.FILTER:
        return files.filter(file => file.size <= maxSize );

      case OverSizeLimitStyle.REJECT: {
        const firstFileToLarge = files.find(file => file.size > maxSize);

        if (firstFileToLarge) {
          throw `${firstFileToLarge.name} is too large. Maximum size is ${maxSize}. Has size of ${firstFileToLarge.size}`;
        }

        return files;
      }
    }
  }

  handleTotalFileSizes(files: File[]): File[] {
    const { maxTotalSize, onOverTotalSizeLimit } = this.props;

    const totalSize = _.sum(files.map(f => f.size));

    if (totalSize <= maxTotalSize) {
      return files;
    }

    switch (onOverTotalSizeLimit) {
      case OverTotalSizeLimitStyle.FILTER_LARGEST:
        files = _.orderBy(files, ["size"]);

        // fallthrough
      case OverTotalSizeLimitStyle.FILTER_LAST: {
        let newTotalSize = totalSize;

        for (;files.length > 0;) {
          newTotalSize -= files.pop().size;

          if (newTotalSize <= maxTotalSize) {
            break;
          }
        }

        return files;
      }
      case OverTotalSizeLimitStyle.REJECT:
        throw `Total file size to upload is too large. Expected at most ${maxTotalSize}. Found ${totalSize}.`;
    }
  }

  async handlePickFiles(selectedFiles: FileList) {
    const files: File[] = Array.from(selectedFiles);

    try {
      const numberLimitedFiles = this.handleFileCount(files);
      const sizeLimitedFiles = this.handleIndividualFileSizes(numberLimitedFiles);
      const totalSizeLimitedFiles = this.handleTotalFileSizes(sizeLimitedFiles);

      if ("uploadDir" in this.props) {
        const { uploadDir } = this.props;

        this.status = FileInputStatus.PROCESSING;

        const paths: string[] = [];
        const promises = totalSizeLimitedFiles.map(file => {
          const destinationPath = path.join(uploadDir, file.name);

          paths.push(destinationPath);

          return fse.copyFile(file.path, destinationPath);
        });

        await Promise.all(promises);
        this.props.handler(paths);
        this.status = FileInputStatus.CLEAR;
      } else {
        this.props.handler(totalSizeLimitedFiles);
      }
    } catch (errorText) {
      this.status = FileInputStatus.ERROR;
      this.errorText = errorText;

      return;
    }
  }

  render() {
    const { accept, label, multiple } = this.props;

    return <div className="FilePicker">
      <label className="flex gaps align-center" htmlFor="file-upload">{label} {this.getIconRight()}</label>
      <input
        id="file-upload"
        name="FilePicker"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => this.handlePickFiles(event.target.files)}
      />
    </div>;
  }

  getIconRight(): React.ReactNode {
    switch (this.status) {
      case FileInputStatus.PROCESSING:
        return <Spinner />;
      case FileInputStatus.ERROR:
        return <Icon material="error" tooltip={this.errorText} />;
      default:
        return null;
    }
  }
}
