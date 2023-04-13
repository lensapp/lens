import React from "react";

import { Gutter, GutterProps } from "./Gutter";
import { render } from "@testing-library/react";

interface Scenario {
  name: string;
  props: GutterProps;
}

describe("Gutter", () => {
  (
    [
      { name: "when size is not set", props: {} },
      { name: "when size is sm", props: { size: "sm" } },
      { name: "when size is md", props: { size: "md" } },
      { name: "when size is xl", props: { size: "xl" } },
    ] as Scenario[]
  ).forEach((scenario) => {
    it(`"${scenario.name}", renders`, () => {
      const rendered = render(<Gutter {...scenario.props} />);

      expect(rendered.baseElement).toMatchSnapshot();
    });
  });
});
