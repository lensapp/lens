/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncInputValidator } from "../input_validators";
import pathExistsInjectable from "../../../../common/fs/path-exists.injectable";

const isPathInjectable = getInjectable({
  id: "is-path",

  instantiate: (di) => {
    const pathExists = di.inject(pathExistsInjectable);

    return asyncInputValidator({
      debounce: 100,
      condition: ({ type }) => type === "text",
      validate: async value => {
        if (!await pathExists(value)) {
          throw new Error(`"${value}" is not a valid file path`);
        }
      },
    });
  },
});

export default isPathInjectable;
