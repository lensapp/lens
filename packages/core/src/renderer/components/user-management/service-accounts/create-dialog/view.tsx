/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../../../namespaces/namespace-select";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { Input } from "../../../input";
import { systemName } from "../../../input/input_validators";
import { SubTitle } from "../../../layout/sub-title";
import { Wizard, WizardStep } from "../../../wizard";
import type { CreateServiceAccountDialogState } from "./state.injectable";
import type { ServiceAccountStore } from "../store";
import type { ShowDetails } from "../../../kube-detail-params/show-details.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeCreateServiceAccountDialogInjectable from "./close.injectable";
import serviceAccountStoreInjectable from "../store.injectable";
import showDetailsInjectable from "../../../kube-detail-params/show-details.injectable";
import createServiceAccountDialogStateInjectable from "./state.injectable";
import type { ShowCheckedErrorNotification } from "../../../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../../../notifications/show-checked-error.injectable";

export interface CreateServiceAccountDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  state: CreateServiceAccountDialogState;
  serviceAccountStore: ServiceAccountStore;
  closeCreateServiceAccountDialog: () => void;
  showDetails: ShowDetails;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

@observer
class NonInjectedCreateServiceAccountDialog extends React.Component<CreateServiceAccountDialogProps & Dependencies> {
  createAccount = async () => {
    const {
      closeCreateServiceAccountDialog,
      serviceAccountStore,
      state,
      showDetails,
      showCheckedErrorNotification,
    } = this.props;

    try {
      const serviceAccount = await serviceAccountStore.create({
        namespace: state.namespace.get(),
        name: state.name.get(),
      });

      showDetails(serviceAccount.selfLink);
      closeCreateServiceAccountDialog();
    } catch (err) {
      showCheckedErrorNotification(err, "Unknown error occurred while creating service account");
    }
  };

  render() {
    const { closeCreateServiceAccountDialog, serviceAccountStore, state, ...dialogProps } = this.props;

    return (
      <Dialog
        {...dialogProps}
        className="CreateServiceAccountDialog"
        isOpen={state.isOpen.get()}
        close={closeCreateServiceAccountDialog}
      >
        <Wizard
          header={<h5>Create Service Account</h5>}
          done={closeCreateServiceAccountDialog}
        >
          <WizardStep nextLabel="Create" next={this.createAccount}>
            <SubTitle title="Account Name" />
            <Input
              autoFocus
              required
              placeholder="Enter a name"
              trim
              validators={systemName}
              value={state.name.get()}
              onChange={v => state.name.set(v.toLowerCase())}
            />
            <SubTitle title="Namespace" />
            <NamespaceSelect
              id="create-dialog-namespace-select-input"
              themeName="light"
              value={state.namespace.get()}
              onChange={option => state.namespace.set(option?.value ?? "default")}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const CreateServiceAccountDialog = withInjectables<Dependencies, CreateServiceAccountDialogProps>(NonInjectedCreateServiceAccountDialog, {
  getProps: (di, props) => ({
    ...props,
    closeCreateServiceAccountDialog: di.inject(closeCreateServiceAccountDialogInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    showDetails: di.inject(showDetailsInjectable),
    state: di.inject(createServiceAccountDialogStateInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
