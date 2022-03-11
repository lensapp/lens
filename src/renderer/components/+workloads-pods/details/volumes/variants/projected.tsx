/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem, DrawerTitle } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const Projected: VolumeVariantComponent<"projected"> = (
  ({ variant: { sources, defaultMode }}) => (
    <>
      <DrawerItem name="Default Mount Mode">
          0o{defaultMode.toString(8)}
      </DrawerItem>
      <DrawerItem name="Sources">
        {
          sources.map(({ secret, downwardAPI, configMap, serviceAccountToken }, index) => (
            <React.Fragment key={index}>
              {secret && (
                <>
                  <DrawerTitle size="sub-title">Secret</DrawerTitle>
                  <DrawerItem name="Name">
                    {secret.name}
                  </DrawerItem>
                  {secret.items && (
                    <DrawerItem name="Items">
                      <ul>
                        {secret.items.map(({ key }) => <li key={key}>{key}</li>)}
                      </ul>
                    </DrawerItem>
                  )}
                </>
              )}
              {downwardAPI && (
                <>
                  <DrawerTitle size="sub-title">Downward API</DrawerTitle>
                  {downwardAPI.items && (
                    <DrawerItem name="Items">
                      <ul>
                        {downwardAPI.items.map(({ path }) => <li key={path}>{path}</li>)}
                      </ul>
                    </DrawerItem>
                  )}
                </>
              )}
              {configMap && (
                <>
                  <DrawerTitle size="sub-title">Config Map</DrawerTitle>
                  <DrawerItem name="Name">
                    {configMap.name}
                  </DrawerItem>
                  {configMap.items && (
                    <DrawerItem name="Items">
                      <ul>
                        {configMap.items.map(({ path }) => <li key={path}>{path}</li>)}
                      </ul>
                    </DrawerItem>
                  )}
                </>
              )}
              {serviceAccountToken && (
                <>
                  <DrawerTitle size="sub-title">Service Account Token</DrawerTitle>
                  <DrawerItem name="Audience" hidden={!serviceAccountToken.audience}>
                    {serviceAccountToken.audience}
                  </DrawerItem>
                  <DrawerItem name="Expiration" hidden={!serviceAccountToken.expirationSeconds}>
                    {serviceAccountToken.expirationSeconds}s
                  </DrawerItem>
                  <DrawerItem name="Path">
                    {serviceAccountToken.path}
                  </DrawerItem>
                </>
              )}
            </React.Fragment>
          ))
        }
      </DrawerItem>
    </>
  )
);
