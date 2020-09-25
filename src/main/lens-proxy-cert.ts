import *  as path from "path"
import * as fs from "fs"
import * as selfsigned from "selfsigned"
import logger from "./logger"

export type SelfSignedCert = {
  private: string;
  public: string;
  cert: string;
}

let selfSignedCertificate: SelfSignedCert = null

export function getProxyCertificate(): SelfSignedCert {
  if (selfSignedCertificate == null) {
    const attrs = [{ name: "commonName", value: "localhost"}]
    selfSignedCertificate = selfsigned.generate(attrs, {
      keySize: 2048,
      algorithm: "sha256",
      days: 365,
      extensions: [{ name: 'basicConstraints', cA: true }]
    }) as SelfSignedCert
    console.log(selfSignedCertificate)
  }

  return selfSignedCertificate
}
