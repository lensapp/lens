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
  getId: () => string;
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
  setCommandPaletteContext: (context?: CatalogEntity) => void;
}

export type CatalogEntityContextMenu = {
  icon: string;
  title: string;
  onClick: () => Promise<void>;
  confirm?: {
    message: string;
  }
};

export interface CatalogEntityContextMenuContext {
  navigate: (url: string) => void;
  menuItems: CatalogEntityContextMenu[];
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
