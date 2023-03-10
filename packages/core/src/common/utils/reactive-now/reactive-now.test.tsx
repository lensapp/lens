/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { IComputedValue } from "mobx";
import { computed, observe } from "mobx";
import React from "react";
import { observer } from "mobx-react";
import { reactiveNow } from "./reactive-now";
import { advanceFakeTime, testUsingFakeTime } from "../../../test-utils/use-fake-time";

describe("reactiveNow", () => {
  let someComputed: IComputedValue<boolean>;

  beforeEach(() => {
    testUsingFakeTime("2015-10-21T07:28:00Z");

    someComputed = computed(() => {
      const currentTimestamp = reactiveNow();

      return currentTimestamp > new Date("2015-10-21T07:28:00Z").getTime();
    });
  });

  describe("react-context", () => {
    let rendered: RenderResult;

    beforeEach(() => {
      const TestComponent = observer(
        ({ someComputed }: { someComputed: IComputedValue<boolean> }) => (
          <div>{someComputed.get() ? "true" : "false"}</div>
        ),
      );

      rendered = render(<TestComponent someComputed={someComputed} />);
    });

    it("given time passes, works", () => {
      advanceFakeTime(1000);

      expect(rendered.container.textContent).toBe("true");
    });

    it("does not share the state from previous test", () => {
      expect(rendered.container.textContent).toBe("false");
    });
  });

  describe("non-react-context", () => {
    let actual: boolean;

    beforeEach(() => {
      observe(someComputed, (changed) => {
        actual = changed.newValue as boolean;
      }, true);
    });

    it("given time passes, works", () => {
      advanceFakeTime(1000);

      expect(actual).toBe(true);
    });

    it("does not share the state from previous test", () => {
      expect(actual).toBe(false);
    });
  });
});
