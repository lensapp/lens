/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../../../../common/hotbar-store.injectable";
import { inputValidator } from "../input_validators";

const uniqueHotbarNameInjectable = getInjectable({
  id: "unique-hotbar-name",

  instantiate: di => inputValidator({
    condition: ({ required }) => required,
    message: () => "Hotbar with this name already exists",
    validate: value => !di.inject(hotbarStoreInjectable).getByName(value),
  }),
});

export default uniqueHotbarNameInjectable;
