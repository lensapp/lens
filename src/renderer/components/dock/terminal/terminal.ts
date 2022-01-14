/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import debounce from "lodash/debounce";
import { reaction } from "mobx";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type { DockStore, TabId } from "../dock-store/dock.store";
import { TerminalApi, TerminalChannels } from "../../../api/terminal-api";
import { ThemeStore } from "../../../theme.store";
import { disposer } from "../../../utils";
import { isMac, defaultFontFamily } from "../../../../common/vars";
import { once } from "lodash";
import { UserStore } from "../../../../common/user-store";
import { clipboard } from "electron";
import logger from "../../../../common/logger";

interface Dependencies {
  dockStore: DockStore
}

export class Terminal {
  public static get spawningPool() {
    return document.getElementById("terminal-init");
  }

  static async preloadFonts() {
    const fontPath = require("../../fonts/roboto-mono-nerd.ttf").default; // eslint-disable-line @typescript-eslint/no-var-requires
    const fontFace = new FontFace("RobotoMono", `url(${fontPath})`);

    await fontFace.load();
    document.fonts.add(fontFace);
  }

  private xterm: XTerm | null = new XTerm({
    cursorBlink: true,
    cursorStyle: "bar",
    fontSize: UserStore.getInstance().terminalFontSize || 22,
    fontFamily: UserStore.getInstance().terminalFontFamily || defaultFontFamily,
  });
  private readonly fitAddon = new FitAddon();
  private scrollPos = 0;
  private disposer = disposer();

  get elem() {
    return this.xterm?.element;
  }

  get viewport() {
    return this.xterm.element.querySelector(".xterm-viewport");
  }

  get isActive() {
    const { isOpen, selectedTabId } = this.dependencies.dockStore;

    return isOpen && selectedTabId === this.tabId;
  }

  attachTo(parentElem: HTMLElement) {
    parentElem.appendChild(this.elem);
    this.onActivate();
  }

  detach() {
    const { elem } = this;

    if (elem) {
      Terminal.spawningPool.appendChild(elem);
    }
  }

  constructor(private dependencies: Dependencies, public tabId: TabId, protected api: TerminalApi) {
    // enable terminal addons
    this.xterm.loadAddon(this.fitAddon);

    this.xterm.open(Terminal.spawningPool);
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
      dependencies.dockStore.onResize(this.onResize),
      () => onDataHandler.dispose(),
      () => this.fitAddon.dispose(),
      () => this.api.removeAllListeners(),
      () => window.removeEventListener("resize", this.onResize),
      () => this.elem.removeEventListener("contextmenu", this.onContextMenu),
    );
  }

  destroy() {
    if (this.xterm) {
      this.disposer();
      this.xterm.dispose();
      this.xterm = null;
    }
  }

  fit = () => {
    // Since this function is debounced we need to read this value as late as possible
    if (!this.isActive || !this.xterm) {
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
      UserStore.getInstance().terminalCopyOnSelect

      // don't paste if the clipboard doesn't have text
      && clipboard.availableFormats().includes("text/plain")
    ) {
      this.xterm.paste(clipboard.readText());
    }
  };

  onSelectionChange = () => {
    const selection = this.xterm.getSelection().trim();

    if (UserStore.getInstance().terminalCopyOnSelect && selection) {
      clipboard.writeText(selection);
    }
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
