/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isEmail, isUrl, systemName } from "../input_validators";

type TextValidationCase = [string, boolean];

describe("input validation tests", () => {
  describe("isEmail tests", () => {
    const tests: TextValidationCase[] = [
      ["abc@news.com", true],
      ["abc@news.co.uk", true],
      ["abc1.3@news.co.uk", true],
      ["abc1.3@news.name", true],
      ["@news.com", false],
      ["abcnews.co.uk", false],
      ["abc1.3@news", false],
      ["abc1.3@news.name.a.b.c.d.d", false],
    ];

    it.each(tests)("validate %s", (input, output) => {
      expect(isEmail.validate(input, {})).toBe(output);
    });
  });

  describe("isUrl tests", () => {
    const cases: TextValidationCase[] = [
      ["https://github-production-registry-package-file-4f11e5.s3.amazonaws.com/307985088/68bbbf00-309f-11eb-8457-a15e4efe9e77?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20201127%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20201127T123754Z&X-Amz-Expires=300&X-Amz-Signature=9b8167f00685a20d980224d397892195abc187cdb2934cefb79edcd7ec600f78&X-Amz-SignedHeaders=host&actor_id=0&key_id=0&repo_id=0&response-content-disposition=filename%3Dstarboard-lens-extension-0.0.1-alpha.1-npm.tgz&response-content-type=application%2Foctet-stream", true],
      ["google.ca", false],
      ["", false],
      [".", false],
      ["google.askdgjkhsadjkhdas.dsakljsd", false],
      ["https://google.com", true],
      ["https://example.org", true],
      ["https://www.example.org", true],
    ];

    it.each(cases)("validate %s", (input, output) => {
      expect(isUrl.validate(input, {})).toBe(output);
    });
  });

  describe("systemName tests", () => {
    const tests: TextValidationCase[] = [
      ["a", true],
      ["ab", true],
      ["abc", true],
      ["1", true],
      ["12", true],
      ["123", true],
      ["1a2", true],
      ["1-2", true],
      ["1---------------2", true],
      ["1---------------2.a", true],
      ["1---------------2.a.1", true],
      ["1---------------2.9-a.1", true],
      ["", false],
      ["-", false],
      [".", false],
      ["as.", false],
      [".asd", false],
      ["a.-", false],
      ["a.1-", false],
      ["o.2-2.", false],
      ["o.2-2....", false],
    ];

    it.each(tests)("validate %s", (input, output) => {
      expect(systemName.validate(input, {})).toBe(output);
    });
  });
});
