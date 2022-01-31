/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { GroupSelectOption, SelectOption } from "../../select";
import userCreateResourceTemplatesInjectable from "./user-templates.injectable";
import lensCreateResourceTemplatesInjectable from "./lens-templates.injectable";

export type RawTemplates = [group: string, items: [file: string, contents: string][]];

const createResourceTemplatesInjectable = getInjectable({
  instantiate: async (di) => {
    const lensResourceTemplates = await di.inject(lensCreateResourceTemplatesInjectable);
    const userResourceTemplates = di.inject(userCreateResourceTemplatesInjectable);

    return computed(() => {
      const res = [
        ...userResourceTemplates.get(),
        lensResourceTemplates,
      ];

      return res.map(([group, items]) => ({
        label: group,
        options: items.map(([label, value]) => ({ label, value })),
      }) as GroupSelectOption<SelectOption<string>>);
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default createResourceTemplatesInjectable;
