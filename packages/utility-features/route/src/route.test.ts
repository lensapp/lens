import { route } from "./route";

describe("route", () => {
  it("returns a bind handler", () => {
    const handler = route({
      path: "/test",
      method: "get",
    });

    const response = handler((req) => {
      return {
        response: "test",
      };
    });

    expect(response.path).toBe("/test");
    expect(response.method).toBe("get");
    expect(response.handler).toEqual(expect.any(Function));
  });
});