import { appEventBus, AppEvent } from "../event-bus"

describe("event bus tests", () => {
  describe("emit", () => {
    it("emits an event", () => {
      let event: AppEvent = null
      appEventBus.on((ev: AppEvent) => {
        event = ev
      })
      appEventBus.emit({name: "foo", action: "bar"})
      expect(event.name).toBe("foo")
    })
  })
})
