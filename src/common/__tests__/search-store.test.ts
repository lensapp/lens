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

import { SearchStore } from "../search-store";
import { Console } from "console";
import { stdout, stderr } from "process";

jest.mock("react-monaco-editor", () => null);

jest.mock("electron", () => ({
  app: {
    getPath: () => "/foo",
  },
}));

console = new Console(stdout, stderr);

let searchStore: SearchStore = null;
const logs = [
  "1:M 30 Oct 2020 16:17:41.553 # Connection with replica 172.17.0.12:6379 lost",
  "1:M 30 Oct 2020 16:17:41.623 * Replica 172.17.0.12:6379 asks for synchronization",
  "1:M 30 Oct 2020 16:17:41.623 * Starting Partial resynchronization request from 172.17.0.12:6379 accepted. Sending 0 bytes of backlog starting from offset 14407.",
];

describe("search store tests", () => {
  beforeEach(async () => {
    searchStore = new SearchStore();
  });

  it("does nothing with empty search query", () => {
    searchStore.onSearch([], "");
    expect(searchStore.occurrences).toEqual([]);
  });

  it("doesn't break if no text provided", () => {
    searchStore.onSearch(null, "replica");
    expect(searchStore.occurrences).toEqual([]);

    searchStore.onSearch([], "replica");
    expect(searchStore.occurrences).toEqual([]);
  });

  it("find 3 occurrences across 3 lines", () => {
    searchStore.onSearch(logs, "172");
    expect(searchStore.occurrences).toEqual([0, 1, 2]);
  });

  it("find occurrences within 1 line (case-insensitive)", () => {
    searchStore.onSearch(logs, "Starting");
    expect(searchStore.occurrences).toEqual([2, 2]);
  });

  it("sets overlay index equal to first occurrence", () => {
    searchStore.onSearch(logs, "Replica");
    expect(searchStore.activeOverlayIndex).toBe(0);
  });

  it("set overlay index to next occurrence", () => {
    searchStore.onSearch(logs, "172");
    searchStore.setNextOverlayActive();
    expect(searchStore.activeOverlayIndex).toBe(1);
  });

  it("sets overlay to last occurrence", () => {
    searchStore.onSearch(logs, "172");
    searchStore.setPrevOverlayActive();
    expect(searchStore.activeOverlayIndex).toBe(2);
  });

  it("gets line index where overlay is located", () => {
    searchStore.onSearch(logs, "synchronization");
    expect(searchStore.activeOverlayLine).toBe(1);
  });

  it("escapes string for using in regex", () => {
    const regex = SearchStore.escapeRegex("some.interesting-query\\#?()[]");

    expect(regex).toBe("some\\.interesting\\-query\\\\\\#\\?\\(\\)\\[\\]");
  });

  it("gets active find number", () => {
    searchStore.onSearch(logs, "172");
    searchStore.setNextOverlayActive();
    expect(searchStore.activeFind).toBe(2);
  });

  it("gets total finds number", () => {
    searchStore.onSearch(logs, "Starting");
    expect(searchStore.totalFinds).toBe(2);
  });
});
