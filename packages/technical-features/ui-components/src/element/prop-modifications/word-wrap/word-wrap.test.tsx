import React from "react";
import { Div } from "../../elements";
import { render } from "@testing-library/react";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("word-wrap", () => {
  it("given word wrap wit, renders with class name", () => {
    const rendered = render(
      <Div _wordWrap _className={["some-class-name"]} data-some-element-test />,
    );

    const discover = discoverFor(() => rendered);

    const { discovered } = discover.getSingleElement("some-element");

    expect(discovered.className).toBe("overflow-hidden text-ellipsis some-class-name");
  });
});
