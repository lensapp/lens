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
import { observable } from "mobx";
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

type ExtractEntityMetadataType<Entity> = Entity extends CatalogEntity<infer Metadata> ? Metadata : never;
type ExtractEntityStatusType<Entity> = Entity extends CatalogEntity<any, infer Status> ? Status : never;
type ExtractEntitySpecType<Entity> = Entity extends CatalogEntity<any, any, infer Spec> ? Spec : never;

export type MatchingCatalogEntityData<Entity extends CatalogEntity> = CatalogEntityData<
  ExtractEntityMetadataType<Entity>,
  ExtractEntityStatusType<Entity>,
  ExtractEntitySpecType<Entity>
>;

export type CatalogEntityConstructor<Entity extends CatalogEntity> = new (data: MatchingCatalogEntityData<Entity>) => Entity;

export interface CatalogCategoryVersion<Entity extends CatalogEntity> {
  version: string;
  entityClass: CatalogEntityConstructor<Entity>;
}

export interface CatalogCategorySpec {
  readonly apiVersion: string;
  readonly kind: string;
  readonly metadata: {
    name: string;
    icon: string;
  };

  /**
   * It will be a runtime error if any of the instances created through the
   * versions don't match the provided `group` and `names.kind` provided here.
   */
  readonly spec: {
    group: string;
    versions: CatalogCategoryVersion<CatalogEntity>[];
    names: {
      kind: string;
    };
  };
}

export function getCatalogCategoryId(category: CatalogCategorySpec): string {
  return `${category.spec.group}/${category.spec.names.kind}`;
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
  phase?: string;
  reason?: string;
  message?: string;
  active?: boolean;
}

export interface ActionContext {
  navigate: (url: string) => void;
  setCommandPaletteContext: (context?: CatalogEntity) => void;
}

export type ActionHandler = (ctx: ActionContext) => void;

export interface ContextMenu {
  icon: string;
  title: string;
  onlyVisibleForSource?: string; // show only if empty or if matches with entity source
  onClick: () => void | Promise<void>;
  confirm?: {
    message: string;
  }
}

export interface MenuContext {
  navigate: (url: string) => void;
}

export type ContextMenuOpenHandler = (ctx: MenuContext) => ContextMenu[];
export type AddMenuOpenHandler = (ctx: MenuContext) => ContextMenu[];

export type CategoryHandler<EntityHandler extends (...args: any[]) => any> = (entity: CatalogEntity, ...args: Parameters<EntityHandler>) => ReturnType<EntityHandler>;

export interface SettingsContext {
}

export interface SettingsMenu {
  group?: string;
  title: string;
  components: {
    View: React.ComponentType<any>
  };
}

export type SettingsMenuOpenHandler = (ctx: SettingsContext) => SettingsMenu[];

export type CatalogEntitySpec = Record<string, any>;

export interface CatalogEntityData<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> {
  metadata: Metadata;
  status: Status;
  spec: Spec;
}

export interface CatalogEntityKindData {
  readonly apiVersion: string;
  readonly kind: string;
}

export abstract class CatalogEntity<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> implements CatalogEntityKindData {
  public abstract readonly apiVersion: string;
  public abstract readonly kind: string;

  @observable metadata: Metadata;
  @observable status: Status;
  @observable spec: Spec;

  constructor(data: CatalogEntityData<Metadata, Status, Spec>) {
    this.metadata = data.metadata;
    this.status = data.status;
    this.spec = data.spec;
  }

  public getId(): string {
    return this.metadata.uid;
  }

  public getName(): string {
    return this.metadata.name;
  }

  public onRun?: ActionHandler;
  public onContextMenuOpen?: ContextMenuOpenHandler;
  public onSettingsOpen?: SettingsMenuOpenHandler;
}
