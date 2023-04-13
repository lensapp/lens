import { getDependencyName } from "./get-dependency-name";

describe("get-dependency-name", () => {
  it("given scoped dependency with entrypoint, returns dependency name", () => {
    const actual = getDependencyName("@some-scope/some-package/entrypoint");

    expect(actual).toBe("@some-scope/some-package");
  });

  it("given scoped dependency but no entrypoint, returns dependency name", () => {
    const actual = getDependencyName("@some-scope/some-package");

    expect(actual).toBe("@some-scope/some-package");
  });

  it("given non scoped dependency with entrypoint, returns dependency name", () => {
    const actual = getDependencyName("some-package/some-entrypoint");

    expect(actual).toBe("some-package");
  });

  it("given non scoped dependency but no entrypoint, returns dependency name", () => {
    const actual = getDependencyName("some-package");

    expect(actual).toBe("some-package");
  });
});
