import zhCn from './zh-cn.js';
import enUs from './en-us.js';

const lang = {
  zhCn, enUs
};

export const languageList = Object.keys(lang).map((key) => {
  return {
    languageKey: key,
    languageName: lang[key].languageName
  }
})

export function getLang (langKey) {
  return lang[langKey] || enUs;
}
