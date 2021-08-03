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
