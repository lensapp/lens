import { addClusterURL } from "../components/+add-cluster";
import { extensionsURL } from "../components/+extensions";
import { catalogURL } from "../components/+catalog";
import { preferencesURL } from "../components/+preferences";
import { clusterViewURL } from "../components/cluster-manager/cluster-view.route";
import { LensProtocolRouterRenderer } from "./router";
import { navigate } from "../navigation/helpers";
import { clusterStore } from "../../common/cluster-store";
import { entitySettingsURL } from "../components/+entity-settings";
import { catalogEntityRegistry } from "../api/catalog-entity-registry";

export function bindProtocolAddRouteHandlers() {
  LensProtocolRouterRenderer
    .getInstance<LensProtocolRouterRenderer>()
    .addInternalHandler("/preferences", ({ search: { highlight }}) => {
      navigate(preferencesURL({ fragment: highlight }));
    })
    .addInternalHandler("/", () => {
      navigate(catalogURL());
    })
    .addInternalHandler("/landing", () => {
      navigate(catalogURL());
    })
    .addInternalHandler("/cluster", () => {
      navigate(addClusterURL());
    })
    .addInternalHandler("/entity/:entityId/settings", ({ pathname: { entityId } }) => {
      const entity = catalogEntityRegistry.getById(entityId);

      if (entity) {
        navigate(entitySettingsURL({ params: { entityId } }));
      } else {
        console.log("[APP-HANDLER]: catalog entity with given ID does not exist", { entityId });
      }
    })
    .addInternalHandler("/extensions", () => {
      navigate(extensionsURL());
    })
    // Handlers below are deprecated and only kept for backward compat purposes
    .addInternalHandler("/cluster/:clusterId", ({ pathname: { clusterId } }) => {
      const cluster = clusterStore.getById(clusterId);

      if (cluster) {
        navigate(clusterViewURL({ params: { clusterId } }));
      } else {
        console.log("[APP-HANDLER]: cluster with given ID does not exist", { clusterId });
      }
    })
    .addInternalHandler("/cluster/:clusterId/settings", ({ pathname: { clusterId } }) => {
      const cluster = clusterStore.getById(clusterId);

      if (cluster) {
        navigate(entitySettingsURL({ params: { entityId: clusterId } }));
      } else {
        console.log("[APP-HANDLER]: cluster with given ID does not exist", { clusterId });
      }
    });
}
