/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { OpenLensButton } from "../../../../button";
import showDialogForAddingCustomHelmRepositoryInjectable from "./dialog-visibility/show-dialog-for-adding-custom-helm-repository.injectable";

interface Dependencies {
  showDialog: () => void;
}

const NonInjectedActivationOfCustomHelmRepositoryOpenButton = ({ showDialog }: Dependencies) => (
  <OpenLensButton
    primary
    label="Add Custom Helm Repo"
    onClick={showDialog}
    data-testid="add-custom-helm-repo-button"
    data-telemetry-title="Add Custom Helm Repo Custom Title"
  />
);

export const AddingOfCustomHelmRepositoryOpenButton = withInjectables<Dependencies>(
  NonInjectedActivationOfCustomHelmRepositoryOpenButton,

  {
    getProps: (di) => ({
      showDialog: di.inject(showDialogForAddingCustomHelmRepositoryInjectable),
    }),
  },
);

