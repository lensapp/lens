/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getHotbarByNameInjectable from "../../../../common/hotbar-store/get-hotbar-by-name.injectable";
import type { Hotbar } from "../../../../common/hotbar-store/hotbar";
import type { InputValidator } from "../input_validators";

interface Dependencies {
  getHotbarByName: (name: string) => Hotbar;
}

function getUniqueHotbarName({ getHotbarByName }: Dependencies): InputValidator {
  return {
    condition: ({ required }) => required,
    message: () => "Hotbar with this name already exists",
    validate: value => !getHotbarByName(value),
  };
}

const uniqueHotbarNameInjectable = getInjectable({
  instantiate: di => getUniqueHotbarName({
    getHotbarByName: di.inject(getHotbarByNameInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default uniqueHotbarNameInjectable;
