import { BaseRegistry } from "./base-registry";

export interface WelcomeMenuRegistration {
  title: string | (() => string);
  icon: string;
  click: () => void | Promise<void>;
}

export class WelcomeMenuRegistry extends BaseRegistry<WelcomeMenuRegistration> {}

export const welcomeMenuRegistry = new WelcomeMenuRegistry();
