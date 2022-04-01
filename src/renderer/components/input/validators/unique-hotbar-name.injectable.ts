/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../../../../common/hotbar-store.injectable";
import type { InputValidator } from "../input_validators";

const uniqueHotbarNameInjectable = getInjectable({
  id: "unique-hotbar-name",

  instantiate: di => ({
    condition: ({ required }) => required,
    message: () => "Hotbar with this name already exists",
    validate: value => !di.inject(hotbarStoreInjectable).getByName(value),
  } as InputValidator),
});

export default uniqueHotbarNameInjectable;
