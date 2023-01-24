/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IObservableValue } from "mobx";
import { observable } from "mobx";

export interface CreateServiceAccountDialogState {
  readonly isOpen: IObservableValue<boolean>;
  readonly name: IObservableValue<string>;
  readonly namespace: IObservableValue<string>;
}

const createServiceAccountDialogStateInjectable = getInjectable({
  id: "create-service-account-dialog",
  instantiate: (): CreateServiceAccountDialogState => ({
    isOpen: observable.box(false),
    name: observable.box(""),
    namespace: observable.box("default"),
  }),
});

export default createServiceAccountDialogStateInjectable;
