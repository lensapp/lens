/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getClusterIdFromHost } from "../cluster-id-url-parsing";

describe("getClusterIdFromHost", () => {
  const clusterFakeId = "fe540901-0bd6-4f6c-b472-bce1559d7c4a";

  it("should return undefined for non cluster frame hosts", () => {
    expect(getClusterIdFromHost("localhost:45345")).toBeUndefined();
  });

  it("should return ClusterId for cluster frame hosts", () => {
    expect(getClusterIdFromHost(`${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
  });

  it("should return ClusterId for cluster frame hosts with additional subdomains", () => {
    expect(getClusterIdFromHost(`abc.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.stu.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.stu.vwx.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.stu.vwx.yz.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
  });
});
