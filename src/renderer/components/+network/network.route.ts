import { RouteProps } from "react-router"
import { Network } from "./network";
import { servicesURL } from "../+network-services";
import { IURLParams } from "../../../common/utils/buildUrl";

export const networkRoute: RouteProps = {
  get path() {
    return Network.tabRoutes.map(({ path }) => path).flat()
  }
}

export const networkURL = (params?: IURLParams) => servicesURL(params);
