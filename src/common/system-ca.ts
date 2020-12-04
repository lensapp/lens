import { isMac, isWindows } from "./vars";
import winca from "win-ca";
import { spawnSync } from "child_process";
import https from "https";

const injectMacCA = () => {
  // inspired mac-ca (abandoned by author)
  // https://github.com/jfromaniello/mac-ca
  const args = ["find-certificate", "-a", "-p"];
  const splitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;
  const systemRootCertsPath = "/System/Library/Keychains/SystemRootCertificates.keychain";
  const trusted = spawnSync("/usr/bin/security", args).stdout.toString().split(splitPattern);
  const rootCerts = spawnSync("/usr/bin/security", args.concat(systemRootCertsPath)).stdout.toString().split(splitPattern);
  const certs = [...new Set([...trusted, ...rootCerts])];

  for (const cert of certs) {
    if (Array.isArray(https.globalAgent.options.ca)) {
      !https.globalAgent.options.ca.includes(cert) && https.globalAgent.options.ca.push(cert);
    } else {
      https.globalAgent.options.ca = [cert];
    }
  }
};

isMac && injectMacCA();
isWindows && winca.inject("+"); // see: https://github.com/ukoloff/win-ca#caveats

export { injectMacCA };
