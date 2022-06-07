/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../../../common/helm-repo";
import activateHelmRepositoryInjectable from "../activation-of-public-helm-repository/select-helm-repository/activate-helm-repository.injectable";
import hideDialogForActivatingCustomHelmRepositoryInjectable from "./dialog-visibility/hide-dialog-for-activating-custom-helm-repository.injectable";

const submitCustomHelmRepositoryInjectable = getInjectable({
  id: "submit-custom-helm-repository",

  instantiate: (di) => {
    const activateHelmRepository = di.inject(activateHelmRepositoryInjectable);
    const hideDialog = di.inject(hideDialogForActivatingCustomHelmRepositoryInjectable);

    return async (repository: HelmRepo) => {
      await activateHelmRepository(repository);

      hideDialog();
    };
  },
});

export default submitCustomHelmRepositoryInjectable;
