import { RouteProps } from "react-router";
import { Config } from "./config";
import { IURLParams } from "../../../common/utils/buildUrl";
import { configMapsURL } from "../+config-maps/config-maps.route";

export const configRoute: RouteProps = {
  get path() {
    return Config.tabRoutes.map(({ path }) => path).flat()
  }
}

export const configURL = (params?: IURLParams) => configMapsURL(params);
