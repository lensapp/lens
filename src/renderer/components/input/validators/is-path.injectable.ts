/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AsyncInputValidationError, inputValidator } from "../input_validators";
import pathExistsInjectable from "../../../../common/fs/path-exists.injectable";

const isPathInjectable = getInjectable({
  id: "is-path",

  instantiate: (di) => {
    const pathExists = di.inject(pathExistsInjectable);

    return inputValidator<true>({
      debounce: 100,
      condition: ({ type }) => type === "text",

      validate: async (value) => {
        try {
          await pathExists(value);
        } catch {
          throw new AsyncInputValidationError(
            `${value} is not a valid file path`,
          );
        }
      },
    });
  },
});

export default isPathInjectable;
