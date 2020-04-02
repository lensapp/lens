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

import { userStore, User, UserPreferences, UserStore } from "../../../src/common/user-store"

describe("for an empty config", () => {
  beforeEach(() => {
    UserStore.resetInstance()
    const mockOpts = {
      'tmp': {
        'config.json': JSON.stringify({})
      }
    }
    mockFs(mockOpts)
    const userStore = UserStore.getInstance()
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("allows setting and retrieving lastSeenAppVersion", async () => {
    userStore.setLastSeenAppVersion("1.2.3");
    expect(userStore.lastSeenAppVersion()).toBe("1.2.3");
  })

  it("allows adding and listing seen contexts", async () => {
    userStore.storeSeenContext(['foo'])
    expect(userStore.getSeenContexts().length).toBe(1)
    userStore.storeSeenContext(['foo', 'bar'])
    const seenContexts = userStore.getSeenContexts()
    expect(seenContexts.length).toBe(2) // check 'foo' isn't added twice
    expect(seenContexts[0]).toBe('foo')
    expect(seenContexts[1]).toBe('bar')
  })

  it("allows setting and getting preferences", async () => {
    userStore.setPreferences({
      httpsProxy: 'abcd://defg',
    })
    const storedPreferences = userStore.getPreferences()
    expect(storedPreferences.httpsProxy).toBe('abcd://defg')
    expect(storedPreferences.colorTheme).toBe('dark') // defaults to dark
    userStore.setPreferences({
      colorTheme: 'light'
    })
    expect(userStore.getPreferences().colorTheme).toBe('light')
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
    const userStore = UserStore.getInstance()
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("sets last seen app version to 0.0.0", async () => {
    expect(userStore.lastSeenAppVersion()).toBe('0.0.0')
  })
})
