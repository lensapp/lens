import * as mockFs from "mock-fs"
import * as yaml from "js-yaml"

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => '99.99.99',
      getPath: () => 'tmp',
      getLocale: () => 'en'
    }
  }
})

// Console.log needs to be called before fs-mocks, see https://github.com/tschaub/mock-fs/issues/234
console.log("");

import { UserStore } from "../../../src/common/user-store"

describe("for an empty config", () => {
  beforeEach(() => {
    UserStore.resetInstance()
    const mockOpts = {
      'tmp': {
        'config.json': JSON.stringify({})
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("allows setting and retrieving lastSeenAppVersion", async () => {
    UserStore.getInstance().setLastSeenAppVersion("1.2.3");
    expect(UserStore.getInstance().lastSeenAppVersion()).toBe("1.2.3");
  })

  it("allows adding and listing seen contexts", async () => {
    UserStore.getInstance().storeSeenContext(['foo'])
    expect(UserStore.getInstance().getSeenContexts().length).toBe(1)
    UserStore.getInstance().storeSeenContext(['foo', 'bar'])
    const seenContexts = UserStore.getInstance().getSeenContexts()
    expect(seenContexts.length).toBe(2) // check 'foo' isn't added twice
    expect(seenContexts[0]).toBe('foo')
    expect(seenContexts[1]).toBe('bar')
  })

  it("allows setting and getting preferences", async () => {
    UserStore.getInstance().setPreferences({
      httpsProxy: 'abcd://defg',
    })
    const storedPreferences = UserStore.getInstance().getPreferences()
    expect(storedPreferences.httpsProxy).toBe('abcd://defg')
    expect(storedPreferences.colorTheme).toBe('dark') // defaults to dark
    UserStore.getInstance().setPreferences({
      colorTheme: 'light'
    })
    expect(UserStore.getInstance().getPreferences().colorTheme).toBe('light')
  })
})

describe("migrations", () => {
  beforeEach(() => {
    UserStore.resetInstance()
    const mockOpts = {
      'tmp': {
        'config.json': JSON.stringify({
          user: { username: 'foobar' },
          preferences: { colorTheme: 'light' },
          lastSeenAppVersion: '1.2.3'
        })
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("sets last seen app version to 0.0.0", async () => {
    expect(UserStore.getInstance().lastSeenAppVersion()).toBe('0.0.0')
  })
})
