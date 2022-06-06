/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelHandlerInjectable } from "../../common/utils/channel/request-channel-listener-injection-token";
import appPathsChannelInjectable from "../../common/app-paths/app-paths-channel.injectable";
import appPathsInjectable from "../../common/app-paths/app-paths.injectable";

const appPathsRequestChannelHandlerInjectable = getRequestChannelHandlerInjectable(appPathsChannelInjectable, (di) => {
  const appPaths = di.inject(appPathsInjectable);

  return () => appPaths;
});

export default appPathsRequestChannelHandlerInjectable;
