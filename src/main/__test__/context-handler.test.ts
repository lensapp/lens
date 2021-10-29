/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { UserStore } from "../../common/user-store";
import { ContextHandler } from "../context-handler";
import { PrometheusProvider, PrometheusProviderRegistry, PrometheusService } from "../prometheus";
import mockFs from "mock-fs";
import { AppPaths } from "../../common/app-paths";

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

  async getPrometheusService(): Promise<PrometheusService> {
    switch (this.alwaysFail) {
      case ServiceResult.Success:
        return {
          id: this.id,
          namespace: "default",
          port: 7000,
          service: "",
        };
      case ServiceResult.Failure:
        throw new Error("does fail");
      case ServiceResult.Undefined:
        return undefined;
    }
  }
}

function getHandler() {
  return new ContextHandler(({
    getProxyKubeconfig: (): any => ({
      makeApiClient: (): any => undefined,
    }),
    apiUrl: "http://localhost:81",
  }) as any);
}

AppPaths.init();

describe("ContextHandler", () => {
  beforeEach(() => {
    mockFs({
      "tmp": {},
    });

    PrometheusProviderRegistry.createInstance();
    UserStore.createInstance();
  });

  afterEach(() => {
    PrometheusProviderRegistry.resetInstance();
    UserStore.resetInstance();
    mockFs.restore();
  });

  describe("getPrometheusService", () => {
    it.each([
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ])("should return undefined from %d success(es) after %d failure(s)", async (successes, failures) => {
      const reg = PrometheusProviderRegistry.getInstance();
      let count = 0;

      for (let i = 0; i < failures; i += 1) {
        const serviceResult = i % 2 === 0 ? ServiceResult.Failure : ServiceResult.Undefined;

        reg.registerProvider(new TestProvider(`id_${count++}`, serviceResult));
      }

      for (let i = 0; i < successes; i += 1) {
        reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      }

      const service = await getHandler().getPrometheusService();

      expect(service).toBeUndefined();
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

      const service = await getHandler().getPrometheusService();

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

      const service = await getHandler().getPrometheusService();

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

      const service = await getHandler().getPrometheusService();

      expect(service.id === "id_0");
    });

    it("shouldn't pick the second provider of 2 success(es) after 1 failure(s)", async () => {
      const reg = PrometheusProviderRegistry.getInstance();
      let count = 0;

      reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Failure));
      reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));
      reg.registerProvider(new TestProvider(`id_${count++}`, ServiceResult.Success));

      const service = await getHandler().getPrometheusService();

      expect(service.id).not.toBe("id_2");
    });
  });
});
