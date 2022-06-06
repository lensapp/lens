/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import activateHelmRepositoryInjectable from "./activate-helm-repository.injectable";
import type { SelectOption } from "../../../../../select";
import type { HelmRepo } from "../../../../../../../common/helm-repo";
import type { SingleValue } from "react-select";
import deactivateHelmRepositoryInjectable from "./deactivate-helm-repository.injectable";

const selectHelmRepositoryInjectable = getInjectable({
  id: "select-helm-repository",

  instantiate: (di) => {
    const activateHelmRepository = di.inject(activateHelmRepositoryInjectable);
    const deactivateHelmRepository = di.inject(deactivateHelmRepositoryInjectable);

    return (selected: SingleValue<SelectOption<HelmRepo>>) => {
      if (!selected) {
        return;
      }

      if (!selected.isSelected) {
        activateHelmRepository(selected.value);
      } else {
        deactivateHelmRepository(selected.value);
      }
    };
  },
});

export default selectHelmRepositoryInjectable;
