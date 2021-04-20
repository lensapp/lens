import { CustomResourceDefinition } from "../endpoints";
import { IKubeObjectMetadata } from "../kube-object";

describe("Crds", () => {
  describe("getVersion", () => {
    it("should get the first version name from the list of versions", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as IKubeObjectMetadata,
      });

      crd.spec = {
        versions: [
          {
            name: "123",
            served: false,
            storage: false,
          }
        ]
      } as any;

      expect(crd.getVersion()).toBe("123");
    });

    it("should get the first version name from the list of versions (length 2)", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as IKubeObjectMetadata,
      });

      crd.spec = {
        versions: [
          {
            name: "123",
            served: false,
            storage: false,
          },
          {
            name: "1234",
            served: false,
            storage: false,
          }
        ]
      } as any;

      expect(crd.getVersion()).toBe("123");
    });

    it("should get the first version name from the list of versions (length 2) even with version field", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as IKubeObjectMetadata,
      });

      crd.spec = {
        version: "abc",
        versions: [
          {
            name: "123",
            served: false,
            storage: false,
          },
          {
            name: "1234",
            served: false,
            storage: false,
          }
        ]
      } as any;

      expect(crd.getVersion()).toBe("123");
    });

    it("should get the first version name from the version field", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as IKubeObjectMetadata,
      });

      crd.spec = {
        version: "abc"
      } as any;

      expect(crd.getVersion()).toBe("abc");
    });
  });
});
