/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../test-utils/get-application-builder";
import { getApplicationBuilder } from "../test-utils/get-application-builder";
import type { FakeExtensionOptions } from "../test-utils/get-extension-fake";
import type { EntitySettingRegistration, RegisteredEntitySetting } from "./extension-registrator.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import catalogEntitySettingItemsInjectable from "./settings.injectable";
import { KubernetesCluster } from "../../../common/catalog-entities";
import type { IComputedValue, IObservableValue } from "mobx";
import { observable } from "mobx";

describe("entity-settings", () => {
  let builder: ApplicationBuilder;
  let windowDi: DiContainer;
  let items: IComputedValue<RegisteredEntitySetting[]>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    await builder.render();

    windowDi = builder.applicationWindow.only.di;

    const entity = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "some-kubernetes-cluster",
        uid: "some-entity-id",
      },
      spec: {
        kubeconfigContext: "some-context",
        kubeconfigPath: "/some/path/to/kubeconfig",
      },
      status: {
        phase: "connecting",
      },
    });

    items = windowDi.inject(catalogEntitySettingItemsInjectable, entity);

  });

  it("given extension does not specify entity settings visibility, it will be shown by default", () => {
    const entitySetting: EntitySettingRegistration = {
      title: "some-title",
      kind: "KubernetesCluster",
      apiVersions: ["entity.k8slens.dev/v1alpha1"],
      components: {
        View: () => null,
      },
    };

    const testExtensionOptions: FakeExtensionOptions = {
      id: "some-extension",
      name: "some-extension-name",

      rendererOptions: {
        entitySettings: [entitySetting],
      },
    };
    const itemCountBefore = items.get().length;

    builder.extensions.enable(testExtensionOptions);

    expect(items.get().length).toBe(itemCountBefore + 1);
  });

  describe("given extension entity settings has visibility set to false", () => {
    let settingVisible: IObservableValue<boolean>;

    beforeEach(() => {
      settingVisible = observable.box(false);
      const entitySetting: EntitySettingRegistration = {
        title: "some-title",
        kind: "KubernetesCluster",
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        components: {
          View: () => null,
        },
        visible: settingVisible,
      };

      const testExtensionOptions: FakeExtensionOptions = {
        id: "some-extension",
        name: "some-extension-name",

        rendererOptions: {
          entitySettings: [entitySetting],
        },
      };

      builder.extensions.enable(testExtensionOptions);
    });

    it("it won't be shown initially", () => {
      const settingsItem = items.get().find(item => item.title === "some-title");

      expect(settingsItem).toBe(undefined);
    });

    it("visibility is changed, it is shown", () => {
      settingVisible.set(true);
      const settingsItem = items.get().find(item => item.title === "some-title");

      expect(settingsItem).toBeDefined();
    });
  });
});
