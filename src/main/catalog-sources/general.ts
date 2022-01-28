/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import { GeneralEntity } from "../../common/catalog-entities/general";
import { catalogURL, preferencesURL, welcomeURL } from "../../common/routes";

export const catalogEntity = new GeneralEntity({
  metadata: {
    uid: "catalog-entity",
    name: "Catalog",
    source: "app",
    labels: {},
  },
  spec: {
    path: catalogURL(),
    icon: {
      material: "view_list",
      background: "#3d90ce",
    },
  },
  status: {
    phase: "active",
  },
});

const preferencesEntity = new GeneralEntity({
  metadata: {
    uid: "preferences-entity",
    name: "Preferences",
    source: "app",
    labels: {},
  },
  spec: {
    path: preferencesURL(),
    icon: {
      material: "settings",
      background: "#3d90ce",
    },
  },
  status: {
    phase: "active",
  },
});

const welcomePageEntity = new GeneralEntity({
  metadata: {
    uid: "welcome-page-entity",
    name: "Welcome Page",
    source: "app",
    labels: {},
  },
  spec: {
    path: welcomeURL(),
    icon: {
      material: "meeting_room",
      background: "#3d90ce",
    },
  },
  status: {
    phase: "active",
  },
});

export const generalEntities = observable([
  catalogEntity,
  preferencesEntity,
  welcomePageEntity,
]);
