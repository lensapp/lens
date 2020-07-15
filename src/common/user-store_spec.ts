import mockFs from "mock-fs"
import { userStore, UserStore } from "./user-store"

// Console.log needs to be called before fs-mocks, see https://github.com/tschaub/mock-fs/issues/234
console.log("");

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
        })
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("sets last seen app version to 0.0.0", async () => {
    expect(userStore.lastSeenAppVersion()).toBe('0.0.0')
  })
})
