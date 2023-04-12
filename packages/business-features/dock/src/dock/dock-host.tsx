import React from "react";
import { Tab } from "./tab";
import { Div, Span } from "@k8slens/ui-components";

export const DockHost = () => (
  <Div _className={["Dock", { isOpen: true }]}>
    <Div _flexParent={{ centeredVertically: true }} className="tabs-container">
      <Tab>
        <Div _flexParent={{ centeredVertically: true }}>
          <Span _wordWrap>Some title</Span>
        </Div>
      </Tab>

      <Tab>
        <Div _flexParent={{ centeredVertically: true }}>
          <Span _wordWrap>Some other title</Span>
        </Div>
      </Tab>
    </Div>

    <Div
      _flexParent={{ centeredVertically: true }}
      _className={[
        "toolbar gaps box grow",
        {
          "pl-0": true,
        },
      ]}
    >
      <div className="dock-menu box grow"></div>
    </Div>

    <div className={`tab-content`} style={{ flexBasis: 420 }}>
      Some content
    </div>
  </Div>
);
