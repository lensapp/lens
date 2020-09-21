import React from "react";
import { Trans } from "@lingui/macro";
import { TabLayout } from "../layout/tab-layout";

export class NotFound extends React.Component {
  render() {
    return (
      <TabLayout className="NotFound" contentClass="flex">
        <p className="box center">
          <Trans>Page not found</Trans>
        </p>
      </TabLayout>
    );
  }
}
