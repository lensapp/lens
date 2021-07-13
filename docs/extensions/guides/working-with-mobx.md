# Working with MobX

## Introduction

Lens uses MobX on top of React's state management system.
The result is a more declarative state management style, rather than React's native `setState` mechanism.

You can review how React handles state management [here](https://reactjs.org/docs/faq-state.html).

The following is a quick overview:

* `React.Component` is generic with respect to both `props` and `state` (which default to the empty object type).
* `props` should be considered read-only from the point of view of the component, and it is the mechanism for passing in arguments to a component.
* `state` is a component's internal state, and can be read by accessing the super-class field `state`.
* `state` **must** be updated using the `setState` parent method which merges the new data with the old state.
* React does some optimizations around re-rendering components after quick successions of `setState` calls.

## How MobX Works:

MobX is a package that provides an abstraction over React's state management system. The three main concepts are:

* `observable` is a marker for data stored in the component's `state`.
* `action` is a function that modifies any `observable` data.
* `computed` is a marker for data that is derived from `observable` data, but that is not actually stored. Think of this as computing `isEmpty` rather than an observable field called `count`.

Further reading is available on the [MobX website](https://mobx.js.org/the-gist-of-mobx.html).
