import { getPageUrl } from "../page-registry"
import { LensExtension } from "../../lens-extension"

let ext: LensExtension = null

describe("getPageUrl", () => {
  beforeEach(async () => {
    ext = new LensExtension({
      manifest: {
        name: "foo-bar",
        version: "0.1.1"
      },
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true
    })
  })

  it("returns a page url for extension", () => {
    expect(getPageUrl(ext)).toBe("/extension/foo-bar")
  })

  it("allows to pass base url as parameter", () => {
    expect(getPageUrl(ext, "/test")).toBe("/extension/foo-bar/test")
  })

  it("removes @", () => {
    ext.manifest.name = "@foo/bar"
    expect(getPageUrl(ext)).toBe("/extension/foo-bar")
  })

  it("adds / prefix", () => {
    expect(getPageUrl(ext, "test")).toBe("/extension/foo-bar/test")
  })
})
