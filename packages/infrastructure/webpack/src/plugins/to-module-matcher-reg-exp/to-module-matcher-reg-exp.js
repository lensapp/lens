const toModuleMatcherRegExp = x => new RegExp(`^${x}(/.*)*$`);

module.exports = { toModuleMatcherRegExp };
