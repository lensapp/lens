/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Icon } from "../icon";
import { SearchInput } from "../input";

export function Install() {
  return (
    <section>
      <h2><Icon material="add"/> Install Extensions</h2>

      <div className="mt-4">
        <SearchInput/>
      </div>

      <div className="mx-7">
        <hr />
      </div>

      <h2><Icon material="star"/> Featured Extensions</h2>
    </section>
  );
}
