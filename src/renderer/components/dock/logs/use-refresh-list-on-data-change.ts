/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { useEffect, useState } from "react";
import type { LogTabData } from "./tab-store";
import { v4 as getRandomId } from "uuid";

export function useRefreshListOnDataChange(data: LogTabData | undefined) {
  const [rowKeySuffix, setRowKeySuffix] = useState(getRandomId());

  useEffect(() => {
    // Refresh virtualizer list rows by changing their keys
    setRowKeySuffix(getRandomId());
  }, [data]);

  return rowKeySuffix;
}
