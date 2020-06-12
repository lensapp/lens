import { split } from "../arrays";

describe("split array on element tests", () => {
  test("empty array", () => {
    expect(split([], 10)).toStrictEqual([[], [], false]);
  });

  test("one element, not in array", () => {
    expect(split([1], 10)).toStrictEqual([[1], [], false]);
  });

  test("ten elements, not in array", () => {
    expect(split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10)).toStrictEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [], false]);
  });

  test("one elements, in array", () => {
    expect(split([1], 1)).toStrictEqual([[], [], true]);
  });
  
  test("ten elements, in front array", () => {
    expect(split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0)).toStrictEqual([[], [1, 2, 3, 4, 5, 6, 7, 8, 9], true]);
  });

  test("ten elements, in middle array", () => {
    expect(split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 4)).toStrictEqual([[0, 1, 2, 3], [5, 6, 7, 8, 9], true]);
  });

  test("ten elements, in end array", () => {
    expect(split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 9)).toStrictEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8], [], true]);
  });
});