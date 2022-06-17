/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../../../common/helm/helm-repo";
import addHelmRepositoryInjectable from "../adding-of-public-helm-repository/select-helm-repository/add-helm-repository.injectable";
import hideDialogForAddingCustomHelmRepositoryInjectable from "./dialog-visibility/hide-dialog-for-adding-custom-helm-repository.injectable";

const submitCustomHelmRepositoryInjectable = getInjectable({
  id: "submit-custom-helm-repository",

  instantiate: (di) => {
    const addHelmRepository = di.inject(addHelmRepositoryInjectable);
    const hideDialog = di.inject(hideDialogForAddingCustomHelmRepositoryInjectable);

    return async (repository: HelmRepo) => {
      await addHelmRepository(repository);

      hideDialog();
    };
  },
});

export default submitCustomHelmRepositoryInjectable;
