/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
  } else { // no illegal characters found, do not touch
    const prefix = firstItem ? "" : ".";

    return `${prefix}${key}`;
  }
}
