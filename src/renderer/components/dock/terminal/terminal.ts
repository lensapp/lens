/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import debounce from "lodash/debounce";
import type { IComputedValue } from "mobx";
import { reaction } from "mobx";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type { TabId } from "../dock/store";
import type { TerminalApi } from "../../../api/terminal-api";
import { TerminalChannels } from "../../../api/terminal-api";
import { ThemeStore } from "../../../theme.store";
import { disposer } from "../../../utils";
import { isMac } from "../../../../common/vars";
import { once } from "lodash";
import { clipboard } from "electron";
import logger from "../../../../common/logger";
import type { TerminalConfig } from "../../../../common/user-store/preferences-helpers";
import assert from "assert";

export interface TerminalDependencies {
  readonly spawningPool: HTMLElement;
  readonly terminalConfig: IComputedValue<TerminalConfig>;
  readonly terminalCopyOnSelect: IComputedValue<boolean>;
}

export interface TerminalArguments {
  tabId: TabId;
  api: TerminalApi;
}

export class Terminal {
  private readonly xterm: XTerm;
  private readonly fitAddon = new FitAddon();
  private scrollPos = 0;
  private readonly disposer = disposer();
  public readonly tabId: TabId;
  protected readonly api: TerminalApi;

  private get elem() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.xterm.element!;
  }

  private get viewport() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.elem.querySelector(".xterm-viewport")!;
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

  constructor(protected readonly dependencies: TerminalDependencies, { tabId, api }: TerminalArguments) {
    this.tabId = tabId;
    this.api = api;
    const { fontSize, fontFamily } = this.dependencies.terminalConfig.get();

    this.xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize,
      fontFamily,
    });
    // enable terminal addons
    this.xterm.loadAddon(this.fitAddon);

    this.xterm.open(this.dependencies.spawningPool);
    this.xterm.registerLinkMatcher(/https?:\/\/[^\s]+/i, this.onClickLink);
    this.xterm.attachCustomKeyEventHandler(this.keyHandler);
    this.xterm.onSelectionChange(this.onSelectionChange);

    // bind events
    const onDataHandler = this.xterm.onData(this.onData);
    const clearOnce = once(this.onClear);

    this.viewport.addEventListener("scroll", this.onScroll);
    this.elem.addEventListener("contextmenu", this.onContextMenu);
    this.api.once("ready", clearOnce);
    this.api.once("connected", clearOnce);
    this.api.on("data", this.onApiData);
    window.addEventListener("resize", this.onResize);

    this.disposer.push(
      reaction(() => ThemeStore.getInstance().xtermColors, colors => {
        this.xterm?.setOption("theme", colors);
      }, {
        fireImmediately: true,
      }),
      reaction(() => this.dependencies.terminalConfig.get().fontSize, this.setFontSize, {
        fireImmediately: true,
      }),
      reaction(() => this.dependencies.terminalConfig.get().fontFamily, this.setFontFamily, {
        fireImmediately: true,
      }),
      () => onDataHandler.dispose(),
      () => this.fitAddon.dispose(),
      () => this.api.removeAllListeners(),
      () => window.removeEventListener("resize", this.onResize),
      () => this.elem.removeEventListener("contextmenu", this.onContextMenu),
    );
  }

  destroy() {
    this.disposer();
    this.xterm.dispose();
  }

  fit = () => {
    // Since this function is debounced we need to read this value as late as possible
    if (!this.xterm) {
      return;
    }

    try {
      this.fitAddon.fit();
      const { cols, rows } = this.xterm;

      this.api.sendTerminalSize(cols, rows);
    } catch (error) {
      // see https://github.com/lensapp/lens/issues/1891
      logger.error(`[TERMINAL]: failed to resize terminal to fit`, error);
    }
  };

  fitLazy = debounce(this.fit, 250);

  focus = () => {
    this.xterm.focus();
  };

  onApiData = (data: string) => {
    this.xterm.write(data);
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

  onClickLink = (evt: MouseEvent, link: string) => {
    window.open(link, "_blank");
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

  setFontSize = (size: number) => {
    this.xterm.options.fontSize = size;
  };

  setFontFamily = (family: string) => {
    this.xterm.options.fontFamily = family;
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
    if (isMac && metaKey) {
      switch (code) {
        case "KeyK":
          this.onClear();
          break;
      }
    }

    return true;
  };
}
