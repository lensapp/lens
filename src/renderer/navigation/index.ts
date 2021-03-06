// Navigation (renderer)

import { bindEvents } from "./events";
import { bindProtocolHandlers } from "./protocol-handlers";

export * from "./history";
export * from "./helpers";

bindEvents();
bindProtocolHandlers();
