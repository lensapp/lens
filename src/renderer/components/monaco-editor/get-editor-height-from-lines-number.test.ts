/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import getEditorHeightFromLinesCountInjectable from "./get-editor-height-from-lines-number.injectable";

describe("get-editor-height-from-lines-number", () => {
  let getEditorHeightFromLinesNumber: (linesNumber: number) => string;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: false });

    getEditorHeightFromLinesNumber = di.inject(getEditorHeightFromLinesCountInjectable);
  });

  it("given linesNumber is less than 10, when called, returns small", () => {
    const actual = getEditorHeightFromLinesNumber(9);

    expect(actual).toBe("small");
  });

  it("given linesNumber is equal to 10, when called, returns medium", () => {
    const actual = getEditorHeightFromLinesNumber(10);

    expect(actual).toBe("medium");
  });

  it("given linesNumber is greater than 10 and less than 20, when called, returns medium", () => {
    const actual = getEditorHeightFromLinesNumber(19);

    expect(actual).toBe("medium");
  });

  it("given linesNumber is equal to 20, when called, returns large", () => {
    const actual = getEditorHeightFromLinesNumber(20);

    expect(actual).toBe("large");
  });

  it("given linesNumber is greater than 20, when called, returns large", () => {
    const actual = getEditorHeightFromLinesNumber(21);

    expect(actual).toBe("large");
  });
});
