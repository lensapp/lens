import mockFs from "mock-fs"

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => '99.99.99',
      getPath: () => 'tmp',
      getLocale: () => 'en'
    }
  }
})

import { WorkspaceStore } from "./workspace-store"

describe("workspace store tests", () => {
  describe("for an empty config", () => {
    beforeEach(async () => {
      WorkspaceStore.resetInstance()
      mockFs({ tmp: { 'lens-workspace-store.json': "{}" } })

      await WorkspaceStore.getInstance<WorkspaceStore>().load();
    })

    afterEach(() => {
      mockFs.restore()
    })

    it("default workspace should always exist", () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      expect(us.workspaces.size).toBe(1);
      expect(us.getById(WorkspaceStore.defaultId)).not.toBe(null);
    })

    it("cannot remove the default workspace", () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      expect(() => us.removeWorkspace(WorkspaceStore.defaultId)).toThrowError("Cannot remove");
    })

    it("can update default workspace name", () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      us.saveWorkspace({
        id: WorkspaceStore.defaultId,
        name: "foobar",
      });
      expect(us.currentWorkspace.name).toBe("foobar");
    })

    it("can add workspaces", () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      us.saveWorkspace({
        id: "123",
        name: "foobar",
      });
      expect(us.getById("123").name).toBe("foobar");
    })

    it("cannot set a non-existant workspace to be active", () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      expect(() => us.setActive("abc")).toThrow("doesn't exist");
    })

    it("can set a existant workspace to be active", () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      us.saveWorkspace({
        id: "abc",
        name: "foobar",
      });
      expect(() => us.setActive("abc")).not.toThrowError();
    })

    it("can remove a workspace", () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      us.saveWorkspace({
        id: "123",
        name: "foobar",
      });
      us.saveWorkspace({
        id: "1234",
        name: "foobar 1",
      });
      us.removeWorkspace("123");
      expect(us.workspaces.size).toBe(2);
    })
  })

  describe("for a non-empty config", () => {
    beforeEach(async () => {
      WorkspaceStore.resetInstance()
      mockFs({
        tmp: {
          'lens-workspace-store.json': JSON.stringify({
            currentWorkspace: "abc",
            workspaces: [{
              id: "abc",
              name: "test"
            }, {
              id: "default",
              name: "default"
            }]
          })
        }
      })
      await WorkspaceStore.getInstance<WorkspaceStore>().load();
    })

    afterEach(() => {
      mockFs.restore()
    })

    it("doesn't revert to default workspace", async () => {
      const us = WorkspaceStore.getInstance<WorkspaceStore>();

      expect(us.currentWorkspaceId).toBe("abc");
    })
  })
})