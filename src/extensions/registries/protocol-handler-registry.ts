import { RouteHandler } from "../../common/protocol-handler";

/**
 * ProtocolHandlerRegistration is the data required for an extension to register
 * a handler to a specific path or dynamic path.
 */
export interface ProtocolHandlerRegistration {
  pathSchema: string;
  handler: RouteHandler;
}
