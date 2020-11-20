import mockFs from "mock-fs"

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => '99.99.99',
      getPath: () => 'tmp',
      getLocale: () => 'en'
    }
  }
})

import { UserStore } from "../user-store"
import { SemVer } from "semver"
import electron from "electron"

describe("user store tests", () => {
  describe("for an empty config", () => {
    beforeEach(() => {
      UserStore.resetInstance()
      mockFs({ tmp: { 'config.json': "{}" } })
    })

    afterEach(() => {
      mockFs.restore()
    })

    it("allows setting and retrieving lastSeenAppVersion", () => {
      const us = UserStore.getInstance<UserStore>();

      us.lastSeenAppVersion = "1.2.3";
      expect(us.lastSeenAppVersion).toBe("1.2.3");
    })

    it("allows adding and listing seen contexts", () => {
      const us = UserStore.getInstance<UserStore>();

      us.seenContexts.add('foo')
      expect(us.seenContexts.size).toBe(1)

      us.seenContexts.add('foo')
      us.seenContexts.add('bar')
      expect(us.seenContexts.size).toBe(2) // check 'foo' isn't added twice
      expect(us.seenContexts.has('foo')).toBe(true)
      expect(us.seenContexts.has('bar')).toBe(true)
    })

    it("allows setting and getting preferences", () => {
      const us = UserStore.getInstance<UserStore>();

      us.preferences.httpsProxy = 'abcd://defg';

      expect(us.preferences.httpsProxy).toBe('abcd://defg')
      expect(us.preferences.colorTheme).toBe(UserStore.defaultTheme)

      us.preferences.colorTheme = "light";
      expect(us.preferences.colorTheme).toBe('light')
    })

    it("correctly resets theme to default value", async () => {
      const us = UserStore.getInstance<UserStore>();
      us.isLoaded = true;

      us.preferences.colorTheme = "some other theme";
      await us.resetTheme();
      expect(us.preferences.colorTheme).toBe(UserStore.defaultTheme);
    })

    it("correctly calculates if the last seen version is an old release", () => {
      const us = UserStore.getInstance<UserStore>();

      expect(us.isNewVersion).toBe(true);

      us.lastSeenAppVersion = (new SemVer(electron.app.getVersion())).inc("major").format();
      expect(us.isNewVersion).toBe(false);
    })
  })

  describe("migrations", () => {
    beforeEach(() => {
      UserStore.resetInstance()
      mockFs({
        'tmp': {
          'config.json': JSON.stringify({
            user: { username: 'foobar' },
            preferences: { colorTheme: 'light' },
            lastSeenAppVersion: '1.2.3'
          })
        }
      })
    })

    afterEach(() => {
      mockFs.restore()
    })

    it("sets last seen app version to 0.0.0", () => {
      const us = UserStore.getInstance<UserStore>();

      expect(us.lastSeenAppVersion).toBe('0.0.0')
    })
  })
})