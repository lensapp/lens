export interface CatalogCategoryVersion {
  name: string;
  entityClass: { new(data: CatalogEntityData): CatalogEntity };
}

export interface CatalogCategory {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
  }
  spec: {
    group: string;
    versions: CatalogCategoryVersion[];
    names: {
      kind: string;
    }
  }
}

export type CatalogEntityMetadata = {
  uid: string;
  name: string;
  description?: string;
  source?: string;
  labels: {
    [key: string]: string;
  }
  [key: string]: string | object;
};

export type CatalogEntityStatus = {
  phase: string;
  reason?: string;
  message?: string;
  active?: boolean;
};

export interface CatalogEntityActionContext {
  navigate: (url: string) => void;
}

export interface CatalogEntityContextMenuContext extends CatalogEntityActionContext {
  menu: any
}

export type CatalogEntityData = {
  apiVersion: string;
  kind: string;
  metadata: CatalogEntityMetadata;
  status: CatalogEntityStatus;
  spec: {
    [key: string]: any;
  }
};

export interface CatalogEntity extends CatalogEntityData {
  getId: () => string;
  getName: () => string;
  onRun: (context: CatalogEntityActionContext) => Promise<void>;
  onDetailsOpen: (context: CatalogEntityActionContext) => Promise<void>;
  onContextMenuOpen: (context: CatalogEntityContextMenuContext) => Promise<void>;
}
