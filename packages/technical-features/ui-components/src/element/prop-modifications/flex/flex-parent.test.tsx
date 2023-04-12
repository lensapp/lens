import { Div } from "../../elements";
import { render } from "@testing-library/react";
import React from "react";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("flexParent", () => {
  it("given flex parent without specific configuration, renders", () => {
    const rendered = render(<Div _flexParent data-some-element-test />);

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("flex");
  });

  it("given flex parent prop with false, renders", () => {
    const rendered = render(<Div _flexParent={false} data-some-element-test />);

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("");
  });

  it("given flex parent with aligning child vertically center, renders", () => {
    const rendered = render(
      <Div _flexParent={{ centeredVertically: true }} data-some-element-test />,
    );

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("flex align-center");
  });

  it("given flex parent with explicitly not aligning child vertically center, renders", () => {
    const rendered = render(
      <Div _flexParent={{ centeredVertically: false }} data-some-element-test />,
    );

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("flex");
  });
});
