/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "@k8slens/test-utils";
import staticFilesDirectoryInjectable from "./static-files-directory.injectable";

export default getGlobalOverride(staticFilesDirectoryInjectable, () => "/some-static-directory");
