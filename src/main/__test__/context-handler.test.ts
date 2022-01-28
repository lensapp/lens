/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ContextHandler } from "../context-handler/context-handler";
import { PrometheusProvider, PrometheusProviderRegistry, PrometheusService } from "../prometheus";
import mockFs from "mock-fs";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { Cluster } from "../../common/cluster/cluster";

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

enum ServiceResult {
  Success,
  Failure,
  Undefined,
}

class TestProvider extends PrometheusProvider {
  name = "TestProvider1";
  rateAccuracy = "1h";
  isConfigurable = false;

  constructor(public id: string, public alwaysFail: ServiceResult) {
    super();
  }

  getQuery(): string {
    throw new Error("getQuery is not implemented.");
  }

  getPrometheusService(): Promise<PrometheusService | undefined> {
    switch (this.alwaysFail) {
      case ServiceResult.Success:
        return Promise.resolve({
          id: this.id,
          namespace: "default",
          port: 7000,
          service: "",
        });
      case ServiceResult.Failure:
        throw new Error("does fail");
      case ServiceResult.Undefined:
        return Promise.resolve(undefined);
    }
  }
}

const clusterStub = {
  getProxyKubeconfig: (): any => ({
    makeApiClient: (): any => undefined,
  }),
  apiUrl: "http://localhost:81",
} as Cluster;

describe("ContextHandler", () => {
  let createContextHandler: (cluster: Cluster) => ContextHandler;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs({
      "tmp": {},
    });

    await di.runSetups();

    createContextHandler = di.inject(createContextHandlerInjectable);

    PrometheusProviderRegistry.createInstance();
  });

  afterEach(() => {
    PrometheusProviderRegistry.resetInstance();
    mockFs.restore();
  });

  describe("getPrometheusService", () => {
    it.each([
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ])("should throw from %d success(es) after %d failure(s)", (successes, failures) => {
      const reg = PrometheusProviderRegistry.getInstance();
      let count = 0;

      for (let i = 0; i < failures; i += 1) {
        const serviceResult = i % 2 === 0 ? ServiceResult.Failure : ServiceResult.Undefined;

        reg.registerProvider(new TestProvider(`id_${count++}`, serviceResult));
      }

      for (let i = 0; i < successes; i += 1) {
        reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      }

      expect(() => {
        // TODO: Unit test shouldn't access protected or private methods
        const contextHandler = createContextHandler(clusterStub) as any;

        return contextHandler.getPrometheusService();
      }).rejects.toBeDefined();
    });

    it.each([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ])("should pick the first provider of %d success(es) after %d failure(s)", async (successes, failures) => {
      const reg = PrometheusProviderRegistry.getInstance();
      let count = 0;

      for (let i = 0; i < failures; i += 1) {
        const serviceResult = i % 2 === 0 ? ServiceResult.Failure : ServiceResult.Undefined;

        reg.registerProvider(new TestProvider(`id_${count++}`, serviceResult));
      }

      for (let i = 0; i < successes; i += 1) {
        reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      }

      // TODO: Unit test shouldn't access protected or private methods
      const contextHandler = createContextHandler(clusterStub) as any;

      const service = await contextHandler.getPrometheusService();

      expect(service.id === `id_${failures}`);
    });

    it.each([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ])("should pick the first provider of %d success(es) before %d failure(s)", async (successes, failures) => {
      const reg = PrometheusProviderRegistry.getInstance();
      let count = 0;

      for (let i = 0; i < successes; i += 1) {
        reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      }

      for (let i = 0; i < failures; i += 1) {
        const serviceResult = i % 2 === 0 ? ServiceResult.Failure : ServiceResult.Undefined;

        reg.registerProvider(new TestProvider(`id_${count++}`, serviceResult));
      }

      // TODO: Unit test shouldn't access protected or private methods
      const contextHandler = createContextHandler(clusterStub) as any;

      const service = await contextHandler.getPrometheusService();

      expect(service.id === "id_0");
    });

    it.each([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ])("should pick the first provider of %d success(es) between %d failure(s)", async (successes, failures) => {
      const reg = PrometheusProviderRegistry.getInstance();
      let count = 0;
      const beforeSuccesses = Math.floor(successes / 2);
      const afterSuccesses = successes - beforeSuccesses;

      for (let i = 0; i < beforeSuccesses; i += 1) {
        reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      }

      for (let i = 0; i < failures; i += 1) {
        const serviceResult = i % 2 === 0 ? ServiceResult.Failure : ServiceResult.Undefined;

        reg.registerProvider(new TestProvider(`id_${count++}`, serviceResult));
      }

      for (let i = 0; i < afterSuccesses; i += 1) {
        reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      }

      // TODO: Unit test shouldn't access protected or private methods
      const contextHandler = createContextHandler(clusterStub) as any;

      const service = await contextHandler.getPrometheusService();

      expect(service.id === "id_0");
    });

    it("shouldn't pick the second provider of 2 success(es) after 1 failure(s)", async () => {
      const reg = PrometheusProviderRegistry.getInstance();
      let count = 0;

      reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Failure));
      reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));

      // TODO: Unit test shouldn't access protected or private methods
      const contextHandler = createContextHandler(clusterStub) as any;

      const service = await contextHandler.getPrometheusService();

      expect(service.id).not.toBe("id_2");
    });
  });
});
