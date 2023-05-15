/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InputValidator } from "../../../../../../../renderer/components/input";
import { Input } from "../../../../../../../renderer/components/input";
import { Icon } from "@k8slens/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { RequestFilePaths } from "./get-file-paths.injectable";
import requestFilePathsInjectable from "./get-file-paths.injectable";
import isPathInjectable from "../../../../../../../renderer/components/input/validators/is-path.injectable";

interface HelmFileInputProps {
  placeholder: string;
  fileExtensions: string[];
  value: string;
  setValue: (value: string) => void;
  "data-testid"?: string;
}

interface Dependencies {
  requestFilePaths: RequestFilePaths;
  isPath: InputValidator<true>;
}

const NonInjectedHelmFileInput = ({
  placeholder,
  value,
  setValue,
  fileExtensions,
  requestFilePaths,
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
      onClick={() => void requestFilePaths({
        filter: {
          name: placeholder,
          extensions: fileExtensions,
        },
        onPick: (filePaths) => {
          if (filePaths.length) {
            setValue(filePaths[0]);
          }
        },
      })}
      tooltip="Browse"
    />
  </div>
);

export const HelmFileInput = withInjectables<Dependencies, HelmFileInputProps>(NonInjectedHelmFileInput, {
  getProps: (di, props) => ({
    ...props,
    requestFilePaths: di.inject(requestFilePathsInjectable),
    isPath: di.inject(isPathInjectable),
  }),
});
