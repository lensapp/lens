/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "../../helm-charts.module.scss";

import React from "react";

import { observer } from "mobx-react";
import activeHelmRepositoriesInjectable from "./active-helm-repositories.injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Spinner } from "../../../spinner";
import type { HelmRepo } from "../../../../../common/helm-repo";
import { Notice } from "../../../+extensions/notice";
import { isEmpty } from "lodash/fp";

interface Dependencies {
  activeHelmRepositories: IAsyncComputed<HelmRepo[]>;
}

const NonInjectedActiveHelmRepositories = observer(({ activeHelmRepositories }: Dependencies) => {
  if (activeHelmRepositories.pending.get()) {
    return <Spinner data-testid="helm-repositories-are-loading" />;
  }

  const repositories = activeHelmRepositories.value.get();

  if (isEmpty(repositories)) {
    return (
      <Notice>
        <div className="flex-grow text-center" data-testid="no-helm-repositories">
          The repositories have not been added yet
        </div>
      </Notice>
    );
  }

  return (
    <div className={styles.repos}>
      {repositories.map((repository) => (
        <div key={repository.name}>
          <div data-testid={`helm-repository-${repository.name}`} className={styles.repoName}>
            {repository.name}
          </div>

          <div className={styles.repoUrl}>{repository.url}</div>
        </div>
      ))}
    </div>
  );

});

export const HelmRepositories = withInjectables<Dependencies>(
  NonInjectedActiveHelmRepositories,

  {
    getProps: (di) => ({
      activeHelmRepositories: di.inject(activeHelmRepositoriesInjectable),
    }),
  },
);

