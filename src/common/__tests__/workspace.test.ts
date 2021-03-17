import { Workspace } from "../workspace-store";
import { clusterStore } from "../cluster-store";
import { Cluster } from "../../main/cluster";

jest.mock("../cluster-store");

const mockedClusterStore = clusterStore as jest.Mocked<typeof clusterStore>;

describe("Workspace tests", () => {
  it("should be enabled if not managed", () => {
    const w = new Workspace({
      id: "f",
      name: "f"
    });

    expect(w.enabled).toBe(true);
    expect(w.isManaged).toBe(false);
  });

  it("should not be enabled initially if managed", () => {
    const w = new Workspace({
      id: "f",
      name: "f",
      ownerRef: "f"
    });

    expect(w.enabled).toBe(false);
    expect(w.isManaged).toBe(true);
  });

  it("should be able to be enabled when managed", () => {
    const w = new Workspace({
      id: "f",
      name: "f",
      ownerRef: "f"
    });

    expect(w.enabled).toBe(false);
    expect(w.isManaged).toBe(true);

    w.enabled = true;
    expect(w.enabled).toBe(true);
  });

  it("should allow valid clusterId to be set to activeClusterId", () => {
    mockedClusterStore.getById.mockImplementationOnce(id => {
      expect(id).toBe("foobar");

      return {
        workspace: "f",
        id
      } as Cluster;
    });

    const w = new Workspace({
      id: "f",
      name: "f"
    });

    w.setActiveCluster("foobar");
    expect(w.activeClusterId).toBe("foobar");
  });

  it("should clear activeClusterId", () => {
    mockedClusterStore.getById.mockImplementationOnce(id => {
      expect(id).toBe("foobar");

      return {
        workspace: "f",
        id
      } as Cluster;
    });

    const w = new Workspace({
      id: "f",
      name: "f"
    });

    w.setActiveCluster("foobar");
    expect(w.activeClusterId).toBe("foobar");

    w.clearActiveCluster();
    expect(w.activeClusterId).toBe(undefined);
  });

  it("should disallow valid clusterId to be set to activeClusterId", () => {
    mockedClusterStore.getById.mockImplementationOnce(id => {
      expect(id).toBe("foobar");

      return undefined;
    });

    const w = new Workspace({
      id: "f",
      name: "f"
    });

    w.setActiveCluster("foobar");
    expect(w.activeClusterId).toBe(undefined);
  });

  describe("Workspace.tryClearAsCurrentActiveCluster", () => {
    it("should return false for non-matching ID", () => {
      mockedClusterStore.getById.mockImplementationOnce(id => {
        expect(id).toBe("foobar");

        return {
          workspace: "f",
          id
        } as Cluster;
      });

      const w = new Workspace({
        id: "f",
        name: "f",
        activeClusterId: "foobar"
      });

      expect(w.tryClearAsActiveCluster("fa")).toBe(false);
      expect(w.activeClusterId).toBe("foobar");
    });
    it("should return false for non-matching cluster", () => {
      mockedClusterStore.getById.mockImplementationOnce(id => {
        expect(id).toBe("foobar");

        return {
          workspace: "f",
          id
        } as Cluster;
      });

      const w = new Workspace({
        id: "f",
        name: "f",
        activeClusterId: "foobar"
      });

      expect(w.tryClearAsActiveCluster({ id: "fa" } as Cluster)).toBe(false);
      expect(w.activeClusterId).toBe("foobar");
    });

    it("should return true for matching ID", () => {
      mockedClusterStore.getById.mockImplementationOnce(id => {
        expect(id).toBe("foobar");

        return {
          workspace: "f",
          id
        } as Cluster;
      });

      const w = new Workspace({
        id: "f",
        name: "f",
        activeClusterId: "foobar"
      });

      expect(w.tryClearAsActiveCluster("foobar")).toBe(true);
      expect(w.activeClusterId).toBe(undefined);
    });

    it("should return true for matching cluster", () => {
      mockedClusterStore.getById.mockImplementationOnce(id => {
        expect(id).toBe("foobar");

        return {
          workspace: "f",
          id
        } as Cluster;
      });

      const w = new Workspace({
        id: "f",
        name: "f",
        activeClusterId: "foobar"
      });

      expect(w.tryClearAsActiveCluster({ id: "foobar"} as Cluster)).toBe(true);
      expect(w.activeClusterId).toBe(undefined);
    });
  });
});
