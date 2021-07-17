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

import React from "react";
import { observer } from "mobx-react";
import { Badge } from ".";
import { navigate } from "../../navigation/helpers";
import { cssNames } from "../../utils";
import type { KubeResource } from "../../../common/rbac";
import { podsURL } from "../../../common/routes/workloads";
import { nodesURL } from "../../../common/routes/nodes";
import type { buildURL } from "../../../common/utils/buildUrl";

const navigateURL: Partial<Record<KubeResource, ReturnType<typeof buildURL>>> = {
  "pods": podsURL,
  "nodes": nodesURL,
};

interface Props {
  className?: string
  resource: KubeResource
  searchFilter: string
}

@observer
export class BadgeNavigatable extends React.Component<Props> {

  render() {
    const { className, resource, searchFilter } = this.props;

    return (
      <Badge
        className={cssNames("BadgeNavigatable", className)}
        label={searchFilter}
        tooltip={`Navigate to ${resource}`}
        onClick={(event) => {
          navigate(navigateURL[resource]({ query: { search: searchFilter }}));
          event.stopPropagation();
        }}
      />
    );
  }
}
