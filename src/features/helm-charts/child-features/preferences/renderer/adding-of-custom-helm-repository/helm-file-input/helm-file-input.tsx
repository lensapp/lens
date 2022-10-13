/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InputValidator } from "../../../../../../../renderer/components/input";
import { Input } from "../../../../../../../renderer/components/input";
import { Icon } from "../../../../../../../renderer/components/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import getFilePathsInjectable from "./get-file-paths.injectable";
import type { FileFilter } from "electron";
import isPathInjectable from "../../../../../../../renderer/components/input/validators/is-path.injectable";

interface HelmFileInputProps {
  placeholder: string;
  fileExtensions: string[];
  value: string;
  setValue: (value: string) => void;
  "data-testid"?: string;
}

interface Dependencies {
  getFilePaths: (fileFilter: FileFilter) => Promise<{ canceled: boolean; filePaths: string[] }>;
  isPath: InputValidator<true>;
}

const NonInjectedHelmFileInput = ({
  placeholder,
  value,
  setValue,
  fileExtensions,
  getFilePaths,
  isPath,
  "data-testid": testId,
}: Dependencies & HelmFileInputProps) => (
  <div className="flex gaps align-center">
    <Input
      placeholder={placeholder}
      validators={isPath}
      className="box grow"
      value={value}
      onChange={(v) => setValue(v)}
      data-testid={testId}
    />
    <Icon
      material="folder"

      onClick={async () => {
        const { canceled, filePaths } = await getFilePaths({
          name: placeholder,
          extensions: fileExtensions,
        });

        if (!canceled && filePaths.length) {
          setValue(filePaths[0]);
        }
      }}

      tooltip="Browse"
    />
  </div>
);

export const HelmFileInput = withInjectables<Dependencies, HelmFileInputProps>(
  NonInjectedHelmFileInput,

  {
    getProps: (di, props) => ({
      getFilePaths: di.inject(getFilePathsInjectable),
      isPath: di.inject(isPathInjectable),
      ...props,
    }),
  },
);
