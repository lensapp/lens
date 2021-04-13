import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { getAppVersion } from "../../common/utils";

class VersionRoute extends LensApi {
  public async getVersion(request: LensApiRequest) {
    const { response } = request;

    this.respondJson(response, { version: getAppVersion()}, 200);
  }
}

export const versionRoute = new VersionRoute();
