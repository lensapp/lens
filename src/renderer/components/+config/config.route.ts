import { RouteProps } from "react-router";
import { IURLParams } from "../../../common/utils/buildUrl";
import { configMapsRoute, configMapsURL } from "../+config-maps/config-maps.route";
import { hpaRoute } from "../+config-autoscalers";
import { limitRangesRoute } from "../+config-limit-ranges";
import { pdbRoute } from "../+config-pod-disruption-budgets";
import { resourceQuotaRoute } from "../+config-resource-quotas";
import { secretsRoute } from "../+config-secrets";

export const configRoute: RouteProps = {
  path: [
    configMapsRoute,
    secretsRoute,
    resourceQuotaRoute,
    limitRangesRoute,
    hpaRoute,
    pdbRoute
  ].map(route => route.path.toString())
};

export const configURL = (params?: IURLParams) => configMapsURL(params);
