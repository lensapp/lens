import moment from "moment";
import { observable, reaction } from "mobx";
import { setupI18n } from "@lingui/core";
import orderBy from "lodash/orderBy"
import { autobind, createStorage } from "./utils";

const plurals: Record<string, Function> = require('make-plural/plurals'); // eslint-disable-line @typescript-eslint/no-var-requires

export interface ILanguage {
  code: string;
  title: string;
  nativeTitle: string;
}

export const _i18n = setupI18n({
  missing: (message, id) => {
    // console.warn('Missing localization:', message, id);
    return id;
  }
});

@autobind()
export class LocalizationStore {
  readonly defaultLocale = "en"
  @observable activeLang = this.defaultLocale;

  // todo: verify with package.json ling-ui "locales"
  public languages: ILanguage[] = orderBy<ILanguage>([
    { code: "en", title: "English", nativeTitle: "English" },
    { code: "ru", title: "Russian", nativeTitle: "Русский" },
    { code: "fi", title: "Finnish", nativeTitle: "Suomi" },
  ], "title");

  constructor() {
    const storage = createStorage("lang_ui", this.defaultLocale);
    this.activeLang = storage.get();
    reaction(() => this.activeLang, lang => storage.set(lang));
  }

  async init() {
    await this.setLocale(this.activeLang);
  }

  async setLocale(locale: string) {
    const catalog = require(`@lingui/loader!../../locales/${locale}/messages.po`); // eslint-disable-line @typescript-eslint/no-var-requires
    _i18n.loadLocaleData(locale, { plurals: plurals[locale] });
    _i18n.load(locale, catalog.messages);

    // set moment's locale before activeLang for proper next render() in app
    moment.locale(locale);
    this.activeLang = locale;

    await _i18n.activate(locale);
  }
}

export const i18nStore = new LocalizationStore();
