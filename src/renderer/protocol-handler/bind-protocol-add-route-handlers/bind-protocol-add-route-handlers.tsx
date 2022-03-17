/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { LensProtocolRouterRenderer } from "../lens-protocol-router-renderer/lens-protocol-router-renderer";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { ClusterStore } from "../../../common/cluster-store/cluster-store";
import {
  EXTENSION_NAME_MATCH,
  EXTENSION_PUBLISHER_MATCH,
  LensProtocolRouter,
} from "../../../common/protocol-handler";
import { Notifications } from "../../components/notifications";
import type { ExtensionInfo } from "../../components/+extensions/attempt-install-by-info/attempt-install-by-info";
import type { NavigateToCatalog } from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import type { NavigateToEntitySettings } from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import type { NavigateToClusterView } from "../../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import assert from "assert";

// TODO: make it so that the handlers are type safe and we don't need to do the asserts

interface Dependencies {
  attemptInstallByInfo: (extensionInfo: ExtensionInfo) => Promise<void>;
  lensProtocolRouterRenderer: LensProtocolRouterRenderer;
  navigateToCatalog: NavigateToCatalog;
  navigateToAddCluster: () => void;
  navigateToExtensions: () => void;
  navigateToEntitySettings: NavigateToEntitySettings;
  navigateToClusterView: NavigateToClusterView;
  navigateToPreferenceTabId: (tabId: string) => void;
}

export const bindProtocolAddRouteHandlers =
  ({ attemptInstallByInfo, lensProtocolRouterRenderer, navigateToCatalog, navigateToAddCluster, navigateToExtensions, navigateToEntitySettings, navigateToClusterView, navigateToPreferenceTabId }: Dependencies) =>
    () => {
      lensProtocolRouterRenderer
        .addInternalHandler("/preferences", ({ search: { highlight: tabId }}) => {
          if (tabId) {
            navigateToPreferenceTabId(tabId);
          }
        })
        .addInternalHandler("/", ({ tail }) => {
          if (tail) {
            Notifications.shortInfo(
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
        .addInternalHandler(
          "/landing/view/:group/:kind",
          ({ pathname: { group, kind }}) => {
            navigateToCatalog({ group, kind });
          },
        )
        .addInternalHandler("/cluster", () => {
          navigateToAddCluster();
        })
        .addInternalHandler(
          "/entity/:entityId/settings",
          ({ pathname: { entityId }}) => {
            assert(entityId);
            const entity = catalogEntityRegistry.getById(entityId);

            if (entity) {
              navigateToEntitySettings(entityId);
            } else {
              Notifications.shortInfo(
                <p>
                  {"Unknown catalog entity "}
                  <code>{entityId}</code>
                  .
                </p>,
              );
            }
          },
        )
      // Handlers below are deprecated and only kept for backward compact purposes
        .addInternalHandler(
          "/cluster/:clusterId",
          ({ pathname: { clusterId }}) => {
            assert(clusterId);
            const cluster = ClusterStore.getInstance().getById(clusterId);

            if (cluster) {
              navigateToClusterView(clusterId);
            } else {
              Notifications.shortInfo(
                <p>
                  {"Unknown catalog entity "}
                  <code>{clusterId}</code>
                  .
                </p>,
              );
            }
          },
        )
        .addInternalHandler(
          "/cluster/:clusterId/settings",
          ({ pathname: { clusterId }}) => {
            assert(clusterId);
            const cluster = ClusterStore.getInstance().getById(clusterId);

            if (cluster) {
              navigateToEntitySettings(clusterId);
            } else {
              Notifications.shortInfo(
                <p>
                  {"Unknown catalog entity "}
                  <code>{clusterId}</code>
                  .
                </p>,
              );
            }
          },
        )
        .addInternalHandler("/extensions", () => {
          navigateToExtensions();
        })
        .addInternalHandler(
          `/extensions/install${LensProtocolRouter.ExtensionUrlSchema}`,
          ({ pathname, search: { version }}) => {
            const name = [
              pathname[EXTENSION_PUBLISHER_MATCH],
              pathname[EXTENSION_NAME_MATCH],
            ]
              .filter(Boolean)
              .join("/");

            navigateToExtensions();
            attemptInstallByInfo({ name, version, requireConfirmation: true });
          },
        );
    };
