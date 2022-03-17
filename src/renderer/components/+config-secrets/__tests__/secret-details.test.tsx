/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { render } from "@testing-library/react";
import { SecretDetails } from "../secret-details";
import { Secret, SecretType } from "../../../../common/k8s-api/endpoints";

jest.mock("../../kube-object-meta/kube-object-meta");


describe("SecretDetails tests", () => {
  it("should show the visibility toggle when the secret value is ''", () => {
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
