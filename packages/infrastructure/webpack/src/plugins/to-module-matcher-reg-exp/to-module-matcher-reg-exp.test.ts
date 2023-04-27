import { toModuleMatcherRegExp } from "./to-module-matcher-reg-exp";

describe('to-module-matcher-reg-exp', () => {
  let regExp: RegExp;

  beforeEach(() => {
    regExp = toModuleMatcherRegExp("some-package");
  });

  it('given exactly matching package, matches', () => {
    const targetString = 'some-package';

    const [match] = targetString.match(regExp)!;

    expect(match).toBeTruthy()
  });

  it('given matching package with entrypoint, matches', () => {
    const targetString = 'some-package/some-entrypoint';

    const [match] = targetString.match(regExp)!;

    expect(match).toBeTruthy()
  });

  it('given matching package with directory, matches', () => {
    const targetString = 'some-package/some-directory/some-other-directory';

    const [match] = targetString.match(regExp)!;

    expect(match).toBeTruthy()
  });

  it('given package that starts with same name but is still different, does not match', () => {
    const targetString = 'some-package-but-still-different';

    const actual = targetString.match(regExp);

    expect(actual).toBeNull()
  });

  it('given package that starts with something else, does not match', () => {
    const targetString = 'different-some-package';

    const actual = targetString.match(regExp);

    expect(actual).toBeNull()
  });

  it('given irrelevant package, does not match', () => {
    const targetString = 'some-other-package';

    const actual = targetString.match(regExp);

    expect(actual).toBeNull()
  });
});
