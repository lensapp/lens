import { getInjectable } from "@ogre-tools/injectable";
import navigateToEntitySettingsInjectable from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { navigateToPreferencesOfMetricsInjectionToken } from "@k8slens/metrics";

const navigateToPreferencesOfMetricsInjectable = getInjectable({
  id: "navigate-to-preferences-of-metrics",

  instantiate: (di) => {
    const cluster = di.inject(hostedClusterInjectable);

    const navigateToEntitySettings = di.inject(
      navigateToEntitySettingsInjectable
    );

    if (!cluster?.id) {
      throw new Error(
        "Tried to inject way to navigate to preferences, but unnaturally no related cluster was available."
      );
    }

    return () => navigateToEntitySettings(cluster.id, "metrics");
  },

  injectionToken: navigateToPreferencesOfMetricsInjectionToken,
});

export default navigateToPreferencesOfMetricsInjectable;
