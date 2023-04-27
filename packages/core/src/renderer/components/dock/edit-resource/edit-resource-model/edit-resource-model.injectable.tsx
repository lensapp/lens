/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { RequestKubeResource } from "./request-kube-resource.injectable";
import requestKubeResourceInjectable from "./request-kube-resource.injectable";
import { waitUntilDefined } from "@k8slens/utilities";
import editResourceTabStoreInjectable from "../store.injectable";
import type { EditingResource, EditResourceTabStore } from "../store";
import { action, computed, observable, runInAction } from "mobx";
import type { KubeObject, RawKubeObject } from "@k8slens/kube-object";
import yaml from "js-yaml";
import assert from "assert";
import type { RequestPatchKubeResource } from "./request-patch-kube-resource.injectable";
import requestPatchKubeResourceInjectable from "./request-patch-kube-resource.injectable";
import { createPatch } from "rfc6902";
import type { ShowNotification } from "../../../notifications";
import showSuccessNotificationInjectable from "../../../notifications/show-success-notification.injectable";
import React from "react";
import showErrorNotificationInjectable from "../../../notifications/show-error-notification.injectable";
import { createKubeApiURL, parseKubeApi } from "../../../../../common/k8s-api/kube-api-parse";

const editResourceModelInjectable = getInjectable({
  id: "edit-resource-model",

  instantiate: async (di, tabId: string) => {
    const store = di.inject(editResourceTabStoreInjectable);

    const model = new EditResourceModel({
      requestKubeResource: di.inject(requestKubeResourceInjectable),
      requestPatchKubeResource: di.inject(requestPatchKubeResourceInjectable),
      showSuccessNotification: di.inject(showSuccessNotificationInjectable),
      showErrorNotification: di.inject(showErrorNotificationInjectable),
      store,
      tabId,
      waitForEditingResource: () => waitUntilDefined(() => store.getData(tabId)),
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
  requestKubeResource: RequestKubeResource;
  requestPatchKubeResource: RequestPatchKubeResource;
  waitForEditingResource: () => Promise<EditingResource>;
  showSuccessNotification: ShowNotification;
  showErrorNotification: ShowNotification;
  readonly store: EditResourceTabStore;
  readonly tabId: string;
}

function getEditSelfLinkFor(object: RawKubeObject): string | undefined {
  const lensVersionLabel = object.metadata.labels?.[EditResourceLabelName];

  if (lensVersionLabel) {
    const parsedKubeApi = parseKubeApi(object.metadata.selfLink);

    if (!parsedKubeApi) {
      return undefined;
    }

    const { apiVersionWithGroup, ...parsedApi } = parsedKubeApi;

    return createKubeApiURL({
      ...parsedApi,
      apiVersion: lensVersionLabel,
    });
  }

  return object.metadata.selfLink;
}

/**
 * The label name that Lens uses to receive the desired api version
 */
export const EditResourceLabelName = "k8slens-edit-resource-version";

export class EditResourceModel {
  constructor(protected readonly dependencies: Dependencies) {}

  readonly configuration = {
    value: computed(
      () => this.editingResource.draft || this.editingResource.firstDraft || "",
    ),

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

  load = async (): Promise<void> => {
    await this.dependencies.waitForEditingResource();

    let result = await this.dependencies.requestKubeResource(this.selfLink);

    if (!result.callWasSuccessful) {
      return void this.dependencies.showErrorNotification(`Loading resource failed: ${result.error}`);
    }

    if (result?.response?.metadata.labels?.[EditResourceLabelName]) {
      const parsed = parseKubeApi(this.selfLink);

      if (!parsed) {
        return void this.dependencies.showErrorNotification(`Object's selfLink is invalid: "${this.selfLink}"`);
      }

      parsed.apiVersion = result.response.metadata.labels[EditResourceLabelName];

      result = await this.dependencies.requestKubeResource(createKubeApiURL(parsed));
    }

    if (!result.callWasSuccessful) {
      return void this.dependencies.showErrorNotification(`Loading resource failed: ${result.error}`);
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
    const currentVersion = yaml.load(currentValue) as RawKubeObject;
    const firstVersion = yaml.load(this.editingResource.firstDraft ?? currentValue);

    // Make sure we save this label so that we can use it in the future
    currentVersion.metadata.labels ??= {};
    currentVersion.metadata.labels[EditResourceLabelName] = currentVersion.apiVersion.split("/").pop();

    const patches = createPatch(firstVersion, currentVersion);
    const selfLink = getEditSelfLinkFor(currentVersion);

    if (!selfLink) {
      this.dependencies.showErrorNotification((
        <p>
          {`Cannot save resource, unknown selfLink: "${currentVersion.metadata.selfLink}"`}
        </p>
      ));

      return null;
    }

    const result = await this.dependencies.requestPatchKubeResource(selfLink, patches);

    if (!result.callWasSuccessful) {
      this.dependencies.showErrorNotification((
        <p>
          Failed to save resource:
          {" "}
          {result.error}
        </p>
      ));

      return null;
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
      this.editingResource.firstDraft = yaml.dump(currentVersion);
      this.editingResource.resource = selfLink;
    });

    // NOTE: This is required for `saveAndClose` to work correctly
    return [];
  };
}
