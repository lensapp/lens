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

import { observable, reaction } from "mobx";
import { WebLink } from "../catalog-entities";
import { CatalogEntityRegistry } from "../catalog";

describe("CatalogEntityRegistry", () => {
  let registry: CatalogEntityRegistry;
  const entity = new WebLink({
    metadata: {
      uid: "test",
      name: "test-link",
      source: "test",
      labels: {}
    },
    spec: {
      url: "https://k8slens.dev"
    },
    status: {
      phase: "valid"
    }
  });

  beforeEach(() => {
    registry = new CatalogEntityRegistry();
  });

  describe("addSource", () => {
    it ("allows to add an observable source", () => {
      const source = observable.array([]);

      registry.addObservableSource("test", source);
      expect(registry.items.length).toEqual(0);

      source.push(entity);

      expect(registry.items.length).toEqual(1);
    });

    it ("added source change triggers reaction", (done) => {
      const source = observable.array([]);

      registry.addObservableSource("test", source);
      reaction(() => registry.items, () => {
        done();
      });

      source.push(entity);
    });
  });

  describe("removeSource", () => {
    it ("removes source", () => {
      const source = observable.array([]);

      registry.addObservableSource("test", source);
      source.push(entity);
      registry.removeSource("test");

      expect(registry.items.length).toEqual(0);
    });
  });
});
