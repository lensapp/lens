import { addClusterURL } from "../components/+add-cluster";
import { clusterSettingsURL } from "../components/+cluster-settings";
import { extensionsURL } from "../components/+extensions";
import { landingURL } from "../components/+landing-page";
import { preferencesURL } from "../components/+preferences";
import { clusterViewURL } from "../components/cluster-manager/cluster-view.route";
import { LensProtocolRouterRenderer } from "./router";
import { navigate } from "../navigation/helpers";

export function bindProtocolAddRouteHandlers() {
  LensProtocolRouterRenderer
    .getInstance<LensProtocolRouterRenderer>()
    .addInternalHandler("/preferences", ({ search: { highlight }}) => {
      navigate(preferencesURL({ fragment: highlight }));
    })
    .addInternalHandler("/landing", () => {
      navigate(landingURL());
    })
    .addInternalHandler("/", () => {
      navigate(landingURL());
    })
    .addInternalHandler("/cluster", () => {
      navigate(addClusterURL());
    })
    .addInternalHandler("/cluster/:clusterId", ({ pathname: { clusterId } }) => {
      navigate(clusterViewURL({ params: { clusterId } }));
    })
    .addInternalHandler("/cluster/:clusterId/settings", ({ pathname: { clusterId } }) => {
      navigate(clusterSettingsURL({ params: { clusterId } }));
    })
    .addInternalHandler("/extensions", () => {
      navigate(extensionsURL());
    });
}
