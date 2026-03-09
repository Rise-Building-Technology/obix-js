# obix-js

JavaScript library for communicating with Tridium Niagara building automation systems via the oBIX protocol.

## Installation

```sh
npm install @risebt/obix-js
```

Requires Node.js 20+.

## Create Instance

### oBIX

```js
const { ObixInstance } = require('@risebt/obix-js');

const obix = new ObixInstance({
  protocol: 'https', // 'https' or 'http'
  host: '192.168.1.50', // Niagara IP address
  port: 443, // Niagara web service port (1–65535)
  username: 'obix_user', // oBIX username
  password: 'secret', // oBIX password
  timeout: 10000, // optional, ms until request timeout (default: 10000)
  rejectUnauthorized: false, // optional, TLS cert validation (default: false)
});
```

### BQL

```js
const { BQLInstance } = require('@risebt/obix-js');

const bql = new BQLInstance({
  protocol: 'https',
  host: '192.168.1.50',
  port: 443,
  username: 'admin',
  password: 'secret',
  timeout: 10000, // optional
  rejectUnauthorized: false, // optional
});
```

Both constructors validate inputs and throw on invalid host, port, username, or password.

You can also pass a custom `httpsAgent` for full control over TLS settings.

## oBIX Methods

### Read

```js
const result = await obix.read({ path: 'TestFolder/TestPoint' });
// => { path: 'TestFolder/TestPoint', value: 72.5, action: 'read' }
```

### Write

```js
const result = await obix.write({ path: 'TestFolder/TestPoint', value: 68.0 });
// => { path: 'TestFolder/TestPoint', value: 68.0, action: 'write' }
```

Values are serialized with type-aware XML elements (`<bool>`, `<real>`, `<str>`) based on the JavaScript type.

### Batch

```js
const results = await obix.batch({
  batch: [
    { path: 'Point/Test', action: 'write', value: 'hello' },
    { path: 'Point/Test2', action: 'read' },
  ],
});
```

Each item needs `path`, `action` (`'read'` or `'write'`), and `value` (for writes).

### History

```js
const result = await obix.history({ path: 'TestHistories/Ramp', query: 'yesterday' });
```

**Preset queries** (string):

- `"yesterday"`, `"last24Hours"`, `"weekToDate"`, `"lastWeek"`, `"last7Days"`
- `"monthToDate"`, `"lastMonth"`, `"yearToDate"`, `"lastYear"`, `"unboundedQuery"`

**Custom query** (object):

```js
const result = await obix.history({
  path: 'TestHistories/Ramp',
  query: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z',
    limit: 100,
  },
});
```

Start and end accept any format supported by `new Date()`.

### Watcher

```js
const watcher = await obix.watcherCreate();

const added = await watcher.add({ paths: ['Test/Path1', 'Test/Path2'] });
const changes = await watcher.pollChanges();
const all = await watcher.pollRefresh();
await watcher.remove({ paths: ['Test/Path2'] });
await watcher.lease({ leaseTime: 5000 }); // ms
await watcher.lease({ leaseTime: 'PT4M30S' }); // ISO 8601
await watcher.delete();
```

The watcher object returned by `watcherCreate()`:

| Property               | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `name`                 | Watcher name                                             |
| `add({ paths })`       | Add paths to watch                                       |
| `remove({ paths })`    | Remove paths from watch                                  |
| `delete()`             | Delete the watcher                                       |
| `pollChanges()`        | Poll paths that changed since last poll                  |
| `pollRefresh()`        | Poll all watched paths                                   |
| `lease({ leaseTime })` | Update lease time (auto-deletes if no poll within lease) |

### Watcher Default Lease

```js
await obix.watcherUpdateDefaultLease({ leaseTime: 'PT4M30S' });
```

Sets the default lease time for all newly created watchers.

### Raw Get / Post

For direct access to the converted XML-to-JSON response:

```js
const getResult = await obix.get({ path: 'config/TestFolder/TestPoint' });
const postResult = await obix.post({ path: 'config/TestFolder/TestPoint', payload: "<bool val='false'/>" });
```

## BQL Methods

### Query

```js
const results = await bql.query({ query: 'station:|history:/TestStation|bql:select *' });
// => [{ column1: 'value1', column2: 'value2' }, ...]
```

Returns an array of objects parsed from the HTML table response. Example queries can be found [here](https://gist.github.com/mrupperman/8a0761bbb416b8ef1ca4f51c228f63bf).

## Error Handling

All errors expose `friendlyError` and `inDepthError` properties:

```js
try {
  await obix.read({ path: 'Invalid/Path' });
} catch (error) {
  console.log(error.friendlyError); // user-facing message
  console.log(error.inDepthError); // detailed diagnostic info
}
```

## License

ISC
