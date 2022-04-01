/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { cloneDeep } from "lodash";
import { getSorted } from "../sorting";

describe("Table tests", () => {
  describe("getSorted", () => {
    it.each([undefined, 5, "", true, {}, []])("should not sort since %j is not a function", () => {
      expect(getSorted([1, 2, 4, 3], undefined, "asc")).toStrictEqual([1, 2, 4, 3]);
    });

    it("should sort numerically asc and not touch the original list", () => {
      const i = [1, 2, 4, 3];

      expect(getSorted(i, v => v, "asc")).toStrictEqual([1, 2, 3, 4]);
      expect(i).toStrictEqual([1, 2, 4, 3]);
    });

    it("should sort numerically desc and not touch the original list", () => {
      const i = [1, 2, 4, 3];

      expect(getSorted(i, v => v, "desc")).toStrictEqual([4, 3, 2, 1]);
      expect(i).toStrictEqual([1, 2, 4, 3]);
    });

    it("should sort numerically asc (by default) and not touch the original list", () => {
      const i = [1, 2, 4, 3];

      expect(getSorted(i, v => v)).toStrictEqual([1, 2, 3, 4]);
      expect(i).toStrictEqual([1, 2, 4, 3]);
    });

    describe("multi-part", () => {
      it("should sort each part by its order", () => {
        const i = ["a", "c", "b.1", "b.2", "d"];

        expect(getSorted(i, v => v.split("."), "desc")).toStrictEqual(["d", "c", "b.2", "b.1", "a"]);
        expect(i).toStrictEqual(["a", "c", "b.1", "b.2", "d"]);
      });

      it("should be a stable sort", () => {
        const i = [{
          val: "a",
          k: 1,
        }, {
          val: "c",
          k: 2,
        }, {
          val: "b.1",
          k: 3,
        }, {
          val: "b.2",
          k: 4,
        }, {
          val: "d",
          k: 5,
        }, {
          val: "b.2",
          k: -10,
        }];
        const dup = cloneDeep(i);
        const expected = [
          {
            val: "a",
            k: 1,
          }, {
            val: "b.1",
            k: 3,
          }, {
            val: "b.2",
            k: 4,
          }, {
            val: "b.2",
            k: -10,
          }, {
            val: "c",
            k: 2,
          }, {
            val: "d",
            k: 5,
          },
        ];

        expect(getSorted(i, ({ val }) => val.split("."), "asc")).toStrictEqual(expected);
        expect(i).toStrictEqual(dup);
      });

      it("should be a stable sort #2", () => {
        const i = [{
          val: "a",
          k: 1,
        }, {
          val: "b.2",
          k: -10,
        }, {
          val: "c",
          k: 2,
        }, {
          val: "b.1",
          k: 3,
        }, {
          val: "b.2",
          k: 4,
        }, {
          val: "d",
          k: 5,
        }];
        const dup = cloneDeep(i);
        const expected = [
          {
            val: "a",
            k: 1,
          }, {
            val: "b.1",
            k: 3,
          }, {
            val: "b.2",
            k: -10,
          }, {
            val: "b.2",
            k: 4,
          }, {
            val: "c",
            k: 2,
          }, {
            val: "d",
            k: 5,
          },
        ];

        expect(getSorted(i, ({ val }) => val.split("."), "asc")).toStrictEqual(expected);
        expect(i).toStrictEqual(dup);
      });
    });
  });
});
