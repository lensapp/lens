// Decorator for binding class methods to proper "this"-context.
// API: https://github.com/andreypopp/autobind-decorator
import bindMethodOrClass from "autobind-decorator"

// TODO: unwrap, replace calls @autobind() to @autobind
export function autobind<T extends object>() {
  return bindMethodOrClass;
}
