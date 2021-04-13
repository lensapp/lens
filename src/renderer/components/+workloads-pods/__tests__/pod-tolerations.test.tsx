import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import { IToleration } from "../../../api/workload-kube-object";
import { PodTolerations } from "../pod-tolerations";

const tolerations: IToleration[] =[
  {
    key: "CriticalAddonsOnly",
    operator: "Exist",
    effect: "NoExecute",
    tolerationSeconds: 3600
  },
  {
    key: "node.kubernetes.io/not-ready",
    operator: "NoExist",
    effect: "NoSchedule",
    tolerationSeconds: 7200
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
