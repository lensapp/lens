import { observable, reaction } from "mobx";
import { setupI18n } from "@lingui/core";
import { autobind, createStorage } from "./utils";
import orderBy from "lodash/orderBy"

import moment from "moment";
import "moment/locale/ru";
import "moment/locale/fi";

export interface ILanguage {
  code: string;
  title: string;
  nativeTitle: string;
}

export const _i18n = setupI18n({
  missing: (message, id) => {
    console.warn('Missing localization:', message, id);
    return id;
  }
});

@autobind()
export class LocalizationStore {
  readonly defaultLocale = "en"
  @observable activeLang = this.defaultLocale;

  public languages: ILanguage[] = orderBy<ILanguage>([
    { code: "en", title: "English", nativeTitle: "English" },
    { code: "ru", title: "Russian", nativeTitle: "Русский" },
    // { code: "fi", title: "Finnish", nativeTitle: "Suomi" },
  ], "title");

  constructor() {
    const storage = createStorage("lang_ui", this.defaultLocale);
    this.activeLang = storage.get();
    reaction(() => this.activeLang, lang => storage.set(lang));
  }

  async init() {
    await this.setLocale(this.activeLang);
  }

  async load(locale: string) {
    const catalog = await import(
      /* webpackMode: "lazy", webpackChunkName: "locale/[request]" */
      `@lingui/loader!../locales/${locale}/messages.po`
    );
    return _i18n.load(locale, catalog);
  }

  async setLocale(locale: string) {
    await this.load(locale);
    await _i18n.activate(locale);

    // set moment's locale before activeLang for proper next render() in app
    moment.locale(locale);
    this.activeLang = locale;
  }
}

export const i18nStore = new LocalizationStore();