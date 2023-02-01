/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userCreateResourceTemplatesInjectable from "./user-templates.injectable";
import lensCreateResourceTemplatesInjectable from "./lens-templates.injectable";
import type { GroupBase } from "react-select";

export interface RawTemplate {
  label: string;
  value: string;
}
export interface RawTemplates {
  label: string;
  options: RawTemplate[];
}

const createResourceTemplatesInjectable = getInjectable({
  id: "create-resource-templates",

  instantiate: (di) => {
    const lensResourceTemplates = di.inject(lensCreateResourceTemplatesInjectable);
    const userResourceTemplates = di.inject(userCreateResourceTemplatesInjectable);

    return computed((): GroupBase<RawTemplate>[] => [
      ...userResourceTemplates.get(),
      lensResourceTemplates,
    ]);
  },
});

export default createResourceTemplatesInjectable;
