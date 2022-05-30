/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
 import { getInjectable } from "@ogre-tools/injectable";
 
 const sessionStorageInjectable = getInjectable({
   id: "session-storage",
   instantiate: () => window.sessionStorage,
 });
 
 export default sessionStorageInjectable;