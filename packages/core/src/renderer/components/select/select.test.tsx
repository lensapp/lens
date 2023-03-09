/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { SelectOption } from "./select";
import { Select } from "./select";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiContainer } from "@ogre-tools/injectable";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";

describe("<Select />", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(rendererExtensionsInjectable, () => computed(() => [] as LensRendererExtension[]));
  });

  it("should render the select", async () => {
    const options = [
      {
        label: "Option one label",
        value: "optionOneValue",
      },
      {
        label: "Option two label",
        value: "optionTwoValue",
      },
    ];

    const onChange = jest.fn();

    const { container } = render((
      <Select
        id="some-test-input"
        onChange={onChange}
        options={options}
      />
    ));

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("should show selected option", async () => {
    const options = [
      {
        label: "Option one label",
        value: "optionOneValue",
      },
      {
        label: "Option two label",
        value: "optionTwoValue",
      },
    ];

    const onChange = jest.fn();

    const { container } = render((
      <Select
        value={options[0].value}
        onChange={onChange}
        options={options}
      />
    ));
    const selectedValueContainer = container.querySelector(".Select__single-value");

    expect(selectedValueContainer?.textContent).toBe(options[0].label);
  });

  it("should reflect to change value", async () => {
    const options = [
      {
        label: "Option one label",
        value: "optionOneValue",
      },
      {
        label: "Option two label",
        value: "optionTwoValue",
      },
    ];

    const onChange = jest.fn();

    const { container, rerender } = render((
      <Select
        value={options[0].value}
        onChange={onChange}
        options={options}
      />
    ));
    const selectedValueContainer = container.querySelector(".Select__single-value");

    expect(selectedValueContainer?.textContent).toBe(options[0].label);

    rerender((
      <Select
        value={options[1].value}
        onChange={onChange}
        options={options}
      />
    ));

    expect(container.querySelector(".Select__single-value")?.textContent).toBe(options[1].label);
  });

  it("should unselect value if null is passed as a value", async () => {
    const options = [
      {
        label: "Option one label",
        value: "optionOneValue",
      },
      {
        label: "Option two label",
        value: "optionTwoValue",
      },
    ];

    const onChange = jest.fn();

    const { container, rerender } = render((
      <Select
        value={options[0].value}
        onChange={onChange}
        options={options}
      />
    ));
    const selectedValueContainer = container.querySelector(".Select__single-value");

    expect(selectedValueContainer?.textContent).toBe(options[0].label);

    rerender((
      <Select<string, SelectOption<string>>
        value={null}
        onChange={onChange}
        options={options}
      />
    ));

    expect(container.querySelector(".Select__single-value")).not.toBeInTheDocument();
  });

  it("should unselect value if undefined is passed as a value", async () => {
    const options = [
      {
        label: "Option one label",
        value: "optionOneValue",
      },
      {
        label: "Option two label",
        value: "optionTwoValue",
      },
    ];

    const onChange = jest.fn();

    const { container, rerender } = render((
      <Select
        value={options[0].value}
        onChange={onChange}
        options={options}
      />
    ));
    const selectedValueContainer = container.querySelector(".Select__single-value");

    expect(selectedValueContainer?.textContent).toBe(options[0].label);

    rerender((
      <Select<string, SelectOption<string>>
        value={undefined}
        onChange={onChange}
        options={options}
      />
    ));

    expect(container.querySelector(".Select__single-value")).not.toBeInTheDocument();
  });
});
