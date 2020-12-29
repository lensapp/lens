import React from "react";
import { TabLayout } from "../layout/tab-layout";

export class NotFound extends React.Component {
  render() {
    return (
      <TabLayout className="NotFound" contentClass="flex">
        <p className="box center">
          Page not found
        </p>
      </TabLayout>
    );
  }
}
