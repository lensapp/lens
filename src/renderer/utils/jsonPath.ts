// Helper to convert strings used for jsonPath where \. or - is present to use indexed notation,
// for example: .metadata.labels.kubesphere\.io/alias-name -> .metadata.labels['kubesphere\.io/alias-name']

export function parseJsonPath(jsonPath: string) {
  let pathExpression = jsonPath;

  if (jsonPath.match(/[\\-]/g)) { // search for '\' and '-'
    const [first, ...rest] = jsonPath.split(/(?<=\w)\./); // split jsonPath by '.' (\. cases are ignored)

    pathExpression = `${convertToIndexNotation(first, true)}${rest.map(value => convertToIndexNotation(value)).join("")}`;
  }

  // strip '\' characters from the result
  return pathExpression.replace(/\\/g, "");
}

function convertToIndexNotation(key: string, firstItem = false) {
  if (key.match(/[\\-]/g)) { // check if found '\' and '-' in key
    if (key.includes("[")) { // handle cases where key contains [...]
      const keyToConvert = key.match(/^.*(?=\[)/g); // get the text from the key before '['

      if (keyToConvert && keyToConvert[0].match(/[\\-]/g)) { // check if that part contains illegal characters
        return key.replace(keyToConvert[0], `['${keyToConvert[0]}']`); // surround key with '[' and ']'
      } else {
        return `.${key}`; // otherwise return as is with leading '.'
      }
    }

    return `['${key}']`;
  } else { // no illegal chracters found, do not touch
    const prefix = firstItem ? "" : ".";

    return `${prefix}${key}`;
  }
}
