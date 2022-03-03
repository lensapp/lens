/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { Select } from "./select";
import { UserStore } from "../../../common/user-store";
import { ThemeStore } from "../../theme.store";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import { DiRender, renderFor } from "../test-utils/renderFor";
import mockFs from "mock-fs";
import directoryForUserDataInjectable
  from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";

describe("<Select />", () => {
  let di: DependencyInjectionContainer;
  let render: DiRender;

  beforeEach(async () => {

    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = renderFor(di);

    mockFs();

    await di.runSetups();
    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(rendererExtensionsInjectable, () => computed(() => [] as LensRendererExtension[]));

    ThemeStore.createInstance();
    UserStore.createInstance();
  });

  afterEach(() => {
    ThemeStore.resetInstance();
    UserStore.resetInstance();

    mockFs.restore();
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

    const { container } = render(<Select onChange={onChange} options={options} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });
});
