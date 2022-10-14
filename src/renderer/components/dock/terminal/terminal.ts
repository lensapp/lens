/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import debounce from "lodash/debounce";
import type { IComputedValue } from "mobx";
import { reaction } from "mobx";
import type { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type { TabId } from "../dock/store";
import type { TerminalApi } from "../../../api/terminal-api";
import { disposer } from "../../../utils";
import { once } from "lodash";
import { clipboard } from "electron";
import type { Logger } from "../../../../common/logger";
import type { TerminalConfig } from "../../../../common/user-store/preferences-helpers";
import assert from "assert";
import { TerminalChannels } from "../../../../common/terminal/channels";
import { LinkProvider } from "xterm-link-provider";
import type { OpenLinkInBrowser } from "../../../../common/utils/open-link-in-browser.injectable";
import type { CreateTerminalRenderer } from "./create-renderer.injectable";

export interface TerminalDependencies {
  readonly spawningPool: HTMLElement;
  readonly terminalConfig: IComputedValue<TerminalConfig>;
  readonly terminalCopyOnSelect: IComputedValue<boolean>;
  readonly isMac: boolean;
  readonly xtermColorTheme: IComputedValue<Record<string, string>>;
  readonly logger: Logger;
  openLinkInBrowser: OpenLinkInBrowser;
  createTerminalRenderer: CreateTerminalRenderer;
}

export interface TerminalArguments {
  tabId: TabId;
  api: TerminalApi;
}

export class Terminal {
  private readonly xterm: XTerminal;
  private readonly fitAddon = new FitAddon();
  private scrollPos = 0;
  private readonly disposer = disposer();
  public readonly tabId: TabId;
  protected readonly api: TerminalApi;

  private get elem() {
    const { element } = this.xterm;

    assert(element, "Terminal element must be mounted");

    return element;
  }

  private get viewport() {
    const viewport = this.elem.querySelector(".xterm-viewport");

    assert(viewport, 'Terminal element must have a descendant with a className of ".xterm-viewport"');

    return viewport;
  }

  attachTo(parentElem: HTMLElement) {
    assert(this.elem, "Terminal should always be mounted somewhere");
    parentElem.appendChild(this.elem);
    this.onActivate();
  }

  detach() {
    const { elem } = this;

    if (elem) {
      this.dependencies.spawningPool.appendChild(elem);
    }
  }

  private get fontFamily() {
    return this.dependencies.terminalConfig.get().fontFamily;
  }

  private get fontSize() {
    return this.dependencies.terminalConfig.get().fontSize;
  }

  constructor(protected readonly dependencies: TerminalDependencies, {
    tabId,
    api,
  }: TerminalArguments) {
    this.tabId = tabId;
    this.api = api;

    this.xterm = this.dependencies.createTerminalRenderer({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      theme: this.dependencies.xtermColorTheme.get(),
    });
    // enable terminal addons
    this.xterm.loadAddon(this.fitAddon);

    this.xterm.open(this.dependencies.spawningPool);
    this.xterm.attachCustomKeyEventHandler(this.keyHandler);
    this.xterm.onSelectionChange(this.onSelectionChange);

    // bind events
    const clearOnce = once(this.onClear);

    this.viewport.addEventListener("scroll", this.onScroll);
    this.elem.addEventListener("contextmenu", this.onContextMenu);
    this.api.once("ready", clearOnce);
    this.api.once("connected", clearOnce);
    this.api.on("data", this.onApiData);
    this.api.on("error", this.onApiError);
    window.addEventListener("resize", this.onResize);

    const linkProvider = new LinkProvider(
      this.xterm,
      /https?:\/\/[^\s]+/i,
      (event, link) => this.dependencies.openLinkInBrowser(link),
      undefined,
      0,
    );

    this.disposer.push(
      this.xterm.registerLinkProvider(linkProvider),
      reaction(
        () => this.dependencies.xtermColorTheme.get(),
        colors => this.xterm.options.theme = colors,
      ),
      reaction(() => this.fontSize, this.setFontSize),
      reaction(() => this.fontFamily, this.setFontFamily),
      this.xterm.onData(this.onData),
      () => this.fitAddon.dispose(),
      () => this.api.removeAllListeners(),
      () => window.removeEventListener("resize", this.onResize),
      () => this.elem.removeEventListener("contextmenu", this.onContextMenu),
      this.xterm.onResize(({ cols, rows }) => {
        this.api.sendTerminalSize(cols, rows);
      }),
    );
  }

  destroy() {
    this.disposer();
    this.xterm.dispose();
  }

  fit = () => this.fitAddon.fit();

  fitLazy = debounce(this.fit, 250);

  focus = () => {
    this.xterm.focus();
  };

  onApiData = (data: string) => {
    this.xterm.write(data);
  };

  onApiError = (data: string) => {
    this.xterm.writeln(data);
  };

  onData = (data: string) => {
    if (!this.api.isReady) return;
    this.api.sendMessage({
      type: TerminalChannels.STDIN,
      data,
    });
  };

  onScroll = () => {
    this.scrollPos = this.viewport.scrollTop;
  };

  onClear = () => {
    console.log("clearing");
    this.xterm.clear();
  };

  onResize = () => {
    this.fitLazy();
    this.focus();
  };

  onActivate = () => {
    this.fit();
    setTimeout(() => this.focus(), 250); // delay used to prevent focus on active tab
    this.viewport.scrollTop = this.scrollPos; // restore last scroll position
  };

  onContextMenu = () => {
    if (
      // don't paste if user hasn't turned on the feature
      this.dependencies.terminalCopyOnSelect.get()

      // don't paste if the clipboard doesn't have text
      && clipboard.availableFormats().includes("text/plain")
    ) {
      this.xterm.paste(clipboard.readText());
    }
  };

  onSelectionChange = () => {
    const selection = this.xterm.getSelection().trim();

    if (this.dependencies.terminalCopyOnSelect.get() && selection) {
      clipboard.writeText(selection);
    }
  };

  setFontSize = (fontSize: number) => {
    this.dependencies.logger.info(`[TERMINAL]: set fontSize to ${fontSize}`);

    this.xterm.options.fontSize = fontSize;
    this.fit();
  };

  setFontFamily = (fontFamily: string) => {
    this.dependencies.logger.info(`[TERMINAL]: set fontFamily to ${fontFamily}`);

    this.xterm.options.fontFamily = fontFamily;
    this.fit();

    // provide css-variable within `:root {}`
    document.documentElement.style.setProperty("--font-terminal", fontFamily);
  };

  keyHandler = (evt: KeyboardEvent): boolean => {
    const { code, ctrlKey, metaKey } = evt;

    // Handle custom hotkey bindings
    if (ctrlKey) {
      switch (code) {
        // Ctrl+C: prevent terminal exit on windows / linux (?)
        case "KeyC":
          if (this.xterm.hasSelection()) return false;
          break;

        // Ctrl+W: prevent unexpected terminal tab closing, e.g. editing file in vim
        case "KeyW":
          evt.preventDefault();
          break;
      }
    }

    //Ctrl+K: clear the entire buffer, making the prompt line the new first line on mac os
    if (this.dependencies.isMac && metaKey) {
      switch (code) {
        case "KeyK":
          this.onClear();
          break;
      }
    }

    return true;
  };
}
