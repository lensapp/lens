/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import userEvent from "@testing-library/user-event";
import React from "react";
import { clusterRolesStore } from "../../+cluster-roles/store";
import { ClusterRole } from "../../../../../common/k8s-api/endpoints";
import { RoleBindingDialog } from "../dialog";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import directoryForUserDataInjectable
  from "../../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";

jest.mock("../../+cluster-roles/store");

describe("RoleBindingDialog tests", () => {
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await di.runSetups();

    render = renderFor(di);

    clusterRolesStore.items.replace([
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
    RoleBindingDialog.close();
    jest.resetAllMocks();
  });

  it("should render without any errors", () => {
    const { container } = render(<RoleBindingDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("role select should be searchable", async () => {
    RoleBindingDialog.open();
    const res = render(<RoleBindingDialog />);

    userEvent.click(await res.findByText("Select role", { exact: false }));

    await res.findAllByText("foobar", {
      exact: false,
    });
  });
});
