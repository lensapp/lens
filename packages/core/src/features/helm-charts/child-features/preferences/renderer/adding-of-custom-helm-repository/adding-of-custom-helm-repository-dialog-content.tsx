/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-helm-repo-dialog.scss";

import React from "react";
import { Wizard, WizardStep } from "../../../../../../renderer/components/wizard";
import { Input } from "../../../../../../renderer/components/input";
import { isUrl, systemName } from "../../../../../../renderer/components/input/input_validators";
import { withInjectables } from "@ogre-tools/injectable-react";
import customHelmRepoInjectable from "./custom-helm-repo.injectable";
import type { HelmRepo } from "../../../../../../common/helm/helm-repo";
import { observer } from "mobx-react";
import type { IObservableValue } from "mobx";
import { action } from "mobx";
import submitCustomHelmRepositoryInjectable from "./submit-custom-helm-repository.injectable";
import hideDialogForAddingCustomHelmRepositoryInjectable from "./dialog-visibility/hide-dialog-for-adding-custom-helm-repository.injectable";
import { Button } from "@k8slens/button";
import { Icon } from "@k8slens/icon";
import maximalCustomHelmRepoOptionsAreShownInjectable from "./maximal-custom-helm-repo-options-are-shown.injectable";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { Checkbox } from "../../../../../../renderer/components/checkbox";
import { HelmFileInput } from "./helm-file-input/helm-file-input";
import { toJS } from "../../../../../../common/utils";

interface Dependencies {
  helmRepo: HelmRepo;
  hideDialog: () => void;
  submitCustomRepository: (repository: HelmRepo) => Promise<void>;
  maximalOptionsAreShown: IObservableValue<boolean>;
}

const NonInjectedActivationOfCustomHelmRepositoryDialogContent = observer(({
  helmRepo,
  submitCustomRepository,
  maximalOptionsAreShown,
  hideDialog,
} : Dependencies) => (
  <Wizard header={<h5>Add custom Helm Repo</h5>} done={hideDialog}>
    <WizardStep
      contentClass="flow column"
      nextLabel="Add"
      next={() => submitCustomRepository(toJS(helmRepo))}
      testIdForNext="custom-helm-repository-submit-button"
      testIdForPrev="custom-helm-repository-cancel-button"
    >
      <div className="flex column gaps" data-testid="add-custom-helm-repository-dialog">
        <Input
          autoFocus
          required
          placeholder="Helm repo name"
          trim
          validators={systemName}
          value={helmRepo.name}
          onChange={action(v => helmRepo.name = v)}
          data-testid="custom-helm-repository-name-input"
        />
        <Input
          required
          placeholder="URL"
          validators={isUrl}
          value={helmRepo.url}
          onChange={action(v => helmRepo.url = v)}
          data-testid="custom-helm-repository-url-input"
        />
        <Button
          plain
          className="accordion"
          data-testid="toggle-maximal-options-for-custom-helm-repository-button"
          onClick={action(() => maximalOptionsAreShown.set(!maximalOptionsAreShown.get()))}
        >
          More
          <Icon
            small
            tooltip="More"
            material={maximalOptionsAreShown.get() ? "remove" : "add"}
          />
        </Button>

        {maximalOptionsAreShown.get() && (
          <div data-testid="maximal-options-for-custom-helm-repository-dialog">
            <SubTitle title="Security settings" />

            <Checkbox
              label="Skip TLS certificate checks for the repository"
              value={helmRepo.insecureSkipTlsVerify}
              onChange={action(v => {
                helmRepo.insecureSkipTlsVerify = v;
              })}
              data-testid="custom-helm-repository-verify-tls-input"
            />

            <HelmFileInput
              placeholder="Key file"
              value={helmRepo.keyFile || ""}
              setValue={action((value) => helmRepo.keyFile = value)}
              fileExtensions={keyExtensions}
              data-testid="custom-helm-repository-key-file-input"
            />

            <HelmFileInput
              placeholder="Ca file"
              value={helmRepo.caFile || ""}
              setValue={action((value) => helmRepo.caFile = value)}
              fileExtensions={certExtensions}
              data-testid="custom-helm-repository-ca-cert-file-input"
            />

            <HelmFileInput
              placeholder="Certificate file"
              value={helmRepo.certFile || ""}
              setValue={action((value) => helmRepo.certFile = value)}
              fileExtensions={certExtensions}
              data-testid="custom-helm-repository-cert-file-input"
            />

            <SubTitle title="Chart Repository Credentials" />

            <Input
              placeholder="Username"
              value={helmRepo.username}
              onChange= {action(v => helmRepo.username = v)}
              data-testid="custom-helm-repository-username-input"
            />
            <Input
              type="password"
              placeholder="Password"
              value={helmRepo.password}
              onChange={action(v => helmRepo.password = v)}
              data-testid="custom-helm-repository-password-input"
            />
          </div>
        )}
      </div>
    </WizardStep>
  </Wizard>
));



export const AddingOfCustomHelmRepositoryDialogContent = withInjectables<Dependencies>(NonInjectedActivationOfCustomHelmRepositoryDialogContent, {
  getProps: (di) => ({
    helmRepo: di.inject(customHelmRepoInjectable),
    hideDialog: di.inject(hideDialogForAddingCustomHelmRepositoryInjectable),
    submitCustomRepository: di.inject(submitCustomHelmRepositoryInjectable),
    maximalOptionsAreShown: di.inject(maximalCustomHelmRepoOptionsAreShownInjectable),
  }),
});

const keyExtensions = ["key", "keystore", "jks", "p12", "pfx", "pem"];
const certExtensions = ["crt", "cer", "ca-bundle", "p7b", "p7c", "p7s", "p12", "pfx", "pem"];

