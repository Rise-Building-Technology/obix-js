const { PathError, PathTraversalError } = require('../src/errors');
const { stripPaths, makeArray, replaceSpecialChars, xmlElementForValue } = require('../src/helpers');

describe('Helpers', () => {
  describe('stripPaths', () => {
    test("removes the leading and ending '/' from a single path", () => {
      const path = '/Testing/Path/';
      const results = stripPaths(path);
      expect(results).toEqual(['Testing/Path']);
    });
    test("removes the leading and ending '/' from an array of paths", () => {
      const paths = ['/Testing/Path/', 'Testing/Path2/'];
      const results = stripPaths(paths);
      expect(results).toEqual(['Testing/Path', 'Testing/Path2']);
    });
    test('throws PathTraversalError for paths containing ..', () => {
      expect(() => stripPaths('../../watchService/make')).toThrow(PathTraversalError);
      expect(() => stripPaths('test/../admin')).toThrow(PathTraversalError);
    });
    test('throws error if there is no path / paths', () => {
      expect.assertions(2);
      try {
        const paths = [];
        stripPaths(paths);
      } catch (error) {
        expect(error).toBeInstanceOf(PathError);
      }
      try {
        const path = null;
        stripPaths(path);
      } catch (error) {
        expect(error).toBeInstanceOf(PathError);
      }
    });
  });

  describe('makeArray', () => {
    test('should make an array if passed a single value', () => {
      const result = makeArray('value');
      expect(result).toEqual(['value']);
    });
    test('should make an array if passed an array', () => {
      const result = makeArray(['value', 'value2']);
      expect(result).toEqual(['value', 'value2']);
    });
  });

  describe('replaceSpecialChars', () => {
    test('should replace all special characters', () => {
      const input = '& " < > \'';
      const expected = '&amp; &quot; &lt; &gt; &apos;';
      const result = replaceSpecialChars(input);
      expect(result).toEqual(expected);
    });
    test('should not modify input without special characters', () => {
      const input = 'Hello World';
      const result = replaceSpecialChars(input);
      expect(result).toEqual(input);
    });
    test('should handle empty string input', () => {
      const input = '';
      const result = replaceSpecialChars(input);
      expect(result).toEqual(input);
    });
    test('should coerce non-string input to string', () => {
      const input = 42;
      const result = replaceSpecialChars(input);
      expect(result).toEqual('42');
    });
  });

  describe('xmlElementForValue', () => {
    test('should return bool for boolean values', () => {
      expect(xmlElementForValue(true)).toBe('bool');
      expect(xmlElementForValue(false)).toBe('bool');
    });
    test('should return real for number values', () => {
      expect(xmlElementForValue(42)).toBe('real');
      expect(xmlElementForValue(3.14)).toBe('real');
    });
    test('should return str for string and other values', () => {
      expect(xmlElementForValue('hello')).toBe('str');
      expect(xmlElementForValue('')).toBe('str');
    });
  });
});
