/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getAbsolutePathInjectable from "./get-absolute-path.injectable";
import resolveTildeInjectable from "./resolve-tilde.injectable";

export type ResolvePath = (path: string) => string;

const resolvePathInjectable = getInjectable({
  id: "resolve-path",
  instantiate: (di): ResolvePath => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const resolveTilde = di.inject(resolveTildeInjectable);

    return (filePath) => getAbsolutePath(resolveTilde(filePath));
  },
});

export default resolvePathInjectable;
