# Stores

Stores are components that persist and synchronize state data. Lens utilizes a number of stores for maintaining a variety of state information.
A few of these are exposed by the extensions api for use by the extension developer.

- The `ClusterStore` manages cluster state data such as cluster details, and which cluster is active.
- The `WorkspaceStore` similarly manages workspace state data, such as workspace name, and which clusters belong to a given workspace.
- The `ExtensionStore` is a store for managing custom extension state data.

## ExtensionStore

Extension developers can create their own store for managing state data by extending the `ExtensionStore` class.
This guide shows how to create a store for the [`appPreferences` guide example](../renderer-extension#apppreferences), which demonstrates how to add a custom preference to the Preferences page.
The preference is a simple boolean that indicates whether something is enabled or not.
The problem with that example is that the enabled state is not stored anywhere, and reverts to the default the next time Lens is started.

The following example code creates a store for the `appPreferences` guide example:

``` typescript
import { Store } from "@k8slens/extensions";
import { observable, toJS } from "mobx";

export type ExamplePreferencesModel = {
  enabled: boolean;
};

export class ExamplePreferencesStore extends Store.ExtensionStore<ExamplePreferencesModel> {

  @observable  enabled = false;

  private constructor() {
    super({
      configName: "example-preferences-store",
      defaults: {
        enabled: false
      }
    });
  }
 
  protected fromStore({ enabled }: ExamplePreferencesModel): void {
    this.enabled = enabled;
  }

  toJSON(): ExamplePreferencesModel {
    return toJS({
      enabled: this.enabled
    }, {
      recurseEverything: true
    });
  }
}

export const examplePreferencesStore = ExamplePreferencesStore.getInstance<ExamplePreferencesStore>();
```

First the extension's data model is defined using a simple type, `ExamplePreferencesModel`, which has a single field, `enabled`, representing the preference's state.
`ExamplePreferencesStore` extends `Store.ExtensionStore`, based on the `ExamplePreferencesModel`.
The field `enabled` is added to the `ExamplePreferencesStore` class to hold the "live" or current state of the preference.
Note the use of the `observer` decorator on the `enabled` field.
As for the [`appPreferences` guide example](../renderer-extension#apppreferences), [`mobx`](https://mobx.js.org/README.html) is used for the UI state management, ensuring the checkbox updates when activated by the user.

Then the constructor and two abstract methods are implemented.
In the constructor, the name of the store (`"example-preferences-store"`), and the default (initial) value for the preference state (`enabled: false`) are specified. 
The `fromStore()` method is called by Lens internals when the store is loaded, and gives the extension the opportunity to retrieve the stored state data values based on the defined data model.
Here, the `enabled` field of the `ExamplePreferencesStore` is set to the value from the store whenever `fromStore()` is invoked.
The `toJSON()` method is complementary to `fromStore()`, and is called when the store is being saved.
`toJSON()` must provide a JSON serializable object, facilitating its storage in JSON format.
The `toJS()` function from [`mobx`](https://mobx.js.org/README.html) is convenient for this purpose, and is used here.

Finally, `examplePreferencesStore` is created by calling `ExamplePreferencesStore.getInstance<ExamplePreferencesStore>()`, and exported for use by other parts of the extension.
Note that `examplePreferencesStore` is a singleton, calling this function again will not create a new store.

The following example code, modified from the [`appPreferences` guide example](../renderer-extension#apppreferences) demonstrates how to use the extension store.
`examplePreferencesStore` must be loaded in the main process, where loaded stores are automatically saved when exiting Lens. This can be done in `./main.ts`:

``` typescript
import { LensMainExtension } from "@k8slens/extensions";
import { examplePreferencesStore } from "./src/example-preference-store";

export default class ExampleMainExtension extends LensMainExtension {
  async onActivate() {
    await examplePreferencesStore.loadExtension(this);
  }
}
```

Here, `examplePreferencesStore` is loaded with `examplePreferencesStore.loadExtension(this)`, which is conveniently called from the `onActivate()` method of `ExampleMainExtension`.
Similarly, `examplePreferencesStore` must be loaded in the renderer process where the `appPreferences` are handled. This can be done in `./renderer.ts`:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import { ExamplePreferenceHint, ExamplePreferenceInput } from "./src/example-preference";
import { examplePreferencesStore } from "./src/example-preference-store";
import React from "react";

export default class ExampleRendererExtension extends LensRendererExtension {

  async onActivate() {
    await examplePreferencesStore.loadExtension(this);
  }

  appPreferences = [
    {
      title: "Example Preferences",
      components: {
        Input: () => <ExamplePreferenceInput preference={examplePreferencesStore}/>,
        Hint: () => <ExamplePreferenceHint/>
      }
    }
  ];
}
```

Again, `examplePreferencesStore.loadExtension(this)` is called to load `examplePreferencesStore`, this time from the `onActivate()` method of `ExampleRendererExtension`.
Also, there is no longer the need for the `preference` field in the `ExampleRendererExtension` class, as the props for `ExamplePreferenceInput` is now `examplePreferencesStore`.
`ExamplePreferenceInput` is defined in `./src/example-preference.tsx`:

``` typescript
import { Component } from "@k8slens/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ExamplePreferencesStore } from "./example-preference-store";

export class ExamplePreferenceProps {
  preference: ExamplePreferencesStore;
}

@observer
export class ExamplePreferenceInput extends React.Component<ExamplePreferenceProps> {

  render() {
    const { preference } = this.props;
    
    return (
      <Component.Checkbox
        label="I understand appPreferences"
        value={preference.enabled}
        onChange={v => { preference.enabled = v; }}
      />
    );
  }
}

export class ExamplePreferenceHint extends React.Component {
  render() {
    return (
      <span>This is an example of an appPreference for extensions.</span>
    );
  }
}
```

The only change here is that `ExamplePreferenceProps` defines its `preference` field as an `ExamplePreferencesStore` type.
Everything else works as before except now the `enabled` state persists across Lens restarts because it is managed by the 
`examplePreferencesStore`.