import { createContainer } from "@ogre-tools/injectable";
import path from "path";
import getDirnameOfPathInjectable from "./get-dirname.injectable";

describe("get-dirname", () => {
  it("is exactly dirname from path module", () => {
    const di = createContainer("irrelevant");

    di.register(getDirnameOfPathInjectable);

    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    expect(getDirnameOfPath).toBe(path.dirname);
  });
});
