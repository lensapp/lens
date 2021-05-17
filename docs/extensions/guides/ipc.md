# Inter Process Communication

A Lens Extension can utilize IPC to send information between its `LensRendererExtension` and its `LensMainExtension`.
This is useful when wanting to communicate directly within your extension.
For example, if a user logs into a service that your extension is a facade for and `main` needs to know some information so that you can start syncing items to the `Catalog`, this would be a good way to send that information along.

IPC channels are blocked off per extension.
Meaning that each extension can only communicate with itself.

## Types of IPC

There are two flavours of IPC that are provided:

- Event based
- Request based

### Event Based IPC

This is the same as an [Event Emitter](https://nodejs.org/api/events.html#events_class_eventemitter) but is not limited to just one Javascript process.
This is a good option when you need to report that something has happened but you don't need a response.

This is a fully two-way form of communication.
Both `LensMainExtension` and `LensRendererExtension` can do this sort of IPC.

### Request Based IPC

This is more like a Remote Procedure Call (RPC).
With this sort of IPC the caller waits for the result from the other side.
This is accomplished by returning a `Promise<T>` which needs to be `await`-ed.

This is a unidirectional form of communication.
Only `LensRendererExtension` can initiate this kind of request, and only `LensMainExtension` can and respond this this kind of request.

## Registering IPC Handlers and Listeners

The general terminology is as follows:

- A "handler" is the function that responds to a "Request Based IPC" event.
- A "listener" is the function that is called when a "Event Based IPC" event is emitted.

To register either a handler or a listener, you should do something like the following:

`main.ts`:
```typescript
import { LensMainExtension, Interface, Types, Store } from "@k8slens/extensions";
import { registerListeners, IpcMain } from "./helpers/main";

export class ExampleExtensionMain extends LensMainExtension {
  onActivate() {
    IpcMain.createInstance(this);
  }
}
```

This file shows that you need to create an instance of the store to be able to use IPC.
Lens will automatically clean up that store and all the handlers on deactivation and uninstall.

---

`helpers/main.ts`:
```typescript
import { Store } from "@k8slens/extensions";

export class IpcMain extends Store.MainIpcStore {
  constructor(extension: LensMainExtension) {
    super(extension);

    this.listenIpc("initialize", onInitialize);
  }
}

function onInitialize(event: Types.IpcMainEvent, id: string) {
  console.log(`starting to initialize: ${id}`);
}
```

In other files, it is not necessary to pass around any instances.
It should be able to just call `getInstance()` everywhere in your extension as needed.

---

`renderer.ts`:
```typescript
import { LensRendererExtension, Interface, Types } from "@k8slens/extensions";
import { IpcRenderer } from "./helpers/renderer";

export class ExampleExtensionRenderer extends LensRendererExtension {
  onActivate() {
    const ipc = IpcRenderer.createInstance(this);

    setTimeout(() => ipc.broadcastIpc("initialize", "an-id"), 5000);
  }
}
```

It is also needed to create an instance to broadcast messages too.

---

`helpers/renderer.ts`:
```typescript
import { Store } from "@k8slens/extensions";

export class IpcMain extends Store.RendererIpcStore {}
```

It is necessary to create child classes of these `abstract class`'s in your extension before you can use them.

---

As this example shows: the channel names *must* be the same.
It should also be noted that "listeners" and "handlers" are specific to either `LensRendererExtension` and `LensMainExtension`.
There is no behind the scenes transfer of these functions.

If you want to register a "handler" you would call `Store.MainIpcStore.handleIpc(...)` instead.
The cleanup of these handlers is handled by Lens itself.

`Store.RendererIpcStore.broadcastIpc(...)` and `Store.MainIpcStore.broadcastIpc(...)` sends an event to all renderer frames and to main.
Because of this, no matter where you broadcast from, all listeners in `main` and `renderer` will be notified.

### Allowed Values

This IPC mechanism utilizes the [Structured Clone Algorithm](developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for serialization.
This means that more types than what are JSON serializable can be used, but not all the information will be passed through.

## Using IPC

Calling IPC is very simple.
If you are meaning to do an event based call, merely call `broadcastIpc(<channel>, ...<args>)` from within your extension.

If you are meaning to do a request based call from `renderer`, you should do `const res = await Store.RendererIpcStore.invokeIpc(<channel>, ...<args>));` instead.
