/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";
import type { IToleration } from "../../../../common/k8s-api/workload-kube-object";
import { PodTolerations } from "../tolerations";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";

const tolerations: IToleration[] =[
  {
    key: "CriticalAddonsOnly",
    operator: "Exist",
    effect: "NoExecute",
    tolerationSeconds: 3600,
  },
  {
    key: "node.kubernetes.io/not-ready",
    operator: "NoExist",
    effect: "NoSchedule",
    tolerationSeconds: 7200,
  },
];

describe("<PodTolerations />", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);
  });

  it("renders w/o errors", () => {
    const { container } = render(<PodTolerations tolerations={tolerations} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("shows all tolerations", async () => {
    const { container, findByTestId } = render(<PodTolerations tolerations={tolerations} />);

    await findByTestId("pod-tolerations-table"); // assert that the table has finally rendered

    const rows = container.querySelectorAll(".TableRow");

    expect(rows[0].querySelector(".key").textContent).toBe("CriticalAddonsOnly");
    expect(rows[0].querySelector(".operator").textContent).toBe("Exist");
    expect(rows[0].querySelector(".effect").textContent).toBe("NoExecute");
    expect(rows[0].querySelector(".seconds").textContent).toBe("3600");

    expect(rows[1].querySelector(".key").textContent).toBe("node.kubernetes.io/not-ready");
    expect(rows[1].querySelector(".operator").textContent).toBe("NoExist");
    expect(rows[1].querySelector(".effect").textContent).toBe("NoSchedule");
    expect(rows[1].querySelector(".seconds").textContent).toBe("7200");
  });

  it("sorts table properly", async () => {
    const { container, findByText } = render(<PodTolerations tolerations={tolerations} />);
    const headCell = await findByText("Key");

    fireEvent.click(headCell);
    fireEvent.click(headCell);

    const rows = container.querySelectorAll(".TableRow");

    expect(rows[0].querySelector(".key").textContent).toBe("node.kubernetes.io/not-ready");
  });
});
