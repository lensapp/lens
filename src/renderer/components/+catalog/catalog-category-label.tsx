/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

interface CatalogCategoryLabelProps {
  label: string | React.ReactNode;
  badge?: React.ReactNode;
}

/**
 * Display label for Catalog Category for the Catalog menu
 */
export const CatalogCategoryLabel = ({ label, badge }: CatalogCategoryLabelProps) =>
  (
    <div className="flex">
      <div>{label}</div>
      {badge ? (<div className="flex items-center">{badge}</div>) : null}
    </div>
  );
