/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import getEditorHeightFromLinesCountInjectable from "./get-editor-height-from-lines-number.injectable";

describe("get-editor-height-from-lines-number", () => {
  let getEditorHeightFromLinesNumber: (linesCount: number) => number;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    getEditorHeightFromLinesNumber = di.inject(getEditorHeightFromLinesCountInjectable);
  });

  it("given linesCount is less than 10, when called, returns small number", () => {
    const actual = getEditorHeightFromLinesNumber(9);

    expect(actual).toBe(90);
  });

  it("given linesCount is equal to 10, when called, returns medium number", () => {
    const actual = getEditorHeightFromLinesNumber(10);

    expect(actual).toBe(180);
  });

  it("given linesCount is greater than 10 and less than 20, when called, returns medium number", () => {
    const actual = getEditorHeightFromLinesNumber(19);

    expect(actual).toBe(180);
  });

  it("given linesCount is equal to 20, when called, returns large number", () => {
    const actual = getEditorHeightFromLinesNumber(20);

    expect(actual).toBe(360);
  });

  it("given linesCount is greater than 20, when called, returns large number", () => {
    const actual = getEditorHeightFromLinesNumber(21);

    expect(actual).toBe(360);
  });
});
