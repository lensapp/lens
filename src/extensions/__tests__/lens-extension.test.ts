import { LensExtension } from "../lens-extension";

let ext: LensExtension = null;

describe("lens extension", () => {
  beforeEach(async () => {
    ext = new LensExtension({
      manifest: {
        name: "foo-bar",
        version: "0.1.1"
      },
      absolutePath: "/absolute/fake/",
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true
    });
  });

  describe("name", () => {
    it("returns name", () => {
      expect(ext.name).toBe("foo-bar");
    });
  });
});
