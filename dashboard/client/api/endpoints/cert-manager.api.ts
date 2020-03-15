// Kubernetes certificate management controller apis
// Reference: https://docs.cert-manager.io/en/latest/reference/index.html
// API docs: https://docs.cert-manager.io/en/latest/reference/api-docs/index.html

import { KubeObject } from "../kube-object";
import { ISecretRef, secretsApi } from "./secret.api";
import { getDetailsUrl } from "../../navigation";
import { KubeApi } from "../kube-api";

export class Certificate extends KubeObject {
  static kind = "Certificate"

  spec: {
    secretName: string;
    commonName?: string;
    dnsNames?: string[];
    organization?: string[];
    ipAddresses?: string[];
    duration?: string;
    renewBefore?: string;
    isCA?: boolean;
    keySize?: number;
    keyAlgorithm?: "rsa" | "ecdsa";
    issuerRef: {
      kind?: string;
      name: string;
    };
    acme?: {
      config: {
        domains: string[];
        http01: {
          ingress?: string;
          ingressClass?: string;
        };
        dns01?: {
          provider: string;
        };
      }[];
    };
  }
  status: {
    conditions?: {
      lastTransitionTime: string; // 2019-06-04T07:35:58Z,
      message: string; // Certificate is up to date and has not expired,
      reason: string; // Ready,
      status: string; // True,
      type: string; // Ready
    }[];
    notAfter: string; // 2019-11-01T05:36:27Z
    lastFailureTime?: string;
  }

  getType(): string {
    const { isCA, acme } = this.spec;
    if (isCA) return "CA"
    if (acme) return "ACME"
  }

  getCommonName() {
    return this.spec.commonName || ""
  }

  getIssuerName() {
    return this.spec.issuerRef.name;
  }

  getSecretName() {
    return this.spec.secretName;
  }

  getIssuerDetailsUrl() {
    return getDetailsUrl(issuersApi.getUrl({
      namespace: this.getNs(),
      name: this.getIssuerName(),
    }))
  }

  getSecretDetailsUrl() {
    return getDetailsUrl(secretsApi.getUrl({
      namespace: this.getNs(),
      name: this.getSecretName(),
    }))
  }

  getConditions() {
    const { conditions = [] } = this.status;
    return conditions.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;
      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`
      }
    });
  }
}

export class Issuer extends KubeObject {
  static kind = "Issuer"

  spec: {
    acme?: {
      email: string;
      server: string;
      skipTLSVerify?: boolean;
      privateKeySecretRef: ISecretRef;
      solvers?: {
        dns01?: {
          cnameStrategy: string;
          acmedns?: {
            host: string;
            accountSecretRef: ISecretRef;
          };
          akamai?: {
            accessTokenSecretRef: ISecretRef;
            clientSecretSecretRef: ISecretRef;
            clientTokenSecretRef: ISecretRef;
            serviceConsumerDomain: string;
          };
          azuredns?: {
            clientID: string;
            clientSecretSecretRef: ISecretRef;
            hostedZoneName: string;
            resourceGroupName: string;
            subscriptionID: string;
            tenantID: string;
          };
          clouddns?: {
            project: string;
            serviceAccountSecretRef: ISecretRef;
          };
          cloudflare?: {
            email: string;
            apiKeySecretRef: ISecretRef;
          };
          digitalocean?: {
            tokenSecretRef: ISecretRef;
          };
          rfc2136?: {
            nameserver: string;
            tsigAlgorithm: string;
            tsigKeyName: string;
            tsigSecretSecretRef: ISecretRef;
          };
          route53?: {
            accessKeyID: string;
            hostedZoneID: string;
            region: string;
            secretAccessKeySecretRef: ISecretRef;
          };
          webhook?: {
            config: object; // arbitrary json
            groupName: string;
            solverName: string;
          };
        };
        http01?: {
          ingress: {
            class: string;
            name: string;
            serviceType: string;
          };
        };
        selector?: {
          dnsNames: string[];
          matchLabels: {
            [label: string]: string;
          };
        };
      }[];
    };
    ca?: {
      secretName: string;
    };
    vault?: {
      path: string;
      server: string;
      caBundle: string; // <base64 encoded caBundle PEM file>
      auth: {
        appRole: {
          path: string;
          roleId: string;
          secretRef: ISecretRef;
        };
      };
    };
    selfSigned?: {};
    venafi?: {
      zone: string;
      cloud?: {
        apiTokenSecretRef: ISecretRef;
      };
      tpp?: {
        url: string;
        caBundle: string; // <base64 encoded caBundle PEM file>
        credentialsRef: {
          name: string;
        };
      };
    };
  }

  status: {
    acme?: {
      uri: string;
    };
    conditions?: {
      lastTransitionTime: string; // 2019-06-05T07:10:42Z,
      message: string; // The ACME account was registered with the ACME server,
      reason: string; // ACMEAccountRegistered,
      status: string; // True,
      type: string; // Ready
    }[];
  }

  getType() {
    const { acme, ca, selfSigned, vault, venafi } = this.spec;
    if (acme) return "ACME"
    if (ca) return "CA"
    if (selfSigned) return "SelfSigned"
    if (vault) return "Vault"
    if (venafi) return "Venafi"
  }

  getConditions() {
    const { conditions = [] } = this.status;
    return conditions.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;
      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`,
      }
    });
  }
}

export class ClusterIssuer extends Issuer {
  static kind = "ClusterIssuer"
}

export const certificatesApi = new KubeApi({
  kind: Certificate.kind,
  apiBase: "/apis/certmanager.k8s.io/v1alpha1/certificates",
  isNamespaced: true,
  objectConstructor: Certificate,
});

export const issuersApi = new KubeApi({
  kind: Issuer.kind,
  apiBase: "/apis/certmanager.k8s.io/v1alpha1/issuers",
  isNamespaced: true,
  objectConstructor: Issuer,
});

export const clusterIssuersApi = new KubeApi({
  kind: ClusterIssuer.kind,
  apiBase: "/apis/certmanager.k8s.io/v1alpha1/clusterissuers",
  isNamespaced: false,
  objectConstructor: ClusterIssuer,
});
