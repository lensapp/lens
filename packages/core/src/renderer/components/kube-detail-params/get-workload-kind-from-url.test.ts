/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getWorkloadKindFromUrl } from "./get-workload-kind-from-url";

describe("getWorkloadKindFromUrl", () => {
  it('returns "endpoints" for "/api/v1/namespaces/default/endpoints/kubernetes"', () => {
    const str = "/api/v1/namespaces/default/endpoints/kubernetes";
    const lastSegment = getWorkloadKindFromUrl(str);

    expect(lastSegment).toEqual("endpoints");
  });

  it('returns "namespaces" for "/api/v1/namespaces/acme-org"', () => {
    const str = "/api/v1/namespaces/acme-org";
    const lastSegment = getWorkloadKindFromUrl(str);

    expect(lastSegment).toEqual("namespaces");
  });

  it('returns "bar" for "/foo/bar/"', () => {
    const str = "/foo/bar/";
    const lastSegment = getWorkloadKindFromUrl(str);

    expect(lastSegment).toEqual("bar");
  });

  it('returns null for ""', () => {
    const str = "";
    const lastSegment = getWorkloadKindFromUrl(str);

    expect(lastSegment).toBeNull();
  });

  it('returns null for "/"', () => {
    const str = "/";
    const lastSegment = getWorkloadKindFromUrl(str);

    expect(lastSegment).toBeNull();
  });

  it('returns null for "invalidurl"', () => {
    const str = "invalidurl";
    const lastSegment = getWorkloadKindFromUrl(str);

    expect(lastSegment).toBeNull();
  });
});
