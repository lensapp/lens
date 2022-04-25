/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import type { CustomResourceDefinition } from "../endpoints";
import type { KubeApi } from "../kube-api";

export interface LegacyAutoRegistration {
  customResourceDefinition: (crd: CustomResourceDefinition) => void;
  kubeApi: (api: KubeApi<any, any>) => void;
}

/**
 * This is used to remove dependency cycles from auto registering of instances
 *
 * - Custom Resource Definitions get their own registered store (will need in the future)
 * - All KubeApi's get auto registered (this should be changed in the future)
 */
const autoRegistrationEmitterInjectable = getInjectable({
  id: "auto-registration-emitter",
  instantiate: (): TypedEventEmitter<LegacyAutoRegistration> => new EventEmitter(),
});

export default autoRegistrationEmitterInjectable;
