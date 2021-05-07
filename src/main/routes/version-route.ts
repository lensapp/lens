import { LensApiRequest } from "../router";
import { respondJson } from "../utils/http-responses";
import { getAppVersion } from "../../common/utils";

export class VersionRoute {
  static async getVersion(request: LensApiRequest) {
    const { response } = request;

    respondJson(response, { version: getAppVersion()}, 200);
  }
}
