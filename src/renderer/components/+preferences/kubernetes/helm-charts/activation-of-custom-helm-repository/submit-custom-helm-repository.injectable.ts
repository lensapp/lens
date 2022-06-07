/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../../../common/helm-repo";
import activateHelmRepositoryInjectable from "../activation-of-public-helm-repository/select-helm-repository/activate-helm-repository.injectable";
import hideDialogForActivatingCustomHelmRepositoryInjectable from "./dialog-visibility/hide-dialog-for-activating-custom-helm-repository.injectable";
import showSuccessNotificationInjectable from "../../../../notifications/show-success-notification.injectable";

const submitCustomHelmRepositoryInjectable = getInjectable({
  id: "submit-custom-helm-repository",

  instantiate: (di) => {
    const activateHelmRepository = di.inject(activateHelmRepositoryInjectable);
    const hideDialog = di.inject(hideDialogForActivatingCustomHelmRepositoryInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);

    return async (repository: HelmRepo) => {
      await activateHelmRepository(repository);

      showSuccessNotification(`Helm repository ${repository.name} has been added.`);

      hideDialog();
    };
  },
});

export default submitCustomHelmRepositoryInjectable;
