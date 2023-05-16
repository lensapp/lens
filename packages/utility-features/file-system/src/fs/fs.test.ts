import fsInjectable from "./fs.injectable";
import { createContainer } from "@ogre-tools/injectable";
import fse from "fs-extra";

describe("fs", () => {
  it("is fs-extra", () => {
    const di = createContainer("irrelevant");

    di.register(fsInjectable);

    const fs = di.inject(fsInjectable);

    expect(fs).toBe(fse);
  });
});
