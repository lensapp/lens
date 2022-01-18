/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import hotbarManagerInjectable from "../../../../common/hotbar-store.injectable";
import type { InputValidator } from "../input_validators";

const uniqueHotbarNameInjectable = getInjectable({
  instantiate: di => ({
    condition: ({ required }) => required,
    message: () => "Hotbar with this name already exists",
    validate: value => !di.inject(hotbarManagerInjectable).getByName(value),
  } as InputValidator),
  lifecycle: lifecycleEnum.singleton,
});

export default uniqueHotbarNameInjectable;
