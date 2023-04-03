/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import findHotbarByNameInjectable from "../../../../features/hotbar/storage/common/find-by-name.injectable";
import { inputValidator } from "../input_validators";

const uniqueHotbarNameInjectable = getInjectable({
  id: "unique-hotbar-name",

  instantiate: di => {
    const findHotbarByName = di.inject(findHotbarByNameInjectable);

    return inputValidator({
      condition: ({ required }) => required,
      message: () => "Hotbar with this name already exists",
      validate: value => !findHotbarByName(value),
    });
  },
});

export default uniqueHotbarNameInjectable;
