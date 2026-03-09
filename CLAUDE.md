# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@risebt/obix-js` is a JavaScript library for communicating with Tridium Niagara building automation systems via the oBIX (Open Building Information Xchange) protocol. It provides two client classes: `ObixInstance` for oBIX REST operations and `BQLInstance` for Niagara BQL queries. Requires Node.js >= 20.

## Commands

- `npm test` — run all tests (Jest)
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage
- `npx jest tests/requests/standard.test.js` — run a single test file
- `npx jest --testNamePattern="should handle valid boolean"` — run tests matching a pattern
- `npx eslint .` — lint all files
- `npx prettier --check .` — check formatting
- `npx prettier --write .` — fix formatting

No build step — this is a CommonJS Node.js library with `index.js` as the entry point.

CI runs on every push/PR to main (tests on Node 20/22 + lint). Publishing to npm triggers automatically on GitHub release.

## Architecture

### Entry Point (`index.js`)

Exports `ObixInstance` and `BQLInstance`. Both validate constructor params (host, port, username, password) and support `rejectUnauthorized` and `httpsAgent` options. Facade methods delegate directly to internal request classes without `async`/`await`.

### Source (`src/`)

- **`errors.js`** — All custom error classes consolidated here. `HTTPError` and `BQLHTTPError` extend a shared `BaseHTTPError` that matches errors by HTTP status code first, then falls back to message string matching. All errors expose `friendlyError` and `inDepthError` properties. Also contains `ProtocolError`, `PathError`, `PathTraversalError`, `InvalidTypeError`, `UnknownTypeError`, and the history/BQL query errors.
- **`axios.js`** — Creates axios instances. oBIX instances use XML-to-JSON transform (via `xml-js`) and throw `XMLParseError` on parse failure. BQL instances return raw HTML. Both handle auth, timeouts (default 10s), cookie persistence, and response error interception. `rejectUnauthorized` defaults to `false` (Niagara controllers commonly use self-signed certs); pass `true` to enforce certificate validation.
- **`helpers.js`** — `stripPaths` normalizes paths and rejects `..` traversal. `replaceSpecialChars` coerces all values to string before XML-escaping. `makeArray` ensures array type.
- **`parsers/values.js`** — Parses oBIX XML-to-JSON responses into `{ path, value, action }` objects. Handles `real`, `bool`, `str`, and `enum` types. `buildOutputList` guards against missing `data.list`.
- **`parsers/errors.js`** — Parses oBIX error responses (`err` elements) and throws appropriate error classes.
- **`requests/`** — One class per request type, each taking an `axiosInstance`:
  - `standard.js` — read/write single points; write uses type-aware XML elements (`<bool>`, `<real>`, `<str>`)
  - `history.js` — query history data with preset or custom time ranges; supports bool/str/real history types
  - `batch.js` — batch read/write with XML-escaped paths and type-aware value elements
  - `watcher.js` — create/manage oBIX watchers (add, remove, poll, lease)
  - `raw.js` — pass-through GET/POST returning raw converted JSON
  - `bql.js` — BQL queries with URL-encoded query strings, parsed from HTML tables using `cheerio`

### Tests (`tests/`)

Mirror `src/` structure. Tests mock axios at the instance level (not with module mocks) — each test file creates its own mock `axiosInstance` with `jest.fn()` methods. Mock response data lives in `tests/mocks/requests/` organized by request type. Use `await expect(...).rejects.toThrow()` for error assertions.

## Code Style

- Prettier: 150 char line width, 2-space indent, single quotes, LF line endings
- ESLint: `eslint:recommended` + `plugin:prettier/recommended` + `eqeqeq` rule enforced
- Always use strict equality (`===`/`!==`), never loose equality
- CommonJS (`require`/`module.exports`), no TypeScript
- Destructured object params for all public methods: `read({ path })`

## Gotchas

- `value == null` is used intentionally in `batch.js` to catch both `null` and `undefined` — uses `eslint-disable-next-line eqeqeq`. This is the only place loose equality is allowed.
- History preset matching uses `startsWith` because Niagara returns ref names like `yearToDate (limit=1000)` but users pass just `yearToDate`.
- `xmlElementForValue` lives in `helpers.js` — shared by `standard.js` and `batch.js`. Maps JS types to oBIX XML elements (`boolean` → `bool`, `number` → `real`, default → `str`).
