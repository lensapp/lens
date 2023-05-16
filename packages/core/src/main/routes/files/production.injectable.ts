/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import readFileBufferInjectable from "../../../common/fs/read-file-buffer.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import staticFilesDirectoryInjectable from "../../../common/vars/static-files-directory.injectable";
import type { LensApiRequest } from "../../router/route";
import path from "path";
import { contentTypes } from "../../router/router-content-types";
import { prefixedLoggerInjectable } from "@k8slens/logger";

const prodStaticFileRouteHandlerInjectable = getInjectable({
  id: "prod-static-file-route-handler",
  instantiate: (di) => {
    const readFileBuffer = di.inject(readFileBufferInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);
    const logger = di.inject(prefixedLoggerInjectable, "FILE-ROUTE");

    return async ({ params }: LensApiRequest<"/{path*}">) => {
      const filePath = (!params.path || params.path === "/")
        ? "/build/index.html"
        : path.posix.extname(params.path)
          ? params.path
          : "/build/index.html";

      const assetFilePath = joinPaths(staticFilesDirectory, filePath);

      if (!assetFilePath.startsWith(staticFilesDirectory)) {
        return { statusCode: 404 };
      }

      const fileExtension = path.extname(assetFilePath).slice(1);
      const contentType = contentTypes[fileExtension] || contentTypes.txt;

      try {
        return { response: await readFileBuffer(assetFilePath), contentType };
      } catch (err) {
        logger.error(`failed to find file "${filePath}"`, err);

        return { statusCode: 404 };
      }
    };
  },
});

export default prodStaticFileRouteHandlerInjectable;
