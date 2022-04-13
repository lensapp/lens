/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { CustomResourceDefinitionApi } from "./custom-resource-definition.api";

const customResourceDefinitionApiInjectable = getInjectable({
  id: "custom-resource-definition-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "customResourceDefinitionApi is only available in certain environments");

    return new CustomResourceDefinitionApi();
  },
});

export default customResourceDefinitionApiInjectable;
