# Testing Extensions

## Renderer Process Unit Testing

UI components in the extension's renderer process are based on React/ReactDOM.
These components can be tested by popular React testing tools like [React Testing Library](https://github.com/testing-library/react-testing-library).

If you are using the [Yeoman Lens Extension Generator](https://github.com/lensapp/generator-lens-ext) to scaffold extension project then the testing environment for render process is already set up for you.
Just use `npm start` or `yarn test` to run the tests.

For example, I have a component `GlobalPageMenuIcon` and want to test if `props.navigate` is called when user clicks the icon.

My component `GlobalPageMenuIcon`

```typescript
import React from "react"
import { Renderer } from "@k8slens/extensions";

const {
  Component: {
    Icon,
  },
} = Renderer;

const GlobalPageMenuIcon = ({ navigate }: { navigate?: () => void }): JSX.Element => (
  <Icon
    material="trip_origin"
    onClick={() => navigate()}
    data-testid="global-page-menu-icon"
  />
)
```

The test

```js
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react";

import GlobalPageMenuIcon from "./GlobalPageMenuIcon";

test("click called navigate()", () => {
    const navigate = jest.fn();
    render(<GlobalPageMenuIcon navigate={navigate} />);
    fireEvent.click(screen.getByTestId("global-page-menu-icon"));
    expect(navigate).toHaveBeenCalled();
  });
```

In the example we used [React Testing Library](https://github.com/testing-library/react-testing-library) but any React testing framework can be used to test renderer process UI components.

There are more example tests in the generator's [template](https://github.com/lensapp/generator-lens-ext/tree/main/generators/app/templates/ext-ts/components).
Extend your tests based on the examples.

## Main Process Unit Testing

Code in the extension's main process consists of normal JavaScript files that have access to extension api, you can write unit tests using any testing framework.

If you are using the [Yeoman Lens Extension Generator](https://github.com/lensapp/generator-lens-ext) to scaffold your extension project then the [Jest](https://jestjs.io/) testing environment is set up for you.
Just use  `npm start` or `yarn test` to run the tests.

## Tips

### Console.log

Extension developers might find `console.log()` useful for printing out information and errors from extensions.
To use `console.log()`, note that Lens is based on Electron, and that Electron has two types of processes: [Main and Renderer](https://www.electronjs.org/docs/tutorial/quick-start#main-and-renderer-processes).

### Renderer Process Logs

In the Renderer process, `console.log()` is printed in the Console in Developer Tools (**View** > **Toggle Developer Tools**).

### Main Process Logs

Viewing the logs from the Main process is a little trickier, since they cannot be printed using Developer Tools.

#### macOS

On macOS, view the Main process logs by running Lens from the terminal:

```bash
/Applications/Lens.app/Contents/MacOS/Lens
```

You can also use [Console.app](https://support.apple.com/en-gb/guide/console/welcome/mac) to view the Main process logs.

#### Linux

On Linux, you can access the Main process logs using the Lens PID.
First get the PID:

```bash
ps aux | grep Lens | grep -v grep
```

Then get the Main process logs using the PID:

```bash
tail -f /proc/[pid]/fd/1 # stdout (console.log)
tail -f /proc/[pid]/fd/2 # stdout (console.error)
```
