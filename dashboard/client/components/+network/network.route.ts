import { RouteProps } from "react-router";
import { Network } from "./network";
import { servicesURL } from "../+network-services";
import { URLParams } from "../../navigation";

export const networkRoute: RouteProps = {
  get path() {
    return Network.tabRoutes.map(({ path }) => path).flat();
  }
};

export const networkURL = (params?: URLParams): string => servicesURL(params);
