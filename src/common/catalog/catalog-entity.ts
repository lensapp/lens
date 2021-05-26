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

import URLParse from "url-parse";

export interface ParsedApiVersion {
  group: string;
  version?: string;
}

const versionSchema = /^\/(?<version>v[1-9][0-9]*((alpha|beta)[1-9][0-9]*)?)$/;

/**
 * Attempts to parse an ApiVersion string or a group string
 * @param apiVersionOrGroup A string that should be either of the form `<group>/<version>` or `<group>` for any version
 * @param strict if true then will throw an error if `<version>` is not provided
 * @default strict = true
 * @returns A parsed data
 */
export function parseApiVersion(apiVersionOrGroup: string, strict: false): ParsedApiVersion;
export function parseApiVersion(apiVersionOrGroup: string, strict?: true): Required<ParsedApiVersion>;

export function parseApiVersion(apiVersionOrGroup: string, strict?: boolean): ParsedApiVersion {
  strict ??= true;

  const parsed = new URLParse(`lens://${apiVersionOrGroup}`);

  if (
    parsed.protocol !== "lens:"
    || parsed.hash
    || parsed.query
    || parsed.auth
    || parsed.port
    || parsed.password
    || parsed.username
  ) {
    throw new TypeError(`invalid apiVersion string: ${apiVersionOrGroup}`);
  }

  if (!parsed.pathname) {
    throw new TypeError(`missing version on apiVersion: ${apiVersionOrGroup}`);
  }

  const match = parsed.pathname.match(versionSchema);

  if (versionSchema && !match && strict) {
    throw new TypeError(`invalid version on apiVersion: ${apiVersionOrGroup}`);
  }

  return {
    group: parsed.hostname,
    version: match?.groups.version,
  };
}

export interface CatalogCategorySpecVersion {
  version: string;
}

export interface CatalogCategorySpec<Version extends CatalogCategorySpecVersion> {
  group: string;
  versions: Version[];
  names: {
    kind: string;
  };
}

export interface CategoryMetadata {
  name: string;
}

export interface CatalogCategoryRegistration<Metadata extends CategoryMetadata, SpecVersion extends CatalogCategorySpecVersion> {
  readonly apiVersion: string;
  readonly kind: string;
  metadata: Metadata;
  spec: CatalogCategorySpec<SpecVersion>;
}

export interface WithId {
  readonly id: string;
}

export interface CatalogEntityMetadata {
  uid: string;
  name: string;
  description?: string;
  source?: string;
  labels: Record<string, string>;
  [key: string]: string | object;
}

export interface CatalogEntityStatus {
  phase: string;
  reason?: string;
  message?: string;
  active?: boolean;
}

export type CatalogEntitySpec = Record<string, any>;

export interface CatalogEntityKindData {
  readonly apiVersion: string;
  readonly kind: string;
}
