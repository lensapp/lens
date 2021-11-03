/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import type { IToleration } from "../../../../common/k8s-api/workload-kube-object";
import { PodTolerations } from "../pod-tolerations";

jest.mock("electron", () => ({
  app: {
    getPath: () => "/foo",
  },
}));

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
  it("renders w/o errors", () => {
    const { container } = render(<PodTolerations tolerations={tolerations} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("shows all tolerations", () => {
    const { container } = render(<PodTolerations tolerations={tolerations} />);
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

  it("sorts table properly", () => {
    const { container, getByText } = render(<PodTolerations tolerations={tolerations} />);
    const headCell = getByText("Key");

    fireEvent.click(headCell);
    fireEvent.click(headCell);

    const rows = container.querySelectorAll(".TableRow");

    expect(rows[0].querySelector(".key").textContent).toBe("node.kubernetes.io/not-ready");
  });
});
