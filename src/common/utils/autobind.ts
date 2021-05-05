// Decorator for binding class methods to proper "this"-context.
// API: https://github.com/andreypopp/autobind-decorator
import bindMethodOrClass from "autobind-decorator"

// TODO: unwrap, replace usages of @autobind() to @autobind
export function autobind<T extends object>() {
  return function (target: { new(...args: any[]): T } | object, prop?: string, descriptor?: PropertyDescriptor) {
    return bindMethodOrClass(target, prop, descriptor) as any;
  };
}
