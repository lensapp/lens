import * as React from "react";
import { Trans } from "@lingui/macro";
import { MainLayout } from "../layout/main-layout";

export class NotFound extends React.Component {
  render() {
    return (
      <MainLayout className="NotFound" contentClass="flex" footer={null}>
        <p className="box center">
          <Trans>Page not found</Trans>
        </p>
      </MainLayout>
    )
  }
}