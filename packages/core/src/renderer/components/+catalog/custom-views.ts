/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import type { CatalogCategory } from "../../api/catalog-entity";

/**
 * The props for CustomCategoryViewComponents.View
 */
export interface CustomCategoryViewProps {
  /**
   * The category instance itself
   */
  category: CatalogCategory;
}

/**
 * The components for the category view.
 */
export interface CustomCategoryViewComponents {
  View: React.ComponentType<CustomCategoryViewProps>;
}

/**
 * This is the type used to declare additional views for a specific category
 */
export interface CustomCategoryViewRegistration {
  /**
   * The catalog entity kind that is declared by the category for this registration
   *
   * e.g.
   * - `"KubernetesCluster"`
   */
  kind: string;

  /**
   * The catalog entity group that is declared by the category for this registration
   *
   * e.g.
   * - `"entity.k8slens.dev"`
   */
  group: string;

  /**
   * The sorting order value. Used to determine the total order of the views.
   *
   * @default 50
   */
  priority?: number;

  /**
   * The components for this registration
   */
  components: CustomCategoryViewComponents;
}
