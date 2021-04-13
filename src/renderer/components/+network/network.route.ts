import { RouteProps } from "react-router";
import { endpointRoute } from "../+network-endpoints";
import { ingressRoute } from "../+network-ingresses";
import { networkPoliciesRoute } from "../+network-policies";
import { servicesRoute, servicesURL } from "../+network-services";
import { IURLParams } from "../../../common/utils/buildUrl";

export const networkRoute: RouteProps = {
  path: [
    servicesRoute,
    endpointRoute,
    ingressRoute,
    networkPoliciesRoute
  ].map(route => route.path.toString())
};

export const networkURL = (params?: IURLParams) => servicesURL(params);
