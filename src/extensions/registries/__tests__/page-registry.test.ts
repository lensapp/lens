import { getPageUrl, globalPageRegistry } from "../page-registry"
import { LensExtension } from "../../lens-extension"
import React from "react";

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

describe("globalPageRegistry", () => {
  beforeEach(async () => {
    ext = new LensExtension({
      manifest: {
        name: "@acme/foo-bar",
        version: "0.1.1"
      },
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true
    })
    globalPageRegistry.add([
      {
        id: "test-page",
        components: {
          Page: () => React.createElement('Text')
        }
      },
      {
        id: "another-page",
        components: {
          Page: () => React.createElement('Text')
        }
      },
    ], ext)
  })

  describe("getByPageMenuTarget", () => {
    it("returns matching page", () => {
      const page = globalPageRegistry.getByPageMenuTarget({
        pageId: "test-page",
        extensionId: ext.name
      })
      expect(page.id).toEqual("test-page")
    })

    it("returns null if target not found", () => {
      const page = globalPageRegistry.getByPageMenuTarget({
        pageId: "wrong-page",
        extensionId: ext.name
      })
      expect(page).toBeNull()
    })
  })
})
