import Color from "color";

import { blend } from "../color";

describe("color tests", () => {
  describe("blend", () => {
    it("should return parent if child has alpha = 0", () => {
      expect(blend(Color("rgba(10, 20, 30, 1)"), Color("rgba(11, 21, 31, 0)")).toString()).toBe("rgb(10, 20, 30)");
    });

    it("should return child if child has alpha = 1", () => {
      expect(blend(Color("rgba(1, 2, 3, 1)"), Color("rgba(10, 20, 30, 1)")).toString()).toBe("rgb(10, 20, 30)");
    });
  });
});
