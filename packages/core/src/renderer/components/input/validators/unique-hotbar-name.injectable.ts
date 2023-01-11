/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../../../../common/hotbars/store.injectable";
import { inputValidator } from "../input_validators";

const uniqueHotbarNameInjectable = getInjectable({
  id: "unique-hotbar-name",

  instantiate: di => {
    const store = di.inject(hotbarStoreInjectable);

    return inputValidator({
      condition: ({ required }) => required,
      message: () => "Hotbar with this name already exists",
      validate: value => !store.findByName(value),
    });
  },
});

export default uniqueHotbarNameInjectable;
