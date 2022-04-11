/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ClusterRoleBindingDialog } from "../dialog";
import { ClusterRole } from "../../../../../common/k8s-api/endpoints";
import userEvent from "@testing-library/user-event";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import clusterRoleStoreInjectable from "../../+cluster-roles/store.injectable";
import createStoresAndApisInjectable from "../../../../create-stores-apis.injectable";

describe("ClusterRoleBindingDialog tests", () => {
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(createStoresAndApisInjectable, () => true);

    await di.runSetups();

    render = renderFor(di);

    const store = di.inject(clusterRoleStoreInjectable);

    store.items.replace([
      new ClusterRole({
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          name: "foobar",
          resourceVersion: "1",
          uid: "1",
          selfLink: "/apis/rbac.authorization.k8s.io/v1/clusterroles/foobar",
        },
      }),
    ]);
  });

  afterEach(() => {
    ClusterRoleBindingDialog.close();
    jest.resetAllMocks();
  });

  it("should render without any errors", () => {
    const { container } = render(<ClusterRoleBindingDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("clusterrole select should be searchable", async () => {
    ClusterRoleBindingDialog.open();
    const res = render(<ClusterRoleBindingDialog />);

    userEvent.keyboard("a");
    await res.findAllByText("foobar");
  });
});
