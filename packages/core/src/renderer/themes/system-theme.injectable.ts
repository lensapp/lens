/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const systemThemeConfigurationInjectable = getInjectable({
  id: "system-theme-configuration",
  instantiate: () => observable.box<"dark" | "light">("dark"),
});

export default systemThemeConfigurationInjectable;
