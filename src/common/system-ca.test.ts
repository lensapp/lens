import https from "https";
import { injectMacCA } from "./system-ca";
import { dependencies, devDependencies } from "../../package.json";

describe("injectMacCA()", () => {

  // for reset https.globalAgent.options.ca after testing
  let _ca: string | Buffer | (string | Buffer)[];

  beforeEach(() => {
    _ca = https.globalAgent.options.ca;
  });

  afterEach(() => {
    https.globalAgent.options.ca = _ca;
  });

  const deps = { ...dependencies, ...devDependencies };

  // skip the test if mac-ca is not installed
  (deps["mac-ca"] ? it: it.skip)("should inject the same ca as mac-ca", async () => {
    injectMacCA();
    const injected = https.globalAgent.options.ca;

    await import("mac-ca");
    const injectedByMacCA = https.globalAgent.options.ca;

    // @ts-ignore
    expect(new Set(injected)).toEqual(new Set(injectedByMacCA));
  });
});
