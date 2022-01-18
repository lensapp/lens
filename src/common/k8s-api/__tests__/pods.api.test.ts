/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Pod } from "../endpoints";

describe("Pod tests", () => {
  it("getAllContainers() should never throw", () => {
    const pod = new Pod({
      apiVersion: "foo",
      kind: "Pod",
      metadata: {
        name: "foobar",
        resourceVersion: "foobar",
        uid: "foobar",
      },
    });

    expect(pod.getAllContainers()).toStrictEqual([]);
  });
});
