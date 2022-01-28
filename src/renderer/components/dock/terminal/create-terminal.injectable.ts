/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { Terminal } from "./terminal";
import { bind } from "../../../utils";
import addElementEventListenerInjectable from "../../../event-listeners/add-element-event-listener.injectable";
import addWindowEventListenerInjectable from "../../../event-listeners/add-window-event-listener.injectable";
import terminalColorsInjectable from "../../../themes/terminal-colors.injectable";
import terminalConfigInjectable from "../../../../common/user-preferences/terminal-config.injectable";
import terminalCopyOnSelectInjectable from "../../../../common/user-preferences/terminal-copy-on-select.injectable";

const createTerminalInjectable = getInjectable({
  instantiate: (di) => bind(Terminal.create, null, {
    addElementEventListener: di.inject(addElementEventListenerInjectable),
    addWindowEventListener: di.inject(addWindowEventListenerInjectable),
    terminalColors: di.inject(terminalColorsInjectable),
    terminalConfig: di.inject(terminalConfigInjectable),
    terminalCopyOnSelect: di.inject(terminalCopyOnSelectInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createTerminalInjectable;
