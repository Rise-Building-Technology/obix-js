const { PathError, PathTraversalError } = require('./errors');

const stripPaths = (paths) => {
  paths = makeArray(paths);
  paths = paths.filter((p) => p);
  if (paths.length === 0) {
    throw new PathError('Missing Path');
  }
  paths = paths.map((p) => {
    if (p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    if (p.charAt(0) === '/') p = p.slice(1);
    if (p.includes('..')) throw new PathTraversalError(p);
    return p;
  });
  return paths;
};

const makeArray = (data) => {
  if (data) {
    return Array.isArray(data) ? data : [data];
  } else {
    return [];
  }
};

const replaceSpecialChars = (value) => {
  // https://stackoverflow.com/questions/1091945/what-characters-do-i-need-to-escape-in-xml-documents#:~:text=XML%20escape%20characters,the%20W3C%20Markup%20Validation%20Service.
  const specialChars = [
    // & must go first or it will replace the escape from the other symbols
    { symbol: '&', escape: '&amp;' },
    { symbol: '"', escape: '&quot;' },
    { symbol: "'", escape: '&apos;' },
    { symbol: '<', escape: '&lt;' },
    { symbol: '>', escape: '&gt;' },
  ];
  value = String(value);
  specialChars.forEach((sc) => {
    value = value.replaceAll(sc.symbol, sc.escape);
  });
  return value;
};

const xmlElementForValue = (value) => {
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'number') return 'real';
  return 'str';
};

module.exports = { stripPaths, makeArray, replaceSpecialChars, xmlElementForValue };
