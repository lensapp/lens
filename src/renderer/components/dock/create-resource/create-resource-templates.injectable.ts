/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userCreateResourceTemplatesInjectable from "./user-templates.injectable";
import lensCreateResourceTemplatesInjectable from "./lens-templates.injectable";
import type { GroupBase } from "react-select";

export type RawTemplates = [group: string, items: [file: string, contents: string][]];

const createResourceTemplatesInjectable = getInjectable({
  id: "create-resource-templates",

  instantiate: async (di) => {
    const lensResourceTemplates = await di.inject(lensCreateResourceTemplatesInjectable);
    const userResourceTemplates = di.inject(userCreateResourceTemplatesInjectable);

    return computed((): GroupBase<{ label: string; value: string }>[] => {
      const res = [
        ...userResourceTemplates.get(),
        lensResourceTemplates,
      ];

      return res.map(([group, items]) => ({
        label: group,
        options: items.map(([label, value]) => ({ label, value })),
      }));
    });
  },
});

export default createResourceTemplatesInjectable;
