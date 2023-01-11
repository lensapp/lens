/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export type HelmRepositoriesErrorState =
  | { controlsAreShown: true }
  | { controlsAreShown: false; errorMessage: string };

const helmRepositoriesErrorStateInjectable = getInjectable({
  id: "helm-repositories-error-state",

  instantiate: () =>
    observable.box<HelmRepositoriesErrorState>({ controlsAreShown: true }),
});

export default helmRepositoriesErrorStateInjectable;
