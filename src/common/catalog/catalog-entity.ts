import { EventEmitter } from "events";
import { observable } from "mobx";

type ExtractEntityMetadataType<Entity> = Entity extends CatalogEntity<infer Metadata> ? Metadata : never;
type ExtractEntityStatusType<Entity> = Entity extends CatalogEntity<any, infer Status> ? Status : never;
type ExtractEntitySpecType<Entity> = Entity extends CatalogEntity<any, any, infer Spec> ? Spec : never;

export type CatalogEntityConstructor<Entity extends CatalogEntity> = (
  (new (data: CatalogEntityData<
    ExtractEntityMetadataType<Entity>,
    ExtractEntityStatusType<Entity>,
    ExtractEntitySpecType<Entity>
  >) => Entity)
);

export interface CatalogCategoryVersion<Entity extends CatalogEntity> {
  name: string;
  entityClass: CatalogEntityConstructor<Entity>;
}

export interface CatalogCategorySpec {
  group: string;
  versions: CatalogCategoryVersion<CatalogEntity>[];
  names: {
    kind: string;
  };
}

export abstract class CatalogCategory extends EventEmitter {
  abstract readonly apiVersion: string;
  abstract readonly kind: string;
  abstract metadata: {
    name: string;
    icon: string;
  };
  abstract spec: CatalogCategorySpec;

  public getId(): string {
    return `${this.spec.group}/${this.spec.names.kind}`;
  }
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

export interface CatalogEntityActionContext {
  navigate: (url: string) => void;
  setCommandPaletteContext: (context?: CatalogEntity) => void;
}

export interface CatalogEntityContextMenu {
  icon: string;
  title: string;
  onlyVisibleForSource?: string; // show only if empty or if matches with entity source
  onClick: () => void | Promise<void>;
  confirm?: {
    message: string;
  }
}

export interface CatalogEntitySettingsMenu {
  group?: string;
  title: string;
  components: {
    View: React.ComponentType<any>
  };
}

export interface CatalogEntityContextMenuContext {
  navigate: (url: string) => void;
  menuItems: CatalogEntityContextMenu[];
}

export interface CatalogEntitySettingsContext {
  menuItems: CatalogEntityContextMenu[];
}

export interface CatalogEntityAddMenuContext {
  navigate: (url: string) => void;
  menuItems: CatalogEntityContextMenu[];
}

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

  public abstract onRun?(context: CatalogEntityActionContext): void | Promise<void>;
  public abstract onDetailsOpen(context: CatalogEntityActionContext): void | Promise<void>;
  public abstract onContextMenuOpen(context: CatalogEntityContextMenuContext): void | Promise<void>;
  public abstract onSettingsOpen(context: CatalogEntitySettingsContext): void | Promise<void>;
}
