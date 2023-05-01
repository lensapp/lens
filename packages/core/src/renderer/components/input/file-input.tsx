/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { InputHTMLAttributes } from "react";
import React, { useRef } from "react";

export interface FileInputSelection<ReadAsText extends boolean> {
  file: File;
  data: ReadAsText extends true ? string : undefined;
  error?: string;
}

export type OnSelectFiles<ReadAsText extends boolean> = (...selectedFiles: FileInputSelection<ReadAsText>[]) => void;

export type FileInputProps<ReadAsText extends boolean> = InputHTMLAttributes<HTMLInputElement> & {
  onSelectFiles: OnSelectFiles<ReadAsText>;
} & (
  ReadAsText extends true
    ? {
      readAsText: true;
    }
    : {
      readAsText?: false;
    }
);

export function FileInput<ReadAsText extends boolean>(props: FileInputProps<ReadAsText>) {
  const {
    readAsText = false,
    onSelectFiles,
    ...inputProps
  } = props;

  const input = useRef<HTMLInputElement | null>(null);
  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(evt.target.files ?? []);

    if (!fileList.length) {
      return;
    }

    if (readAsText === false) {
      const onSelect = onSelectFiles as OnSelectFiles<false>;

      onSelect(...fileList.map(file => ({
        file,
        data: undefined,
      })));

      return;
    }

    void (async () => {
      const onSelect = onSelectFiles as OnSelectFiles<true>;

      onSelect(...await Promise.all(fileList.map(file => new Promise<FileInputSelection<true>>((resolve) => {
        const reader = new FileReader();

        reader.addEventListener("loadend", () => resolve({
          file,
          data: reader.result as string,
          error: reader.error ? String(reader.error) : undefined,
        }), {
          once: true,
        });

        reader.readAsText(file);
      }))));
    })();
  };

  return (
    <input
      type="file"
      style={{
        position: "absolute",
        display: "none",
      }}
      onChange={onChange}
      ref={input}
      {...inputProps}
    />
  );
}
