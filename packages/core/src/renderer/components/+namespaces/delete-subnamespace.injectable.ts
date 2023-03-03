/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import removeSubnamespaceInjectable from "./remove-subnamespace.injectable";

// A wrapper injectable to avoid circular dependency loop caused by injection of
// removeSubnamespaceInjectable into namespace store.
const deleteSubnamespaceInjectable = getInjectable({
  id: "delete-subnamespace",

  instantiate: (di) => {
    const removeSubnamespace = di.inject(removeSubnamespaceInjectable);

    return async (namespace: string) => (
      removeSubnamespace(namespace)
    );
  },
});

export default deleteSubnamespaceInjectable;
