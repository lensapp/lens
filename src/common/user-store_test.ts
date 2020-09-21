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

import { UserStore, Keycloak } from "./user-store"
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

    it("correctly resets theme to default value", () => {
      const us = UserStore.getInstance<UserStore>();

      us.preferences.colorTheme = "some other theme";
      us.resetTheme();
      expect(us.preferences.colorTheme).toBe(UserStore.defaultTheme);
    })

    it("correctly calculates if the last seen version is an old release", () => {
      const us = UserStore.getInstance<UserStore>();

      expect(us.isNewVersion).toBe(true);

      us.lastSeenAppVersion = (new SemVer(electron.app.getVersion())).inc("major").format();
      expect(us.isNewVersion).toBe(false);
    })

    it("allows setting and retrieving keycloak", () => {
      const us = UserStore.getInstance<UserStore>();

      us.keycloak.idToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2MDAzNDc4NzUsImV4cCI6MTYzMTg4Mzg3NSwiYXVkIjoia2FhcyIsInN1YiI6Ijc5ZTEzZGU1LTEwYzgtNGEwNC04ZmEwLWI1OWExYmIzMjIyZiIsImlhbV9yb2xlcyI6WyJtOmthYXNAd3JpdGVyIiwibTprYWFzQHJlYWRlciJdLCJqdGkiOiJlYjNlODY2MC02ZjU0LTRlMTUtOTg3YS01MGIzYjU1MmZmMTIiLCJ0eXAiOiJJRCIsImF6cCI6ImthYXMiLCJlbWFpbF92ZXJpZmllZCI6ImZhbHNlIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYm9iIn0.e3xt3tCNQcxy5flfaQ663KzdBLrMV5gMTt537U4pCo4";
      expect(us.keycloak.idToken).toBe("1.2.3");

      us.keycloak.expiresIn = "1631883875";
      expect(us.keycloak.idToken).toBe("1631883875");

      var myKeycloak: {accessToken: "a new dummy access token", idToken: "a new dummy id token", refreshToken: "a new dummy refresg token", expiresIn: "1111", refresExpiresIn: "2222"};
      us.setTokenDetails(myKeycloak);
      expect(us.keycloak).toBe(myKeycloak);
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