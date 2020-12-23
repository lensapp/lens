import { appEventBus, AppEvent } from "../event-bus";
import { Console } from "console";
import { stdout, stderr } from "process";

console = new Console(stdout, stderr);

describe("event bus tests", () => {
  describe("emit", () => {
    it("emits an event", () => {
      let event: AppEvent = null;

      appEventBus.addListener((data) => {
        event = data;
      });

      appEventBus.emit({name: "foo", action: "bar"});
      expect(event.name).toBe("foo");
    });
  });
});
