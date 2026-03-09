const { ObixInstance, BQLInstance } = require('../index');

jest.mock('../src/axios', () => ({
  createInstance: jest.fn(() => ({
    defaults: { baseURL: 'https://localhost:443/obix/' },
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    interceptors: { response: { use: jest.fn() } },
  })),
}));

jest.mock('../src/requests/raw', () => ({
  RawRequestInstance: jest.fn(() => ({ post: jest.fn(), get: jest.fn() })),
}));
jest.mock('../src/requests/history', () => ({
  HistoryRequestInstance: jest.fn(() => ({ historyRequest: jest.fn() })),
}));
jest.mock('../src/requests/batch', () => ({
  BatchRequestInstance: jest.fn(() => ({ batchRequest: jest.fn() })),
}));
jest.mock('../src/requests/standard', () => ({
  StandardRequestInstance: jest.fn(() => ({ readRequest: jest.fn(), writeRequest: jest.fn() })),
}));
jest.mock('../src/requests/watcher', () => ({
  WatcherRequestInstance: jest.fn(() => ({ watcherCreate: jest.fn(), watcherUpdateDefaultLease: jest.fn() })),
}));
jest.mock('../src/requests/bql', () => ({
  BQLQueryInstance: jest.fn(() => ({ bqlQuery: jest.fn() })),
}));

describe('ObixInstance', () => {
  test('should throw if username is missing', () => {
    expect(() => new ObixInstance({ host: 'localhost', port: '443', password: 'pass' })).toThrow('username must be a non-empty string');
  });
  test('should throw if password is missing', () => {
    expect(() => new ObixInstance({ host: 'localhost', port: '443', username: 'user' })).toThrow('password must be a non-empty string');
  });
  test('should throw if host contains @', () => {
    expect(() => new ObixInstance({ host: 'evil@host', port: '443', username: 'user', password: 'pass' })).toThrow(
      'host contains invalid characters'
    );
  });
  test('should throw if host contains /', () => {
    expect(() => new ObixInstance({ host: 'host/path', port: '443', username: 'user', password: 'pass' })).toThrow(
      'host contains invalid characters'
    );
  });
  test('should throw if port is invalid', () => {
    expect(() => new ObixInstance({ host: 'localhost', port: 'abc', username: 'user', password: 'pass' })).toThrow(
      'port must be an integer between 1 and 65535'
    );
  });
  test('should throw if port is out of range', () => {
    expect(() => new ObixInstance({ host: 'localhost', port: '99999', username: 'user', password: 'pass' })).toThrow(
      'port must be an integer between 1 and 65535'
    );
  });
  test('should create instance with valid config', () => {
    const instance = new ObixInstance({ host: 'localhost', port: '443', username: 'user', password: 'pass' });
    expect(instance).toBeDefined();
    expect(instance.rawRequestInstance).toBeDefined();
    expect(instance.historyRequestInstance).toBeDefined();
    expect(instance.batchRequestInstance).toBeDefined();
    expect(instance.standardRequestInstance).toBeDefined();
    expect(instance.watcherRequestInstance).toBeDefined();
  });
  test('facade methods return promises', () => {
    const instance = new ObixInstance({ host: 'localhost', port: '443', username: 'user', password: 'pass' });
    instance.rawRequestInstance.post.mockResolvedValue({});
    instance.rawRequestInstance.get.mockResolvedValue({});
    instance.historyRequestInstance.historyRequest.mockResolvedValue({});
    instance.batchRequestInstance.batchRequest.mockResolvedValue({});
    instance.standardRequestInstance.readRequest.mockResolvedValue({});
    instance.standardRequestInstance.writeRequest.mockResolvedValue({});
    instance.watcherRequestInstance.watcherCreate.mockResolvedValue({});
    instance.watcherRequestInstance.watcherUpdateDefaultLease.mockResolvedValue({});

    expect(instance.post({ path: 'test', payload: 'data' })).toBeInstanceOf(Promise);
    expect(instance.get({ path: 'test' })).toBeInstanceOf(Promise);
    expect(instance.history({ path: 'test', query: 'yesterday' })).toBeInstanceOf(Promise);
    expect(instance.batch({ batch: [] })).toBeInstanceOf(Promise);
    expect(instance.read({ path: 'test' })).toBeInstanceOf(Promise);
    expect(instance.write({ path: 'test', value: 1 })).toBeInstanceOf(Promise);
    expect(instance.watcherCreate()).toBeInstanceOf(Promise);
    expect(instance.watcherUpdateDefaultLease({ leaseTime: 5000 })).toBeInstanceOf(Promise);
  });
});

describe('BQLInstance', () => {
  test('should throw if username is missing', () => {
    expect(() => new BQLInstance({ host: 'localhost', port: '443', password: 'pass' })).toThrow('username must be a non-empty string');
  });
  test('should create instance with valid config', () => {
    const instance = new BQLInstance({ host: 'localhost', port: '443', username: 'user', password: 'pass' });
    expect(instance).toBeDefined();
    expect(instance.bqlQueryInstance).toBeDefined();
  });
  test('query method returns a promise', () => {
    const instance = new BQLInstance({ host: 'localhost', port: '443', username: 'user', password: 'pass' });
    instance.bqlQueryInstance.bqlQuery.mockResolvedValue([]);
    expect(instance.query({ query: 'test' })).toBeInstanceOf(Promise);
  });
});
