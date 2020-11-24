# Working with mobx

## Introduction

Lens uses `mobx` as its state manager on top of React's state management system.
This helps with having a more declarative style of managing state, as opposed to `React`'s native `setState` mechanism.
You should already have a basic understanding of how `React` handles state ([read here](https://reactjs.org/docs/faq-state.html) for more information).
However, if you do not, here is a quick overview.

- A `React.Component` is generic over both `Props` and `State` (with default empty object types).
- `Props` should be considered read-only from the point of view of the component and is the mechanism for passing in "arguments" to a component.
- `State` is a component's internal state and can be read by accessing the parent field `state`.
- `State` **must** be updated using the `setState` parent method which merges the new data with the old state.
- `React` does do some optimizations around re-rendering components after quick successions of `setState` calls.

## How mobx works:

`mobx` is a package that provides an abstraction over `React`'s state management. The three main concepts are:
- `observable`: data stored in the component's `state`
- `action`: a function that modifies any `observable` data
- `computed`: data that is derived from `observable` data but is not actually stored. Think of this as computing `isEmpty` vs an `observable` field called `count`.

Further reading is available from `mobx`'s [website](https://mobx.js.org/the-gist-of-mobx.html).
