/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { computed } from "mobx";
import { KubernetesCluster, WebLink } from "../../common/catalog-entities";
import navigateToEntitySettingsInjectable from "../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import hotbarStoreInjectable from "../../common/hotbars/store.injectable";
import catalogEntityRegistryInjectable from "../../main/catalog/entity-registry.injectable";
import { type ApplicationBuilder, getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("limit short-name length tests", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let windowDi: DiContainer;
  let clusterEntity: KubernetesCluster;
  let localClusterEntity: KubernetesCluster;
  let otherEntity: WebLink;
  let user: UserEvent;

  beforeEach(async () => {
    builder = getApplicationBuilder({
      useFakeTime: {
        autoAdvance: true,
      },
    });
    user = userEvent.setup();

    builder.beforeApplicationStart((mainDi) => {
      clusterEntity = new KubernetesCluster({
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
      localClusterEntity = new KubernetesCluster({
        metadata: {
          labels: {},
          name: "some-local-kubernetes-cluster",
          uid: "some-entity-id-2",
          source: "local",
        },
        spec: {
          kubeconfigContext: "some-context",
          kubeconfigPath: "/some/path/to/local/kubeconfig",
        },
        status: {
          phase: "connecting",
        },
      });
      otherEntity = new WebLink({
        metadata: {
          labels: {},
          name: "some-weblink",
          uid: "some-weblink-id",
        },
        spec: {
          url: "https://my-websome.com",
        },
        status: {
          phase: "available",
        },
      });

      mainDi.inject(catalogEntityRegistryInjectable).addComputedSource("test-id", computed(() => [clusterEntity, otherEntity, localClusterEntity]));
    });

    builder.afterWindowStart((rendererDi) => {
      rendererDi.inject(hotbarStoreInjectable).addToHotbar(clusterEntity);
    });

    rendered = await builder.render();
    windowDi = builder.applicationWindow.only.di;
  });

  describe("when navigating to entity settings for #short-name", () => {
    beforeEach(() => {
      const navigateToEntitySettings = windowDi.inject(navigateToEntitySettingsInjectable);

      navigateToEntitySettings(clusterEntity.getId(), "short-name");
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows short-name settings", () => {
      expect(rendered.queryByTestId("short-name-settings-section")).toBeInTheDocument();
    });

    describe("when new short-name is inputed", () => {
      beforeEach(async () => {
        await user.click(rendered.getByTestId("short-name-setting-input"));
        await user.keyboard("jkl{Enter}");
      });

      it("shows new short-name on hotbar icon", () => {
        expect(rendered.getByTestId("hotbar-icon-for-some-entity-id")).toHaveTextContent("jkl");
      });
    });

    describe("when short-name is inputed which is too long", () => {
      beforeEach(async () => {
        await user.click(rendered.getByTestId("short-name-setting-input"));
        await user.keyboard("jklmnopqrs{Enter}");
      });

      it("shows length limited short-name on hotbar icon", () => {
        expect(rendered.getByTestId("hotbar-icon-for-some-entity-id")).toHaveTextContent("jklmn");
      });
    });

    describe("when short-name is inputed which has encoding length > 5 but has grapheme length <= 5", () => {
      beforeEach(async () => {
        await user.click(rendered.getByTestId("short-name-setting-input"));
        await user.keyboard("😀😀😀😀😀{Enter}");
      });

      it("shows length limited short-name on hotbar icon", () => {
        expect(rendered.getByTestId("hotbar-icon-for-some-entity-id")).toHaveTextContent("😀😀😀😀😀");
      });
    });
  });
});
