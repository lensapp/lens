/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { ConfigMapStore } from "../../config-maps/store";
import configMapStoreInjectable from "../../config-maps/store.injectable";
import type { SecretStore } from "../../config-secrets/store";
import secretStoreInjectable from "../../config-secrets/store.injectable";
import type { Container } from "@k8slens/kube-object";
import { Secret, ConfigMap, Pod, SecretType } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import { ContainerEnvironment } from "../pod-container-env";

describe("<ContainerEnv />", () => {
  let render: DiRender;
  let secretStore: jest.Mocked<Pick<SecretStore, "load" | "getByName">>;
  let configMapStore: jest.Mocked<Pick<ConfigMapStore, "load" | "getByName">>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    secretStore = ({
      load: jest.fn().mockImplementation(async () => {
        return {} as Secret;
      }),
      getByName: jest.fn(),
    });
    configMapStore = ({
      load: jest.fn().mockImplementation(async () => {
        return {} as ConfigMap;
      }),
      getByName: jest.fn(),
    });

    di.override(secretStoreInjectable, () => secretStore as jest.Mocked<SecretStore>);
    di.override(configMapStoreInjectable, () => configMapStore as jest.Mocked<ConfigMapStore>);

    render = renderFor(di);
  });

  it("renders env", () => {
    const container: Container = {
      image: "my-image",
      name: "my-first-container",
      env: [{
        name: "foobar",
        value: "https://localhost:12345",
      }],
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        selfLink: "/api/v1/pods/default/my-pod",
        uid: "1234",
      },
      spec: {
        containers: [container],
      },
    });
    const result = render(<ContainerEnvironment container={container} namespace={pod.getNs()} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders envFrom when given a configMapRef", () => {
    configMapStore.getByName.mockImplementation((name, namespace) => {
      expect(name).toBe("my-config-map");
      expect(namespace).toBe("default");

      return new ConfigMap({
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
          name: "my-config-map",
          namespace: "default",
          resourceVersion: "2",
          selfLink: "/api/v1/configmaps/default/my-config-map",
          uid: "456",
        },
        data: {
          configFoo: "configBar",
        },
      });
    });

    const container: Container = {
      image: "my-image",
      name: "my-first-container",
      envFrom: [{
        configMapRef: {
          name: "my-config-map",
        },
      }],
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        selfLink: "/api/v1/pods/default/my-pod",
        uid: "1234",
      },
      spec: {
        containers: [container],
      },
    });
    const result = render(<ContainerEnvironment container={container} namespace={pod.getNs()} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders envFrom when given a secretRef", () => {
    secretStore.getByName.mockImplementation((name, namespace) => {
      expect(name).toBe("my-secret");
      expect(namespace).toBe("default");

      return new Secret({
        apiVersion: "v1",
        kind: "Secret",
        metadata: {
          name: "my-secret",
          namespace: "default",
          resourceVersion: "3",
          selfLink: "/api/v1/secrets/default/my-secret",
          uid: "237",
        },
        type: SecretType.BasicAuth,
        data: {
          bar: "bat",
        },
      });
    });

    const container: Container = {
      image: "my-image",
      name: "my-first-container",
      envFrom: [{
        secretRef: {
          name: "my-secret",
        },
      }],
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        selfLink: "/api/v1/pods/default/my-pod",
        uid: "1234",
      },
      spec: {
        containers: [container],
      },
    });
    const result = render(<ContainerEnvironment container={container} namespace={pod.getNs()} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders env", () => {
    const container: Container = {
      image: "my-image",
      name: "my-first-container",
      env: [{
        name: "foobar",
        value: "https://localhost:12345",
      }],
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        selfLink: "/api/v1/pods/default/my-pod",
        uid: "1234",
      },
      spec: {
        containers: [container],
      },
    });
    const result = render(<ContainerEnvironment container={container} namespace={pod.getNs()} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders both env and configMapRef envFrom", () => {
    configMapStore.getByName.mockImplementation((name, namespace) => {
      expect(name).toBe("my-config-map");
      expect(namespace).toBe("default");

      return new ConfigMap({
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
          name: "my-config-map",
          namespace: "default",
          resourceVersion: "2",
          selfLink: "/api/v1/configmaps/default/my-config-map",
          uid: "456",
        },
        data: {
          configFoo: "configBar",
        },
      });
    });

    const container: Container = {
      image: "my-image",
      name: "my-first-container",
      envFrom: [{
        configMapRef: {
          name: "my-config-map",
        },
      }],
      env: [{
        name: "foobar",
        value: "https://localhost:12345",
      }],
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        selfLink: "/api/v1/pods/default/my-pod",
        uid: "1234",
      },
      spec: {
        containers: [container],
      },
    });
    const result = render(<ContainerEnvironment container={container} namespace={pod.getNs()} />);

    expect(result.baseElement).toMatchSnapshot();
  });
});
