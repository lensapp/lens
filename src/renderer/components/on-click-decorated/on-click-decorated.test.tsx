/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { OpenLensButton } from "../button";
import React from "react";
import { fireEvent } from "@testing-library/dom";
import type { RenderResult } from "@testing-library/react";
import { onClickDecoratorInjectionToken } from "./on-click-decorator-injection-token";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { OnClickDecorated } from "./on-click-decorated";

describe("<OnClickDecorated />", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = renderFor(di);
  });

  it("given A -element", () => {
    const rendered = render(
      <OnClickDecorated
        tagName="a"
        onClick={() => {}}
        data-testid="some-anchor"
      />,
    );

    expect(rendered.baseElement).toMatchSnapshot();
  });


  describe("given button", () => {
    let onClickMock: jest.Mock;
    let firstHigherOrderFunctionMock: jest.Mock;
    let secondHigherOrderFunctionMock: jest.Mock;
    let rendered: RenderResult;

    beforeEach(() => {
      onClickMock = jest.fn();
      firstHigherOrderFunctionMock = jest.fn((x) => x);
      secondHigherOrderFunctionMock = jest.fn((x) => x);

      const someInjectable = getInjectable({
        id: "some-injectable",

        instantiate: () => ({
          onClick: firstHigherOrderFunctionMock,
        }),

        injectionToken: onClickDecoratorInjectionToken,
      });

      const someOtherInjectable = getInjectable({
        id: "some-other-injectable",

        instantiate: () => ({
          onClick: secondHigherOrderFunctionMock,
        }),

        injectionToken: onClickDecoratorInjectionToken,
      });

      di.register(someInjectable, someOtherInjectable);

      rendered = render(
        <OpenLensButton
          primary
          label="Add Custom Helm Repo"
          onClick={onClickMock}
          data-testid="add-custom-helm-repo-button"
        />,
      );
    });

    describe("when button is clicked", () => {
      beforeEach(() => {
        fireEvent.click(rendered.getByTestId("add-custom-helm-repo-button"));
      });

      it("calls the original onClick", () => {
        expect(onClickMock).toHaveBeenCalled();
      });

      it("calls the original onClick with an argument", () => {
        expect(onClickMock).toHaveBeenCalledWith(expect.any(Object));
      });

      it("calls the first higher order function", () => {
        expect(firstHigherOrderFunctionMock).toHaveBeenCalled();
      });

      it("calls the second higher order function", () => {
        expect(secondHigherOrderFunctionMock).toHaveBeenCalled();
      });
    });
  });
});
