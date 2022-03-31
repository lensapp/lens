/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import { Editor } from "./editor";
import editorPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/editor/editor-preferences-route.injectable";

const editorPreferencesRouteComponentInjectable = getInjectable({
  id: "editor-preferences-route-component",

  instantiate: (di) => ({
    route: di.inject(editorPreferencesRouteInjectable),
    Component: Editor,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default editorPreferencesRouteComponentInjectable;
