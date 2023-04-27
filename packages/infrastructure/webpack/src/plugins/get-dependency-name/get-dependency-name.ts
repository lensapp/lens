export const getDependencyName = (requireString: string) => {
  const [a, b] = requireString.split("/");

  const scoped = a.startsWith("@");

  return scoped ? `${a}/${b}` : a;
};
