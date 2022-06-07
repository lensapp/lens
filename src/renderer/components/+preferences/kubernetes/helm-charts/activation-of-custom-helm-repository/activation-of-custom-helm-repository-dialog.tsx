/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-helm-repo-dialog.scss";

import React from "react";
import { Dialog } from "../../../../dialog";
import { withInjectables } from "@ogre-tools/injectable-react";
import { ActivationOfCustomHelmRepositoryDialogContent } from "./activation-of-custom-helm-repository-dialog-content";
import activationOfCustomHelmRepositoryDialogIsVisibleInjectable from "./dialog-visibility/activation-of-custom-helm-repository-dialog-is-visible.injectable";
import type { IObservableValue } from "mobx";
import { observer } from "mobx-react";
import hideDialogForActivatingCustomHelmRepositoryInjectable from "./dialog-visibility/hide-dialog-for-activating-custom-helm-repository.injectable";

interface Dependencies {
  contentIsVisible: IObservableValue<boolean>;
  hideDialog: () => void;
}

const NonInjectedActivationOfCustomHelmRepositoryDialog = observer(({
  contentIsVisible,
  hideDialog,
}: Dependencies) => (
  <div>
    <Dialog
      className="AddHelmRepoDialog"
      isOpen={contentIsVisible.get()}
      close={hideDialog}
    >
      {contentIsVisible.get() && <ActivationOfCustomHelmRepositoryDialogContent />}
    </Dialog>
  </div>
));


export const ActivationOfCustomHelmRepositoryDialog = withInjectables<Dependencies>(
  NonInjectedActivationOfCustomHelmRepositoryDialog,

  {
    getProps: (di) => ({
      contentIsVisible: di.inject(activationOfCustomHelmRepositoryDialogIsVisibleInjectable),
      hideDialog: di.inject(hideDialogForActivatingCustomHelmRepositoryInjectable),
    }),
  },
);
