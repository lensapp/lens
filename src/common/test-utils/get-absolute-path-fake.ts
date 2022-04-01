/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { GetAbsolutePath } from "../path/get-absolute-path.injectable";

export const getAbsolutePathFake: GetAbsolutePath = (...args) => {
  const maybeAbsolutePath = args.join("/");

  if (isAbsolutePath(maybeAbsolutePath)) {
    return maybeAbsolutePath;
  }

  return `/some-absolute-root-directory/${maybeAbsolutePath}`;
};

const isAbsolutePath = (path: string) => path.startsWith("/");
