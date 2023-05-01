/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addHelmRepositoryInjectable from "./add-helm-repository.injectable";
import type { SelectOption } from "../../../../../../../renderer/components/select";
import type { HelmRepo } from "../../../../../../../common/helm/helm-repo";
import type { SingleValue } from "react-select";
import removeHelmRepositoryInjectable from "../../remove-helm-repository.injectable";

const selectHelmRepositoryInjectable = getInjectable({
  id: "select-helm-repository",

  instantiate: (di) => {
    const addHelmRepository = di.inject(addHelmRepositoryInjectable);
    const removeHelmRepository = di.inject(removeHelmRepositoryInjectable);

    return async (selected: SingleValue<SelectOption<HelmRepo>>) => {
      if (!selected) {
        return;
      }

      if (!selected.isSelected) {
        await addHelmRepository(selected.value);
      } else {
        await removeHelmRepository(selected.value);
      }
    };
  },
});

export default selectHelmRepositoryInjectable;
