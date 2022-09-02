/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getRandomIdInjectable from "../../../../common/utils/get-random-id.injectable";

const getRandomIdForEditResourceTabInjectable = getInjectable({
  id: "get-random-id-for-edit-resource-tab",
  instantiate: (di) => di.inject(getRandomIdInjectable),
});

export default getRandomIdForEditResourceTabInjectable;
