import { expect, test } from 'vitest';
import { hello } from './index';

test('hello function', () => {
    expect(hello()).toBe('Hello from Dotzee library!');
});
