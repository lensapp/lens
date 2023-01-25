/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import type { TableStorageModel } from "./table-model";
import { TableModel } from "./table-model";

const tableModelInjectable = getInjectable({
  id: "table-model",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    const storage = createStorage<TableStorageModel>("table_settings", {
      sortParams: {},
    });

    return new TableModel({
      storage,
    });
  },
});

export default tableModelInjectable;
