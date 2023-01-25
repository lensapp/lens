/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { isObservable, observable } from "mobx";
import { toJS } from "../toJS";

describe("utils/toJS(data: any)", () => {
  const y = { y: 2 };

  const data = observable({ x: 1, y }, {}, {
    deep: false, // this will keep ref to "y"
  });
  const data2 = {
    x: 1,  // partially observable
    y: observable(y),
  };

  test("converts mobx-observable to corresponding js struct with links preserving", () => {
    expect(toJS(data).y).toBe(y);
    expect(isObservable(toJS(data).y)).toBeFalsy();
  });

  test("converts partially observable js struct", () => {
    expect(toJS(data2).y).not.toBe(y);
    expect(toJS(data2).y).toEqual(y);
    expect(isObservable(toJS(data2).y)).toBeFalsy();
  });
});
