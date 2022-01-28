/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { anyObject } from "jest-mock-extended";
import { merge } from "lodash";
import type { CatalogEntityData, CatalogEntityKindData, CatalogEntity } from "../../catalog";
import type { LensLogger } from "../../logger";
import { Hotbar } from "../hotbar";
import { getEmptyHotbar } from "../hotbar-types";

function getMockCatalogEntity(data: Partial<CatalogEntityData> & CatalogEntityKindData): CatalogEntity {
  return merge(data, {
    getName: jest.fn(() => data.metadata?.name),
    getId: jest.fn(() => data.metadata?.uid),
    getSource: jest.fn(() => data.metadata?.source ?? "unknown"),
    isEnabled: jest.fn(() => data.status?.enabled ?? true),
    onContextMenuOpen: jest.fn(),
    onSettingsOpen: jest.fn(),
    metadata: {},
    spec: {},
    status: {},
  }) as CatalogEntity;
}

const testCluster = getMockCatalogEntity({
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running",
  },
  metadata: {
    uid: "test",
    name: "test",
    labels: {},
  },
});

const minikubeCluster = getMockCatalogEntity({
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running",
  },
  metadata: {
    uid: "minikube",
    name: "minikube",
    labels: {},
  },
});

const awsCluster = getMockCatalogEntity({
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running",
  },
  metadata: {
    uid: "aws",
    name: "aws",
    labels: {},
  },
});


describe("Hotbar", () => {
  let hotbar: Hotbar;
  let logger: LensLogger;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
      warn: jest.fn(),
    };
    hotbar = new Hotbar(getEmptyHotbar("Default"), { logger });
  });

  it("adds items", () => {
    hotbar.addItem(testCluster);
    const items = hotbar.items.filter(Boolean);

    expect(items.length).toEqual(2);
  });

  it("removes items", () => {
    hotbar.addItem(testCluster);
    hotbar.removeItemById("test");
    hotbar.removeItemById("catalog-entity");
    const items = hotbar.items.filter(Boolean);

    expect(items).toStrictEqual([]);
  });

  it("does nothing if removing with invalid uid", () => {
    hotbar.addItem(testCluster);
    hotbar.removeItemById("invalid uid");
    const items = hotbar.items.filter(Boolean);

    expect(items.length).toEqual(2);
  });

  it("moves item to empty cell", () => {
    hotbar.addItem(testCluster);
    hotbar.addItem(minikubeCluster);
    hotbar.addItem(awsCluster);

    expect(hotbar.items[6]).toBeNull();

    hotbar.restackItems(1, 5);

    expect(hotbar.items[5]).toBeTruthy();
    expect(hotbar.items[5].entity.uid).toEqual("test");
  });

  it("moves items down", () => {
    hotbar.addItem(testCluster);
    hotbar.addItem(minikubeCluster);
    hotbar.addItem(awsCluster);

    // aws -> catalog
    hotbar.restackItems(3, 0);

    const items = hotbar.items.map(item => item?.entity.uid || null);

    expect(items.slice(0, 4)).toEqual(["aws", "catalog-entity", "test", "minikube"]);
  });

  it("moves items up", () => {
    hotbar.addItem(testCluster);
    hotbar.addItem(minikubeCluster);
    hotbar.addItem(awsCluster);

    // test -> aws
    hotbar.restackItems(1, 3);

    const items = hotbar.items.map(item => item?.entity.uid || null);

    expect(items.slice(0, 4)).toEqual(["catalog-entity", "minikube", "aws", "test"]);
  });

  it("logs an error if cellIndex is out of bounds", () => {
    hotbar.addItem(testCluster, -1);
    expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());

    hotbar.addItem(testCluster, 12);
    expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());

    hotbar.addItem(testCluster, 13);
    expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());
  });

  it("throws an error if getId is invalid or returns not a string", () => {
    expect(() => hotbar.addItem({} as any)).toThrowError(TypeError);
    expect(() => hotbar.addItem({ getId: () => true } as any)).toThrowError(TypeError);
  });

  it("throws an error if getName is invalid or returns not a string", () => {
    expect(() => hotbar.addItem({ getId: () => "" } as any)).toThrowError(TypeError);
    expect(() => hotbar.addItem({ getId: () => "", getName: () => 4 } as any)).toThrowError(TypeError);
  });

  it("does nothing when item moved to same cell", () => {
    hotbar.addItem(testCluster);
    hotbar.restackItems(1, 1);

    expect(hotbar.items[1].entity.uid).toEqual("test");
  });

  it("new items takes first empty cell", () => {
    hotbar.addItem(testCluster);
    hotbar.addItem(awsCluster);
    hotbar.restackItems(0, 3);
    hotbar.addItem(minikubeCluster);

    expect(hotbar.items[0].entity.uid).toEqual("minikube");
  });

  it("throws if invalid arguments provided", () => {
    // Prevent writing to stderr during this render.
    const { error, warn } = console;

    console.error = jest.fn();
    console.warn = jest.fn();

    hotbar.addItem(testCluster);

    expect(() => hotbar.restackItems(-5, 0)).toThrow();
    expect(() => hotbar.restackItems(2, -1)).toThrow();
    expect(() => hotbar.restackItems(14, 1)).toThrow();
    expect(() => hotbar.restackItems(11, 112)).toThrow();

    // Restore writing to stderr.
    console.error = error;
    console.warn = warn;
  });

  it("checks if entity already pinned to hotbar", () => {
    hotbar.addItem(testCluster);

    expect(hotbar.hasItem(testCluster)).toBeTruthy();
    expect(hotbar.hasItem(awsCluster)).toBeFalsy();
  });
});
