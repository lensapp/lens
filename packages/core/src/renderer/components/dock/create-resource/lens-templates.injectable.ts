/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RawTemplates } from "./create-resource-templates.injectable";
import parsePathInjectable from "../../../../common/path/parse.injectable";

const templatesContext = require.context("@k8slens/resource-templates/templates", true, /^\.\/.*\.(yaml|yml)$/);

const lensCreateResourceTemplatesInjectable = getInjectable({
  id: "lens-create-resource-templates",

  instantiate: (di): RawTemplates => {
    const parsePath = di.inject(parsePathInjectable);

    return {
      label: "lens",
      options: templatesContext.keys()
        .map((key) => ({
          label: parsePath(key).name,
          value: templatesContext(key) as string,
        })),
    };
  },
});

export default lensCreateResourceTemplatesInjectable;
