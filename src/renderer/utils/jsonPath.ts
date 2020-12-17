
export function parseJsonPath(jsonPath: string) {
  let pathExpression = jsonPath;

  if (!jsonPath.includes("[") && jsonPath.includes("\\")) {
    // convert cases where \. is present to use indexed notation,
    // for example: .metadata.labels.kubesphere\.io/alias-name -> .metadata['labels']['kubesphere\.io/alias-name']
    const columnArr = jsonPath.split(/(?<=\w)\./);

    columnArr.forEach((value, index) => {
      if (index == 0) {
        pathExpression = `${value}`;
      } else {
        pathExpression += `['${value}']`;
      }
    });
  }

  // strip '\' characters from the result
  return pathExpression.replace(/\\/g, "");
}