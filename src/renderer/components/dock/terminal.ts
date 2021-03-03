import debounce from "lodash/debounce";
import { reaction, toJS } from "mobx";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { dockStore, TabId } from "./dock.store";
import { TerminalApi } from "../../api/terminal-api";
import { themeStore } from "../../theme.store";
import { autobind } from "../../utils";

export class Terminal {
  private static readonly ColorPrefix = "terminal";
  private static readonly SpawningPool = document.getElementById("terminal-init");

  static async preloadFonts() {
    const { default: fontPath } = await import("../fonts/roboto-mono-nerd.ttf");
    const fontFace = new FontFace("RobotoMono", `url(${fontPath})`);

    await fontFace.load();
    document.fonts.add(fontFace);
  }

  public xterm: XTerm;
  public fitAddon: FitAddon;
  public scrollPos = 0;
  public disposers: Function[] = [];

  /**
   * Removes the ColorPrefix from the start of the string and makes the final
   * string camelcase.
   * @param src a color theme entry that starts with `Terminal.ColorPrefix`
   */
  private static toColorName(src: string): string {
    return src.charAt(Terminal.ColorPrefix.length).toLowerCase() + src.substring(Terminal.ColorPrefix.length + 1);
  }

  @autobind()
  protected setTheme(colors: Record<string, string>) {
    // Replacing keys stored in styles to format accepted by terminal
    // E.g. terminalBrightBlack -> brightBlack
    const terminalColorEntries = Object.entries(colors)
      .filter(([name]) => name.startsWith(Terminal.ColorPrefix))
      .map(([name, color]) => [Terminal.toColorName(name), color]);

    this.xterm.setOption("theme", Object.fromEntries(terminalColorEntries));
  }

  get elem() {
    return this.xterm.element;
  }

  get viewport() {
    return this.xterm.element.querySelector(".xterm-viewport");
  }

  constructor(public tabId: TabId, protected api: TerminalApi) {
    this.init();
  }

  get isActive() {
    const { isOpen, selectedTabId } = dockStore;

    return isOpen && selectedTabId === this.tabId;
  }

  attachTo(parentElem: HTMLElement) {
    parentElem.appendChild(this.elem);
    this.onActivate();
  }

  detach() {
    Terminal.SpawningPool.appendChild(this.elem);
  }

  async init() {
    if (this.xterm) {
      return;
    }
    this.xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: 13,
      fontFamily: "RobotoMono"
    });

    // enable terminal addons
    this.fitAddon = new FitAddon();
    this.xterm.loadAddon(this.fitAddon);

    this.xterm.open(Terminal.SpawningPool);
    this.xterm.registerLinkMatcher(/https?:\/\/[^\s]+/i, this.onClickLink);
    this.xterm.attachCustomKeyEventHandler(this.keyHandler);

    // bind events
    const onDataHandler = this.xterm.onData(this.onData);

    this.viewport.addEventListener("scroll", this.onScroll);
    this.api.onReady.addListener(this.onClear, { once: true }); // clear status logs (connecting..)
    this.api.onData.addListener(this.onApiData);
    window.addEventListener("resize", this.onResize);

    this.disposers.push(
      reaction(() => toJS(themeStore.activeTheme.colors), this.setTheme, {
        fireImmediately: true
      }),
      dockStore.onResize(this.onResize),
      () => onDataHandler.dispose(),
      () => this.fitAddon.dispose(),
      () => this.api.removeAllListeners(),
      () => window.removeEventListener("resize", this.onResize),
    );
  }

  destroy() {
    if (!this.xterm) return;
    this.disposers.forEach(dispose => dispose());
    this.disposers = [];
    this.xterm.dispose();
    this.xterm = null;
  }

  fit = () => {
    // Since this function is debounced we need to read this value as late as possible
    if (!this.isActive) return;

    this.fitAddon.fit();
    const { cols, rows } = this.xterm;

    this.api.sendTerminalSize(cols, rows);
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
    this.api.sendCommand(data);
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

  keyHandler = (evt: KeyboardEvent): boolean => {
    const { code, ctrlKey, type } = evt;

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

    // Pass the event above in DOM for <Dock/> to handle common actions
    if (!evt.defaultPrevented) {
      this.elem.dispatchEvent(new KeyboardEvent(type, evt));
    }

    return true;
  };
}
