/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computeRuleDeclarations, Ingress } from "../endpoints";

describe("computeRuleDeclarations", () => {
  it("given no tls field, should format links as http://", () => {
    const ingress = new Ingress({
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: "foo",
        resourceVersion: "1",
        uid: "bar",
        namespace: "default",
        selfLink: "/apis/networking.k8s.io/v1/ingresses/default/foo",
      },
    });

    const result = computeRuleDeclarations(ingress, {
      host: "foo.bar",
      http: {
        paths: [{
          pathType: "Exact",
          backend: {
            service: {
              name: "my-service",
              port: {
                number: 8080,
              },
            },
          },
        }],
      },
    });

    expect(result[0].url).toBe("http://foo.bar/");
  });

  it("given no tls entries, should format links as http://", () => {
    const ingress = new Ingress({
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: "foo",
        resourceVersion: "1",
        uid: "bar",
        namespace: "default",
        selfLink: "/apis/networking.k8s.io/v1/ingresses/default/foo",
      },
    });

    ingress.spec = {
      tls: [],
    };

    const result = computeRuleDeclarations(ingress, {
      host: "foo.bar",
      http: {
        paths: [{
          pathType: "Exact",
          backend: {
            service: {
              name: "my-service",
              port: {
                number: 8080,
              },
            },
          },
        }],
      },
    });

    expect(result[0].url).toBe("http://foo.bar/");
  });

  it("given some tls entries, should format links as https://", () => {
    const ingress = new Ingress({
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: "foo",
        resourceVersion: "1",
        uid: "bar",
        namespace: "default",
        selfLink: "/apis/networking.k8s.io/v1/ingresses/default/foo",
      },
    });

    ingress.spec = {
      tls: [{
        secretName: "my-secret",
      }],
    };

    const result = computeRuleDeclarations(ingress, {
      host: "foo.bar",
      http: {
        paths: [{
          pathType: "Exact",
          backend: {
            service: {
              name: "my-service",
              port: {
                number: 8080,
              },
            },
          },
        }],
      },
    });

    expect(result[0].url).toBe("https://foo.bar/");
  });
});
