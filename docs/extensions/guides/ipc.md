# Inter Process Communication

A Lens Extension can utilise IPC to send information between its `LensRendererExtension` and its `LensMainExtension`.
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
Only `LensRendererExtension` can initiate this kind of request, and only `LensMainExtension` and respond this this kind of request.

## Registering IPC Handlers and Listeners

The general terminology is as follows:

- A "handler" is the function that responds to a "Request Based IPC" event.
- A "listener" is the function that is called when a "Event Based IPC" event is emitted.

To register either a handler or a listener, you should do something like the following:

```typescript
import { LensMainExtension, Interface, Types } from "@k8slens/extensions";

export class ExampleExtensionMain extends LensMainExtension {
  onActivate() {
    this.disposers.push(
      this.listenIpc({
        channel: "initialize",
        listener: this.initializeListener,
        verifier: this.initializeVerifier,
      })
    );
  }

  initializeListener = (event: Types.IpcMainEvent, uid: string) => {
    console.log(`starting to initialize: ${uid}`);
  };

  initializeVerifier = (args: unknown[]): args is [uid: string] => {
    return args.length === 1 && typeof args[0] === "string";
  }
}
```

If you want to register a "handler" you would call `this.handleIpc(...)` instead.

The `LensExtension.prototype.disopsers` is a list of `() => void`'s (or `Utils.Disposer`'s).
Those functions are sort of like destructors in that they should clean up some state.
Some functions return them to indicate that it will clean up the state which was just registered.

As an extension developer you do not need to run them yourself.
Lens will run them when your extension gets deactivated or uninstalled.

### Note about verification

We require that extension developers provide a verification function when registering a listener or handler.
This is done as a preventative measure to help separate issues that can happen at runtime.
While it is possible to use the unary truth function, this is highly discouraged.

The verification function should do some cursory validation on the values send along the channel.
Your handler or listener will not be called if it fails this validation.
Instead an error or log message will occur.
This should help with debugging because you are notified immediately that there is a mismatch between what you are expecting and what was sent.

## Using IPC

Calling IPC is very simple.
If you are meaning to do an event based call, merely call `this.sendIpc(<channel>, ...<args>)` from within your extension.

If you are meaning to do a request based call from `renderer`, you should do `const res = await this.invokeIpc(<channel>, ...<args>));` instead.
