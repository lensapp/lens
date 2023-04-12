import { Div } from "../../elements";
import { render } from "@testing-library/react";
import React from "react";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("vanilla-class-name-adapter", () => {
  it("given vanilla class name, has class name", () => {
    const rendered = render(<Div className="some-class-name" data-some-element-test />);

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("some-class-name");
  });

  it("given custom class name, has class name", () => {
    const rendered = render(<Div _className="some-class-name" data-some-element-test />);

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("some-class-name");
  });

  it("given both vanilla and custom class names, has class names", () => {
    const rendered = render(
      <Div
        className="some-vanilla-class-name"
        _className="some-class-name"
        data-some-element-test
      />,
    );

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("some-vanilla-class-name some-class-name");
  });
});
