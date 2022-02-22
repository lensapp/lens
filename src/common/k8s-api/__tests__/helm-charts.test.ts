/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { HelmChart } from "../endpoints/helm-charts.api";

describe("Helm Charts", () => {
  it("should accept a helm chart without a digest field", () => {
    expect(() => HelmChart.create({
      apiVersion: "foo",
      name: "bar",
      version: "1.0.0",
      repo: "localhost:9090",
      created: "yesterday",
      description: "my bar chart",
      keywords: ["test"],
      sources: [],
      urls: [],
      annotations: {},
      dependencies: [],
      maintainers: [],
      deprecated: false,
    })).not.toThrowError();
  });
});
