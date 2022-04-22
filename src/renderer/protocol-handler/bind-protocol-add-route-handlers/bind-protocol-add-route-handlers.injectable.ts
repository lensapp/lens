/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallByInfoInjectable from "../../components/+extensions/attempt-install-by-info/attempt-install-by-info.injectable";
import { bindProtocolAddRouteHandlers } from "./bind-protocol-add-route-handlers";
import lensProtocolRouterRendererInjectable from "../lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToAddClusterInjectable from "../../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import navigateToExtensionsInjectable from "../../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import navigateToEntitySettingsInjectable from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import navigateToClusterViewInjectable from "../../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import navigateToPreferenceTabIdInjectable from "./navigate-to-preference-tab-id.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";

const bindProtocolAddRouteHandlersInjectable = getInjectable({
  id: "bind-protocol-add-route-handlers",

  instantiate: (di) => bindProtocolAddRouteHandlers({
    attemptInstallByInfo: di.inject(attemptInstallByInfoInjectable),
    lensProtocolRouterRenderer: di.inject(lensProtocolRouterRendererInjectable ),
    navigateToCatalog: di.inject(navigateToCatalogInjectable),
    navigateToAddCluster: di.inject(navigateToAddClusterInjectable),
    navigateToExtensions: di.inject(navigateToExtensionsInjectable),
    navigateToEntitySettings: di.inject(navigateToEntitySettingsInjectable),
    navigateToClusterView: di.inject(navigateToClusterViewInjectable),
    navigateToPreferenceTabId: di.inject(navigateToPreferenceTabIdInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
  }),
});

export default bindProtocolAddRouteHandlersInjectable;
