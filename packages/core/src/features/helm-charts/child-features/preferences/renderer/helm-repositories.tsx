/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./helm-charts.module.scss";

import React from "react";

import { observer } from "mobx-react";
import activeHelmRepositoriesInjectable from "./active-helm-repositories.injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Spinner } from "@k8slens/spinner";
import type { HelmRepo } from "../../../../../common/helm/helm-repo";
import { RemovableItem } from "../../../../preferences/renderer/removable-item/removable-item";
import removeHelmRepositoryInjectable from "./remove-helm-repository.injectable";

interface Dependencies {
  activeHelmRepositories: IAsyncComputed<HelmRepo[]>;
  removeRepository: (repository: HelmRepo) => Promise<void>;
}

const NonInjectedActiveHelmRepositories = observer(({ activeHelmRepositories, removeRepository }: Dependencies) => {
  if (activeHelmRepositories.pending.get()) {
    return (
      <div className={styles.repos}>
        <div className="pt-5 relative">
          <Spinner center data-testid="helm-repositories-are-loading" />
        </div>
      </div>
    );
  }

  const repositories = activeHelmRepositories.value.get();

  return (
    <div className={styles.repos}>
      {repositories.map((repository) => (
        <RemovableItem
          key={repository.name}
          onRemove={() => removeRepository(repository)}
          className={styles.repo}
          data-testid={`remove-helm-repository-${repository.name}`}
        >
          <div>
            <div data-testid={`helm-repository-${repository.name}`} className={styles.repoName}>
              {repository.name}
            </div>

            <div className={styles.repoUrl}>{repository.url}</div>
          </div>
        </RemovableItem>
      ))}
    </div>
  );

});

export const HelmRepositories = withInjectables<Dependencies>(
  NonInjectedActiveHelmRepositories,

  {
    getProps: (di) => ({
      activeHelmRepositories: di.inject(activeHelmRepositoriesInjectable),
      removeRepository: di.inject(removeHelmRepositoryInjectable),
    }),
  },
);

