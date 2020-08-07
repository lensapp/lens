import { isEmail, systemName } from "./input.validators";

describe("input validation tests", () => {
  describe("isEmail tests", () => {
    it("should be valid", () => {
      expect(isEmail.validate("abc@news.com")).toBe(true);
      expect(isEmail.validate("abc@news.co.uk")).toBe(true);
      expect(isEmail.validate("abc1.3@news.co.uk")).toBe(true);
      expect(isEmail.validate("abc1.3@news.name")).toBe(true);
    });

    it("should be invalid", () => {
      expect(isEmail.validate("@news.com")).toBe(false);
      expect(isEmail.validate("abcnews.co.uk")).toBe(false);
      expect(isEmail.validate("abc1.3@news")).toBe(false);
      expect(isEmail.validate("abc1.3@news.name.a.b.c.d.d")).toBe(false);
    });
  });

  describe("systemName tests", () => {
    it("should be valid", () => {
      expect(systemName.validate("a")).toBe(true);
      expect(systemName.validate("ab")).toBe(true);
      expect(systemName.validate("abc")).toBe(true);
      expect(systemName.validate("1")).toBe(true);
      expect(systemName.validate("12")).toBe(true);
      expect(systemName.validate("123")).toBe(true);
      expect(systemName.validate("1a2")).toBe(true);
      expect(systemName.validate("1-2")).toBe(true);
      expect(systemName.validate("1---------------2")).toBe(true);
      expect(systemName.validate("1---------------2.a")).toBe(true);
      expect(systemName.validate("1---------------2.a.1")).toBe(true);
      expect(systemName.validate("1---------------2.9-a.1")).toBe(true);
    });

    it("should be invalid", () => {
      expect(systemName.validate("")).toBe(false);
      expect(systemName.validate("-")).toBe(false);
      expect(systemName.validate(".")).toBe(false);
      expect(systemName.validate("as.")).toBe(false);
      expect(systemName.validate(".asd")).toBe(false);
      expect(systemName.validate("a.-")).toBe(false);
      expect(systemName.validate("a.1-")).toBe(false);
      expect(systemName.validate("o.2-2.")).toBe(false);
      expect(systemName.validate("o.2-2....")).toBe(false);
    });
  });
});