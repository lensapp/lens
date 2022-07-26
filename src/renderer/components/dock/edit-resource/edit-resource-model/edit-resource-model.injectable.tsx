/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { CallForResource } from "./call-for-resource/call-for-resource.injectable";
import callForResourceInjectable from "./call-for-resource/call-for-resource.injectable";
import { waitUntilDefined } from "../../../../../common/utils";
import editResourceTabStoreInjectable from "../store.injectable";
import type { EditingResource, EditResourceTabStore } from "../store";
import { action, computed, observable, runInAction } from "mobx";
import type { KubeObject } from "../../../../../common/k8s-api/kube-object";
import yaml from "js-yaml";
import assert from "assert";
import type { CallForPatchResource } from "./call-for-patch-resource/call-for-patch-resource.injectable";
import callForPatchResourceInjectable from "./call-for-patch-resource/call-for-patch-resource.injectable";
import { createPatch } from "rfc6902";
import type { ShowNotification } from "../../../notifications";
import showSuccessNotificationInjectable from "../../../notifications/show-success-notification.injectable";
import React from "react";
import showErrorNotificationInjectable from "../../../notifications/show-error-notification.injectable";

const editResourceModelInjectable = getInjectable({
  id: "edit-resource-model",

  instantiate: async (di, tabId: string) => {
    const store = di.inject(editResourceTabStoreInjectable);

    const model = new EditResourceModel({
      callForResource: di.inject(callForResourceInjectable),
      callForPatchResource: di.inject(callForPatchResourceInjectable),
      showSuccessNotification: di.inject(showSuccessNotificationInjectable),
      showErrorNotification: di.inject(showErrorNotificationInjectable),
      store,
      tabId,

      waitForEditingResource: () =>
        waitUntilDefined(() => store.getData(tabId)),
    });

    await model.load();

    return model;
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tabId: string) => tabId,
  }),
});

export default editResourceModelInjectable;

interface Dependencies {
  callForResource: CallForResource;
  callForPatchResource: CallForPatchResource;
  waitForEditingResource: () => Promise<EditingResource>;
  showSuccessNotification: ShowNotification;
  showErrorNotification: ShowNotification;
  store: EditResourceTabStore;
  tabId: string;
}

export class EditResourceModel {
  constructor(private dependencies: Dependencies) {
  }

  readonly configuration = {
    value: computed(() => this.editingResource.draft || this.editingResource.firstDraft || ""),

    onChange: action((value: string) => {
      this.editingResource.draft = value;
      this.configuration.error.value.set("");
    }),

    error: {
      value: observable.box(""),

      onChange: action((error: string) => {
        this.configuration.error.value.set(error);
      }),
    },
  };

   @observable private _resource: KubeObject | undefined;

   @computed get shouldShowErrorAboutNoResource() {
     return !this._resource;
   }

   @computed get resource() {
     assert(this._resource, "Resource does not have data");

     return this._resource;
   }

   @computed get editingResource() {
     const resource = this.dependencies.store.getData(this.dependencies.tabId);

     assert(resource, "Resource is not present in the store");

     return resource;
   }

   @computed private get selfLink() {
     return this.editingResource.resource;
   }

   load = async () => {
     await this.dependencies.waitForEditingResource();

     const result = await this.dependencies.callForResource(this.selfLink);

     if (!result.callWasSuccessful) {
       this.dependencies.showErrorNotification(
         `Loading resource failed: ${result.error}`,
       );

       return;
     }

     const resource = result.response;

     runInAction(() => {
       this._resource = resource;
     });

     if (!resource) {
       return;
     }

     runInAction(() => {
       this.editingResource.firstDraft = yaml.dump(resource.toPlainObject());
     });
   };

   get namespace() {
     return this.resource.metadata.namespace || "default";
   }

   get name() {
     return this.resource.metadata.name;
   }

   get kind() {
     return this.resource.kind;
   }

   save = async () => {
     const currentValue = this.configuration.value.get();
     const currentVersion = yaml.load(currentValue);
     const firstVersion = yaml.load(this.editingResource.firstDraft ?? currentValue);
     const patches = createPatch(firstVersion, currentVersion);

     const result = await this.dependencies.callForPatchResource(this.resource, patches);

     if (!result.callWasSuccessful) {
       this.dependencies.showErrorNotification(
         <p>
           Failed to save resource:
           {" "}
           {result.error}
         </p>,
       );

       return;
     }

     const { kind, name } = result.response;

     this.dependencies.showSuccessNotification(
       <p>
         {kind}
         {" "}
         <b>{name}</b>
         {" updated."}
       </p>,
     );

     runInAction(() => {
       this.editingResource.firstDraft = currentValue;
     });
   };
}
