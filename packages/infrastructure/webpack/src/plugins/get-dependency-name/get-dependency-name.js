const getDependencyName = (requireString) => {
  const [a, b] = requireString.split("/");

  const scoped = a.startsWith("@");

  return scoped ? `${a}/${b}` : a;
};

module.exports = { getDependencyName };
