/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallByInfoInjectable from "../components/+extensions/attempt-install-by-info.injectable";
import lensProtocolRouterRendererInjectable from "./router.injectable";
import navigateToCatalogInjectable from "../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToAddClusterInjectable from "../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import navigateToExtensionsInjectable from "../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import navigateToEntitySettingsInjectable from "../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import navigateToClusterViewInjectable from "../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import navigateToPreferenceTabIdInjectable from "./navigate-to-preference-tab-id.injectable";
import React from "react";
import type { LensProtocolRouterRenderer } from "./router";
import { catalogEntityRegistry } from "../api/catalog-entity-registry";
import { ClusterStore } from "../../common/cluster/store";
import { EXTENSION_NAME_MATCH, EXTENSION_PUBLISHER_MATCH, LensProtocolRouter } from "../../common/protocol-handler";
import { Notifications } from "../components/notifications";
import type { NavigateToCatalog } from "../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import type { NavigateToEntitySettings } from "../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import type { NavigateToClusterView } from "../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import type { AttemptInstallByInfo } from "../components/+extensions/attempt-install-by-info.injectable";

interface Dependencies {
  attemptInstallByInfo: AttemptInstallByInfo;
  lensProtocolRouterRenderer: LensProtocolRouterRenderer;
  navigateToCatalog: NavigateToCatalog;
  navigateToAddCluster: () => void;
  navigateToExtensions: () => void;
  navigateToEntitySettings: NavigateToEntitySettings;
  navigateToClusterView: NavigateToClusterView;
  navigateToPreferenceTabId: (tabId: string) => void;
}

const bindProtocolAddRouteHandlers = ({
  attemptInstallByInfo,
  lensProtocolRouterRenderer,
  navigateToCatalog,
  navigateToAddCluster,
  navigateToExtensions,
  navigateToEntitySettings,
  navigateToClusterView,
  navigateToPreferenceTabId,
}: Dependencies) => () => {
  lensProtocolRouterRenderer
    .addInternalHandler("/preferences", ({ search: { highlight: tabId }}) => {
      navigateToPreferenceTabId(tabId);
    })
    .addInternalHandler("/", ({ tail }) => {
      if (tail) {
        Notifications.shortInfo(
          <p>
              Unknown Action for <code>lens://app/{tail}</code>. Are you on the
              latest version?
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
        const entity = catalogEntityRegistry.getById(entityId);

        if (entity) {
          navigateToEntitySettings(entityId);
        } else {
          Notifications.shortInfo(
            <p>
                Unknown catalog entity <code>{entityId}</code>.
            </p>,
          );
        }
      },
    )
  // Handlers below are deprecated and only kept for backward compact purposes
    .addInternalHandler(
      "/cluster/:clusterId",
      ({ pathname: { clusterId }}) => {
        const cluster = ClusterStore.getInstance().getById(clusterId);

        if (cluster) {
          navigateToClusterView(clusterId);
        } else {
          Notifications.shortInfo(
            <p>
                Unknown catalog entity <code>{clusterId}</code>.
            </p>,
          );
        }
      },
    )
    .addInternalHandler(
      "/cluster/:clusterId/settings",
      ({ pathname: { clusterId }}) => {
        const cluster = ClusterStore.getInstance().getById(clusterId);

        if (cluster) {
          navigateToEntitySettings(clusterId);
        } else {
          Notifications.shortInfo(
            <p>
                Unknown catalog entity <code>{clusterId}</code>.
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

const bindProtocolAddRouteHandlersInjectable = getInjectable({
  id: "bind-protocol-add-route-handlers",

  instantiate: (di) => bindProtocolAddRouteHandlers({
    attemptInstallByInfo: di.inject(attemptInstallByInfoInjectable),
    lensProtocolRouterRenderer: di.inject(lensProtocolRouterRendererInjectable),
    navigateToCatalog: di.inject(navigateToCatalogInjectable),
    navigateToAddCluster: di.inject(navigateToAddClusterInjectable),
    navigateToExtensions: di.inject(navigateToExtensionsInjectable),
    navigateToEntitySettings: di.inject(navigateToEntitySettingsInjectable),
    navigateToClusterView: di.inject(navigateToClusterViewInjectable),
    navigateToPreferenceTabId: di.inject(navigateToPreferenceTabIdInjectable),
  }),
});

export default bindProtocolAddRouteHandlersInjectable;
