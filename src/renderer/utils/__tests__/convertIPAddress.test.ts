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

import { ipAddressStringToBigInt } from "../convertIPAddress";

describe("ipAddressStringToBigInt tests", () => {
  test("Empty string", () => {
    expect(ipAddressStringToBigInt("")).toStrictEqual(BigInt(0));
  });

  test("None value", () => {
    expect(ipAddressStringToBigInt("None")).toStrictEqual(BigInt(0));
  });

  test("Invalid IPV4", () => {
    expect(ipAddressStringToBigInt("256.0.0.0")).toStrictEqual(BigInt(0));
  });

  test("Invalid IPV6", () => {
    expect(ipAddressStringToBigInt("fffg:ffff:ffff:ffff:ffff:ffff:ffff:ffff")).toStrictEqual(BigInt(0));
  });

  test("Min IPV4", () => {
    expect(ipAddressStringToBigInt("0.0.0.0")).toStrictEqual(BigInt(0));
  });

  test("Min IPV6", () => {
    expect(ipAddressStringToBigInt("::")).toStrictEqual(BigInt(0));
  });

  test("Random IPV4", () => {
    expect(ipAddressStringToBigInt("10.10.10.10")).toStrictEqual(BigInt("168430090"));
  });

  test("Random IPV4 2", () => {
    expect(ipAddressStringToBigInt("172.16.1.1")).toStrictEqual(BigInt("2886729985"));
  });

  test("Random IPV6", () => {
    expect(ipAddressStringToBigInt("2001:0db8:85a3::8a2e:0370:7334")).toStrictEqual(BigInt("42540766452641154071740215577757643572"));
  });


  test("Max IPV4", () => {
    expect(ipAddressStringToBigInt("255.255.255.255")).toStrictEqual(BigInt("4294967295"));
  });

  test("Max IPV6", () => {
    expect(ipAddressStringToBigInt("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff")).toStrictEqual(BigInt("340282366920938463463374607431768211455"));
  });
});
