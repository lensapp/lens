import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import { ExamplePage } from "../page";

test('two plus two is four', () => {
  const { container } = render(<ExamplePage extension={this} />);
  expect(container).toBeInstanceOf(HTMLElement);
});
