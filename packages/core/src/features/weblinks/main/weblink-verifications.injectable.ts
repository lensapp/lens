/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Disposer } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { WebLink } from "../../../common/catalog-entities";

const weblinkVerificationsInjectable = getInjectable({
  id: "weblink-verifications",
  instantiate: () => observable.map<string, [WebLink, Disposer]>(),
});

export default weblinkVerificationsInjectable;
