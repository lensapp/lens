import { EventEmitter } from "./event-emitter"

export type AppEvent = {
  name: string;
  action: string;
  params?: object;
}

export const appEventBus = new EventEmitter<[AppEvent]>()
