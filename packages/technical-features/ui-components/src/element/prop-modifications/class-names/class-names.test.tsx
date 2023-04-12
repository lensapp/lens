import { Div } from "../../elements";
import { render } from "@testing-library/react";
import React from "react";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("class-names", () => {
  it("given complex class names, renders with class name", () => {
    const rendered = render(
      <Div
        _className={[
          "some-class-name",

          {
            "some-not-present-class-name": false,
            "some-present-class-name": true,
          },

          ["first-class-name-in-array", "second-class-name-in-array"],
          undefined,
          false,
        ]}
        data-some-element-test
      />,
    );

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe(
      "some-class-name some-present-class-name first-class-name-in-array second-class-name-in-array",
    );
  });

  it("given minimal class name, renders with class name", () => {
    const rendered = render(<Div _className="some-class-name" data-some-element-test />);

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("some-class-name");
  });

  it("given complex class names leading to class name not being present, renders without class name", () => {
    const rendered = render(
      <Div _className={[{ some: false }, [undefined, false]]} data-some-element-test />,
    );

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered).not.toHaveAttribute('class');
  });
});
