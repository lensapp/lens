/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { attemptInstallByInfo } from "../components/+extensions";
import { LensProtocolRouterRenderer } from "./router";
import { navigate } from "../navigation/helpers";
import { catalogEntityRegistry } from "../api/catalog-entity-registry";
import { ClusterStore } from "../../common/cluster-store";
import { EXTENSION_NAME_MATCH, EXTENSION_PUBLISHER_MATCH, LensProtocolRouter } from "../../common/protocol-handler";
import * as routes from "../../common/routes";

export function bindProtocolAddRouteHandlers() {
  LensProtocolRouterRenderer
    .getInstance()
    .addInternalHandler("/preferences", ({ search: { highlight }}) => {
      navigate(routes.preferencesURL({ fragment: highlight }));
    })
    .addInternalHandler("/", () => {
      navigate(routes.catalogURL());
    })
    .addInternalHandler("/landing", () => {
      navigate(routes.catalogURL());
    })
    .addInternalHandler("/cluster", () => {
      navigate(routes.addClusterURL());
    })
    .addInternalHandler("/entity/:entityId/settings", ({ pathname: { entityId } }) => {
      const entity = catalogEntityRegistry.getById(entityId);

      if (entity) {
        navigate(routes.entitySettingsURL({ params: { entityId } }));
      } else {
        console.log("[APP-HANDLER]: catalog entity with given ID does not exist", { entityId });
      }
    })
    // Handlers below are deprecated and only kept for backward compact purposes
    .addInternalHandler("/cluster/:clusterId", ({ pathname: { clusterId } }) => {
      const cluster = ClusterStore.getInstance().getById(clusterId);

      if (cluster) {
        navigate(routes.clusterViewURL({ params: { clusterId } }));
      } else {
        console.log("[APP-HANDLER]: cluster with given ID does not exist", { clusterId });
      }
    })
    .addInternalHandler("/cluster/:clusterId/settings", ({ pathname: { clusterId } }) => {
      const cluster = ClusterStore.getInstance().getById(clusterId);

      if (cluster) {
        navigate(routes.entitySettingsURL({ params: { entityId: clusterId } }));
      } else {
        console.log("[APP-HANDLER]: cluster with given ID does not exist", { clusterId });
      }
    })
    .addInternalHandler("/extensions", () => {
      navigate(routes.extensionsURL());
    })
    .addInternalHandler(`/extensions/install${LensProtocolRouter.ExtensionUrlSchema}`, ({ pathname, search: { version } }) => {
      const name = [
        pathname[EXTENSION_PUBLISHER_MATCH],
        pathname[EXTENSION_NAME_MATCH],
      ].filter(Boolean)
        .join("/");

      navigate(routes.extensionsURL());
      attemptInstallByInfo({ name, version, requireConfirmation: true });
    });
}
