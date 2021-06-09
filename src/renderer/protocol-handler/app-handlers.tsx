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

import React from "react";
import { addClusterURL } from "../components/+add-cluster";
import { catalogURL } from "../components/+catalog";
import { attemptInstallByInfo, extensionsURL } from "../components/+extensions";
import { preferencesURL } from "../components/+preferences";
import { clusterViewURL } from "../components/cluster-manager/cluster-view.route";
import { LensProtocolRouterRenderer } from "./router";
import { navigate } from "../navigation/helpers";
import { entitySettingsURL } from "../components/+entity-settings";
import { catalogEntityRegistry } from "../api/catalog-entity-registry";
import { ClusterStore } from "../../common/cluster-store";
import { EXTENSION_NAME_MATCH, EXTENSION_PUBLISHER_MATCH, LensProtocolRouter } from "../../common/protocol-handler";
import { Notifications } from "../components/notifications";

export function bindProtocolAddRouteHandlers() {
  LensProtocolRouterRenderer
    .getInstance()
    .addInternalHandler("/preferences", ({ search: { highlight }}) => {
      navigate(preferencesURL({ fragment: highlight }));
    })
    .addInternalHandler("/", ({ tail }) => {
      if (tail) {
        Notifications.shortInfo(
          <p>
            Unknown Action for <code>lens://app/{tail}</code>.{" "}
            Are you on the latest version?
          </p>
        );
      }

      navigate(catalogURL());
    })
    .addInternalHandler("/landing", () => {
      navigate(catalogURL());
    })
    .addInternalHandler("/landing/view/:group/:kind", ({ pathname: { group, kind } }) => {
      navigate(catalogURL({
        params: {
          group, kind
        }
      }));
    })
    .addInternalHandler("/cluster", () => {
      navigate(addClusterURL());
    })
    .addInternalHandler("/entity/:entityId/settings", ({ pathname: { entityId } }) => {
      const entity = catalogEntityRegistry.getById(entityId);

      if (entity) {
        navigate(entitySettingsURL({ params: { entityId } }));
      } else {
        Notifications.shortInfo(
          <p>
            Unknown catalog entity <code>{entityId}</code>.
          </p>
        );
      }
    })
    // Handlers below are deprecated and only kept for backward compact purposes
    .addInternalHandler("/cluster/:clusterId", ({ pathname: { clusterId } }) => {
      const cluster = ClusterStore.getInstance().getById(clusterId);

      if (cluster) {
        navigate(clusterViewURL({ params: { clusterId } }));
      } else {
        Notifications.shortInfo(
          <p>
            Unknown catalog entity <code>{clusterId}</code>.
          </p>
        );
      }
    })
    .addInternalHandler("/cluster/:clusterId/settings", ({ pathname: { clusterId } }) => {
      const cluster = ClusterStore.getInstance().getById(clusterId);

      if (cluster) {
        navigate(entitySettingsURL({ params: { entityId: clusterId } }));
      } else {
        Notifications.shortInfo(
          <p>
            Unknown catalog entity <code>{clusterId}</code>.
          </p>
        );
      }
    })
    .addInternalHandler("/extensions", () => {
      navigate(extensionsURL());
    })
    .addInternalHandler(`/extensions/install${LensProtocolRouter.ExtensionUrlSchema}`, ({ pathname, search: { version } }) => {
      const name = [
        pathname[EXTENSION_PUBLISHER_MATCH],
        pathname[EXTENSION_NAME_MATCH],
      ].filter(Boolean)
        .join("/");

      navigate(extensionsURL());
      attemptInstallByInfo({ name, version, requireConfirmation: true });
    });
}
