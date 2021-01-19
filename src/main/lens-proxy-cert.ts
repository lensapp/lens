import * as selfsigned from "selfsigned";

export type SelfSignedCert = {
  private: string;
  public: string;
  cert: string;
};

let selfSignedCertificate: SelfSignedCert = null;

export function getProxyCertificate(): SelfSignedCert {
  if (selfSignedCertificate == null) {
    const opts = [
      { name: "commonName", value: "Lens Certificate Authority" },
      { name: "organizationName", value: "Lens" },
    ];

    selfSignedCertificate = selfsigned.generate(opts, {
      keySize: 2048,
      algorithm: "sha256",
      days: 365,
      extensions: [
        { name: "basicConstraints", cA: true },
        { name: "subjectAltName", altNames: [
          { type: 2, value: "*.localhost" },
          { type: 2, value: "localhost" },
          { type: 7, ip: "127.0.0.1" },
        ] }
      ]
    }) as SelfSignedCert;

    console.log(selfSignedCertificate);
  }

  return selfSignedCertificate;
}
