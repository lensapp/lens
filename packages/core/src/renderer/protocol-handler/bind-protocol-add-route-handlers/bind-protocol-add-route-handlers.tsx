/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { LensProtocolRouterRenderer } from "../lens-protocol-router-renderer/lens-protocol-router-renderer";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import {
  EXTENSION_NAME_MATCH,
  EXTENSION_PUBLISHER_MATCH,
  LensProtocolRouter,
} from "../../../common/protocol-handler";
import type { ShowNotification } from "@k8slens/notifications";
import type { NavigateToCatalog } from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import type { NavigateToEntitySettings } from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import type { NavigateToClusterView } from "../../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import assert from "assert";
import type { AttemptInstallByInfo } from "../../components/extensions/attempt-install-by-info.injectable";
import type { GetClusterById } from "../../../features/cluster/storage/common/get-by-id.injectable";

interface Dependencies {
  attemptInstallByInfo: AttemptInstallByInfo;
  lensProtocolRouterRenderer: LensProtocolRouterRenderer;
  navigateToCatalog: NavigateToCatalog;
  navigateToAddCluster: () => void;
  navigateToExtensions: () => void;
  navigateToEntitySettings: NavigateToEntitySettings;
  navigateToClusterView: NavigateToClusterView;
  navigateToPreferences: (tabId: string) => void;
  entityRegistry: CatalogEntityRegistry;
  getClusterById: GetClusterById;
  showShortInfoNotification: ShowNotification;
}

export const bindProtocolAddRouteHandlers = ({
  attemptInstallByInfo,
  lensProtocolRouterRenderer,
  navigateToCatalog,
  navigateToAddCluster,
  navigateToExtensions,
  navigateToEntitySettings,
  navigateToClusterView,
  navigateToPreferences,
  entityRegistry,
  getClusterById,
  showShortInfoNotification,
}: Dependencies) => () => {
  lensProtocolRouterRenderer
    .addInternalHandler("/preferences", ({ search: { highlight: tabId }}) => {
      if (tabId) {
        navigateToPreferences(tabId);
      }
    })
    .addInternalHandler("/", ({ tail }) => {
      if (tail) {
        showShortInfoNotification(
          <p>
            {"Unknown Action for "}
            <code>
              lens://app/
              {tail}
            </code>
            . Are you on the latest version?
          </p>,
        );
      }

      navigateToCatalog();
    })
    .addInternalHandler("/landing", () => {
      navigateToCatalog();
    })
    .addInternalHandler("/landing/view/:group/:kind", ({ pathname: { group, kind }}) => {
      navigateToCatalog({ group, kind });
    })
    .addInternalHandler("/cluster", () => {
      navigateToAddCluster();
    })
    .addInternalHandler("/entity/:entityId/settings", ({ pathname: { entityId }}) => {
      assert(entityId);
      const entity = entityRegistry.getById(entityId);

      if (entity) {
        navigateToEntitySettings(entityId);
      } else {
        showShortInfoNotification(
          <p>
            {"Unknown catalog entity "}
            <code>{entityId}</code>
            .
          </p>,
        );
      }
    })
    // Handlers below are deprecated and only kept for backward compact purposes
    .addInternalHandler("/cluster/:clusterId", ({ pathname: { clusterId }}) => {
      assert(clusterId);
      const cluster = getClusterById(clusterId);

      if (cluster) {
        navigateToClusterView(clusterId);
      } else {
        showShortInfoNotification(
          <p>
            {"Unknown catalog entity "}
            <code>{clusterId}</code>
            .
          </p>,
        );
      }
    })
    .addInternalHandler("/cluster/:clusterId/settings", ({ pathname: { clusterId }}) => {
      assert(clusterId);
      const cluster = getClusterById(clusterId);

      if (cluster) {
        navigateToEntitySettings(clusterId);
      } else {
        showShortInfoNotification(
          <p>
            {"Unknown catalog entity "}
            <code>{clusterId}</code>
            .
          </p>,
        );
      }
    })
    .addInternalHandler("/extensions", () => {
      navigateToExtensions();
    })
    .addInternalHandler(`/extensions/install${LensProtocolRouter.ExtensionUrlSchema}`, ({ pathname, search: { version }}) => {
      const name = [
        pathname[EXTENSION_PUBLISHER_MATCH],
        pathname[EXTENSION_NAME_MATCH],
      ]
        .filter(Boolean)
        .join("/");

      navigateToExtensions();
      attemptInstallByInfo({ name, version, requireConfirmation: true });
    });
};
