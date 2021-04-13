import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { BottomBar } from "./bottom-bar";
jest.mock("../../../extensions/registries");
import { statusBarRegistry } from "../../../extensions/registries";

describe("<BottomBar />", () => {

  it("renders w/o errors", () => {
    const { container } = render(<BottomBar />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders w/o errors when .getItems() returns unexpected (not type complient) data", async () => {
    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => undefined);
    expect(() => render(<BottomBar />)).not.toThrow();
    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => "hello");
    expect(() => render(<BottomBar />)).not.toThrow();
    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => 6);
    expect(() => render(<BottomBar />)).not.toThrow();
    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => null);
    expect(() => render(<BottomBar />)).not.toThrow();
    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => []);
    expect(() => render(<BottomBar />)).not.toThrow();
    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => [{}]);
    expect(() => render(<BottomBar />)).not.toThrow();
    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => { return {};});
    expect(() => render(<BottomBar />)).not.toThrow();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", async () => {
    const testId = "testId";
    const text = "heee";

    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => [
      { item: <span data-testid={testId} >{text}</span> }
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(await getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", async () => {
    const testId = "testId";
    const text = "heee";

    statusBarRegistry.getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <span data-testid={testId} >{text}</span> }
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(await getByTestId(testId)).toHaveTextContent(text);
  });
});
