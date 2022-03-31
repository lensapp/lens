/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { registerIpcListeners } from "./register-listeners";
import listNamespacesForbiddenHandlerInjectable from "./list-namespaces-forbidden-handler.injectable";

const registerIpcListenersInjectable = getInjectable({
  id: "register-ipc-listeners",

  instantiate: (di) => registerIpcListeners({
    listNamespacesForbiddenHandler: di.inject(listNamespacesForbiddenHandlerInjectable),
  }),
});

export default registerIpcListenersInjectable;
