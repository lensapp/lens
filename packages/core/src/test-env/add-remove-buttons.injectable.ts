/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AddRemoveButtons } from "@k8slens/core/renderer";
import { addOrRemoveButtonsInjectionToken } from "@k8slens/table";

const addRemoveButtonsInjectable = getInjectable({
  id: "add-remove-buttons-component",
  instantiate: () => ({ Component: AddRemoveButtons }),
  injectionToken: addOrRemoveButtonsInjectionToken,
});

export default addRemoveButtonsInjectable;
