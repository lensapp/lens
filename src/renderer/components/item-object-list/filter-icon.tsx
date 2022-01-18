/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Icon, IconProps } from "../icon";
import { FilterType } from "./page-filters.store";

interface Props extends Partial<IconProps> {
  type: FilterType;
}

export function FilterIcon(props: Props) {
  const { type, ...iconProps } = props;

  switch (type) {
    case FilterType.SEARCH:
      return <Icon small material="search" {...iconProps}/>;

    default:
      return <Icon small material="filter_list" {...iconProps}/>;
  }
}
