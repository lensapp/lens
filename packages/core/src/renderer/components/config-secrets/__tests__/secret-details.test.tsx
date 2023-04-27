/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { SecretDetails } from "../secret-details";
import { Secret, SecretType } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { renderFor } from "../../test-utils/renderFor";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import hostedClusterInjectable from "../../../cluster-frame-context/hosted-cluster.injectable";
import directoryForKubeConfigsInjectable from "../../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import { Cluster } from "../../../../common/cluster/cluster";

jest.mock("../../kube-object-meta/kube-object-meta", () => ({
  KubeObjectMeta: () => null,
}));

describe("SecretDetails tests", () => {
  it("should show the visibility toggle when the secret value is ''", () => {
    const di = getDiForUnitTesting();
    const render = renderFor(di);

    di.override(directoryForUserDataInjectable, () => "/some-user-data");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    const secret = new Secret({
      apiVersion: "v1",
      kind: "secret",
      metadata: {
        name: "test",
        resourceVersion: "1",
        uid: "uid",
        namespace: "default",
        selfLink: "/api/v1/secrets/default/test",
      },
      data: {
        foobar: "",
      },
      type: SecretType.Opaque,
    });
    const result = render(<SecretDetails object={secret}/>);

    expect(result.getByTestId("foobar-secret-entry").querySelector(".Icon")).toBeDefined();
  });
});
