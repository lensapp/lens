/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { IReactionPublic, IReactionOptions, IReactionDisposer } from "mobx";
import { reaction } from "mobx";
import type { Disposer } from "./disposer";

/**
 * Similar to mobx's builtin `reaction` function but supports returning a
 * disposer from `effect` that will be cancelled everytime a new reaction is
 * fired and when the reaction is disposed.
 */
export function disposingReaction<T, FireImmediately extends boolean = false>(expression: (r: IReactionPublic) => T, effect: (arg: T, prev: FireImmediately extends true ? T | undefined : T, r: IReactionPublic) => Disposer, opts?: IReactionOptions<T, FireImmediately>): IReactionDisposer {
  let prevDisposer: Disposer;

  const reactionDisposer = reaction<T, FireImmediately>(expression, (arg: T, prev: T, r: IReactionPublic) => {
    prevDisposer?.();
    prevDisposer = effect(arg, prev, r);
  }, opts);

  return Object.assign(() => {
    reactionDisposer();
    prevDisposer?.();
  }, reactionDisposer);
}
