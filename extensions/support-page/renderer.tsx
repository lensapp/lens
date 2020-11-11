import React from "react";
import { Component, LensRendererExtension, Navigation } from "@k8slens/extensions";
import { supportPageRoute, supportPageURL } from "./src/support.route";
import { Support } from "./src/support";
import styled from '@emotion/styled';

const Icon = styled.div`
  color: white;
  display: flex;
  align-items: center;
  padding-right: calc(var(--padding) / 2);
`

export default class SupportPageRendererExtension extends LensRendererExtension {
  globalPages = [
    {
      ...supportPageRoute,
      url: supportPageURL(),
      hideInMenu: true,
      components: {
        Page: Support,
      }
    }
  ]

  statusBarItems = [
    {
      item: (
        <Icon>
          <Component.Icon
            className="SupportIcon"
            material="help"
            smallest
            onClick={() => Navigation.navigate(supportPageURL())}
          />
        </Icon>
      )
    }
  ]
}
