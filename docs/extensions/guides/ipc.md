# Inter Process Communication

A Lens Extension can utilize IPC to send information between the `renderer` and `main` processes.
This is useful when wanting to communicate directly within your extension.

For example, if a user logs into a service that your extension is a facade for and `main` needs to know some information so that you can start syncing items to the `Catalog`, this would be a good way to send that information along.

IPC channels are sectioned off per extension.
Meaning that each extension can only communicate with itself.

## Types of Communication

There are two flavours of communication that are provided:

- Event based (IPC)
- Request based (RPC)

### Event Based or IPC

This is the same as an [Event Emitter](https://nodejs.org/api/events.html#events_class_eventemitter) but is not limited to just one Javascript process.
This is a good option when you need to report that something has happened but you don't need a response.

This is a fully two-way form of communication.
Both `main` and `renderer` can do this sort of IPC.

### Request Based or RPC

This is more like a Remote Procedure Call (RPC) or Send-Receive-Reply (SRR).
With this sort of communication the caller needs to wait for the result from the other side.
This is accomplished by `await`-ing the returned `Promise<any>`.

This is a unidirectional form of communication.
Only `renderer` can initiate this kind of request, and only `main` can receive and respond to this kind of request.

## Registering IPC Handlers and Listeners

The general terminology is as follows:

- A "handler" is the function that responds to a "Request Based IPC" event.
- A "listener" is the function that is called when a "Event Based IPC" event is emitted.

To register either a handler or a listener, you should do something like the following:

`main.ts`:
```typescript
import { Main } from "@k8slens/extensions";
import { IpcMain } from "./helpers/main";

export class ExampleExtensionMain extends Main.LensExtension {
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
import { Main } from "@k8slens/extensions";

export class IpcMain extends Main.Ipc {
  constructor(extension: Main.LensExtension) {
    super(extension);

    this.listen("initialize", onInitialize);
  }
}

function onInitialize(event: Types.IpcMainEvent, id: string) {
  console.log(`starting to initialize: ${id}`);
}
```

In other files, it is not necessary to pass around any instances.
You should be able to just call `IpcMain.getInstance()` anywhere it is needed in your extension.

---

`renderer.ts`:
```typescript
import { Renderer } from "@k8slens/extensions";
import { IpcRenderer } from "./helpers/renderer";

export class ExampleExtensionRenderer extends Renderer.LensExtension {
  onActivate() {
    const ipc = IpcRenderer.createInstance(this);

    setTimeout(() => ipc.broadcast("initialize", "an-id"), 5000);
  }
}
```

It is also needed to create an instance to broadcast messages too.

---

`helpers/renderer.ts`:
```typescript
import { Renderer } from "@k8slens/extensions";

export class IpcRenderer extends Renderer.Ipc {}
```

It is necessary to create child classes of these `abstract class`'s in your extension before you can use them.

---

As this example shows: the channel names *must* be the same.
It should also be noted that "listeners" and "handlers" are specific to either `renderer` or `main`.
There is no behind the scenes transfer of these functions.

To register a "handler" call `IpcMain.getInstance().handle(...)`.
The cleanup of these handlers is handled by Lens itself.

The `listen()` methods on `Main.Ipc` and `Renderer.Ipc` return a `Disposer`, or more specifically, a `() => void`.
This can be optionally called to remove the listener early.

Calling either `IpcRenderer.getInstance().broadcast(...)` or `IpcMain.getInstance().broadcast(...)` sends an event to all `renderer` frames and to `main`.
Because of this, no matter where you broadcast from, all listeners in `main` and `renderer` will be notified.

### Allowed Values

This IPC mechanism utilizes the [Structured Clone Algorithm](developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for serialization.
This means that more types than what are JSON serializable can be used, but not all the information will be passed through.

## Using Request Based Communication

If you are meaning to do a request based call from `renderer`, you should do `const res = await IpcRenderer.getInstance().invoke(<channel>, ...<args>));` instead.
