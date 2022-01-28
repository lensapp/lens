/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { SecretDetails } from "../details";
import { Secret, SecretType } from "../../../../common/k8s-api/endpoints";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import lookupApiLinkInjectable from "../../../../common/k8s-api/lookup-api-link.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import getStatusItemsForKubeObjectInjectable from "../../kube-object-status-icon/status-items-for-object.injectable";
import localeTimezoneInjectable from "../../locale-date/locale-timezone.injectable";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import { computed } from "mobx";

describe("SecretDetails tests", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);
    di.override(lookupApiLinkInjectable, () => () => "");
    di.override(localeTimezoneInjectable, () => computed(() => "Europe/Helsinki"));
    di.override(getStatusItemsForKubeObjectInjectable, () => () => []);
  });

  it("should show the visibility toggle when the secret value is ''", () => {
    const secret = new Secret({
      apiVersion: "v1",
      kind: "secret",
      metadata: {
        name: "test",
        resourceVersion: "1",
        uid: "uid",
        creationTimestamp: "",
        selfLink: "",
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
