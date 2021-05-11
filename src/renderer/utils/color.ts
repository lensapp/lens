import Color from "color";

/**
 * Some notes:
 * - CSS colours use straight alpha channels:
 *    - https://en.wikipedia.org/wiki/Alpha_compositing
 *    - https://stackoverflow.com/a/45526785/5615967
 * - The `getComputedStyles` function does not do this already
 */

/**
 * Compute the "actual" color at an element by walking up the tree while
 * @param elem The root element to up the DOM from
 * @param field Which computedStyle field to work against
 */
export function computeStackingColor(elem: HTMLElement | undefined, field: "color" | "backgroundColor"): Color {
  if (!elem) {
    return Color.rgb(0, 0, 0).alpha(0);
  }

  const curColor = Color(window.getComputedStyle(elem)[field]);

  if (curColor.alpha() === 1) {
    return curColor;
  }

  return blend(computeStackingColor(elem.parentElement, field), curColor);
}

/**
 * Blends the two colors where the parent color is place beneath the child color.
 * And the returned color is what the browser would render.
 *
 * The parent color is placed beneath because child elements are rendered "above"
 * their DOM parents.
 * @param parent The color that is from the parent element
 * @param child The color that is from the child element
 */
export function blend(parent: Color, child: Color): Color {
  const alpha = (1 - child.alpha()) * parent.alpha() + child.alpha();
  const red = ((1 - child.alpha()) * parent.alpha() * parent.red() + child.alpha() * child.red()) / alpha;
  const green = ((1 - child.alpha()) * parent.alpha() * parent.green() + child.alpha() * child.green()) / alpha;
  const blue = ((1 - child.alpha()) * parent.alpha() * parent.blue() + child.alpha() * child.blue()) / alpha;

  return Color.rgb(red, green, blue).alpha(alpha);
}
