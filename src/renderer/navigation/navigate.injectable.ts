/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LocationDescriptor } from "history";
import { navigate } from "./helpers";

export type Navigate = (desc: LocationDescriptor) => void;

const navigateInjectable = getInjectable({
  id: "navigate",
  instantiate: (): Navigate => (desc) => navigate(desc),
});

export default navigateInjectable;
