/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export type StatusBarStatus = "default" | "warning" | "error";

const statusBarCurrentStatusInjectable = getInjectable({
  id: "status-bar-current-status",
  instantiate: () => observable.box<StatusBarStatus>("default"),
});

export default statusBarCurrentStatusInjectable;
