/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { LEVEL, MESSAGE, SPLAT } from "triple-beam";
import chalk from "chalk";
import type { InspectOptions } from "util";
import { inspect } from "util";
import { omit } from "lodash";

// The following license was copied from https://github.com/duccio/winston-console-format/blob/master/LICENSE
// This was modified to support formatting causes

/*
The MIT License (MIT)

Copyright (c) 2014-2015 Eugeny Dementev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

export interface ConsoleFormatOptions {
  showMeta?: boolean;
  metaStrip?: string[];
  inspectOptions?: InspectOptions;
}

interface TransformableInfo {
  level: string;
  message: string;
  [key: string | symbol]: any;
}

export class ConsoleFormat {
  private static readonly reSpaces = /^\s+/;
  private static readonly reSpacesOrEmpty = /^(\s*)/;
  // eslint-disable-next-line no-control-regex
  private static readonly reColor = /\x1B\[\d+m/;
  private static readonly defaultStrip = [LEVEL, MESSAGE, SPLAT, "level", "message", "ms", "stack"];
  private static readonly chars = {
    singleLine: "▪",
    startLine: "┏",
    line: "┃",
    endLine: "┗",
  };

  private readonly showMeta: boolean;
  private readonly metaStrip: string[];
  private readonly inspectOptions: InspectOptions;

  public constructor(opts?: ConsoleFormatOptions) {
    this.showMeta = opts?.showMeta ?? true;
    this.metaStrip = opts?.metaStrip ?? [];
    this.inspectOptions = opts?.inspectOptions ?? {};
  }

  private getLines(value: unknown): string[] {
    return inspect(value, this.inspectOptions).split("\n");
  }

  private message(info: TransformableInfo, chr: string, color: string): string {
    const message = info.message.replace(
      ConsoleFormat.reSpacesOrEmpty,
      `$1${color}${chalk.dim(chr)}${chalk.reset(" ")}`,
    );

    return `${info.level}:${message}`;
  }

  private pad(message?: string): string {
    return message?.match(ConsoleFormat.reSpaces)?.[0] ?? "";
  }

  private ms(info: TransformableInfo): string {
    if (info.ms) {
      return chalk.italic(chalk.dim(` ${info.ms}`));
    }

    return "";
  }

  private stack(info: TransformableInfo): string[] {
    const messages: string[] = [];

    if (info.stack) {
      const error = new Error();

      error.stack = info.stack;
      messages.push(...this.getLines(error));
    }

    return messages;
  }

  private _cause(source: unknown): string[] {
    const messages: string[] = [];

    if (source instanceof Error && source.cause) {
      messages.push("Cause:");
      messages.push(...this.getLines(omit(source.cause, "response")).map(l => `    ${l}`));
      messages.push(...this._cause(source.cause));
    }

    return messages;
  }

  private cause(info: TransformableInfo): string[] {
    const splats = info[SPLAT];

    if (Array.isArray(splats)) {
      return splats.flatMap(splat => this._cause(splat));
    }

    return [];
  }

  private meta(info: TransformableInfo): string[] {
    const messages: string[] = [];
    const stripped = { ...info };

    ConsoleFormat.defaultStrip.forEach((e) => delete stripped[e]);
    this.metaStrip?.forEach((e) => delete stripped[e]);

    if (Object.keys(stripped).length > 0) {
      messages.push(...this.getLines(stripped));
    }

    return messages;
  }

  private getColor(info: TransformableInfo): string {
    return info.level.match(ConsoleFormat.reColor)?.[0] ?? "";
  }

  private write(info: TransformableInfo, messages: string[], color: string): void {
    const pad = this.pad(info.message);

    messages.forEach((line, index, arr) => {
      const lineNumber = chalk.dim(`[${(index + 1).toString().padStart(arr.length.toString().length, " ")}]`);
      let chr = ConsoleFormat.chars.line;

      if (index === arr.length - 1) {
        chr = ConsoleFormat.chars.endLine;
      }
      info[MESSAGE] += `\n${chalk.dim(info.level)}:${pad}${color}${chalk.dim(chr)}${chalk.reset(" ")}`;
      info[MESSAGE] += `${lineNumber} ${line}`;
    });
  }

  public transform(info: TransformableInfo): TransformableInfo {
    const messages: string[] = [];

    if (this.showMeta) {
      messages.push(...this.stack(info));
      messages.push(...this.meta(info));
      messages.push(...this.cause(info));
    }

    const color = this.getColor(info);

    info[MESSAGE] = this.message(info, ConsoleFormat.chars[messages.length > 0 ? "startLine" : "singleLine"], color);
    info[MESSAGE] += this.ms(info);

    this.write(info, messages, color);

    return info;
  }
}
