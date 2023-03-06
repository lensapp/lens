import windowLocationInjectable from "../../common/k8s-api/window-location.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";
import rendererLogFileIdInjectable from "./renderer-log-file-id.injectable";

describe("renderer log file id", () => {

  it("clearly names log for renderer main frame", () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: false });
    di.override(currentlyInClusterFrameInjectable, () => false);

    const mainFileId = di.inject(rendererLogFileIdInjectable);
    expect(mainFileId).toBe("renderer-main");
  });

  it("includes cluster id in renderer log file names", () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: false });

    di.override(currentlyInClusterFrameInjectable, () => true);
    di.override(windowLocationInjectable, () => ({
      host: "some-cluster.lens.app",
      port: "irrelevant",
    }));
    const clusterFileId = di.inject(rendererLogFileIdInjectable);
    expect(clusterFileId).toBe("renderer-cluster-some-cluster");
  });
});
