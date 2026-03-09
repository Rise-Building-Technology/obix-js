const { createInstance } = require('./src/axios');

// Obix Imports
const { RawRequestInstance } = require('./src/requests/raw');
const { HistoryRequestInstance } = require('./src/requests/history');
const { BatchRequestInstance } = require('./src/requests/batch');
const { StandardRequestInstance } = require('./src/requests/standard');
const { WatcherRequestInstance } = require('./src/requests/watcher');

// BQL Imports
const { BQLQueryInstance } = require('./src/requests/bql');

const validateConfig = ({ host, port, username, password }) => {
  if (typeof username !== 'string' || username.length === 0) throw new Error('username must be a non-empty string');
  if (typeof password !== 'string' || password.length === 0) throw new Error('password must be a non-empty string');
  if (typeof host !== 'string' || host.length === 0) throw new Error('host must be a non-empty string');
  if (host.includes('@') || host.includes('/')) throw new Error('host contains invalid characters');
  const portNum = Number(port);
  if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) throw new Error('port must be an integer between 1 and 65535');
};

class ObixInstance {
  constructor({ protocol = 'https', host = 'localhost', port = '443', username, password, timeout, rejectUnauthorized, httpsAgent }) {
    validateConfig({ host, port, username, password });
    const axiosInstance = createInstance({ protocol, host, port, username, password, timeout, rejectUnauthorized, httpsAgent });
    this.rawRequestInstance = new RawRequestInstance({ axiosInstance });
    this.historyRequestInstance = new HistoryRequestInstance({ axiosInstance });
    this.batchRequestInstance = new BatchRequestInstance({ axiosInstance });
    this.standardRequestInstance = new StandardRequestInstance({ axiosInstance });
    this.watcherRequestInstance = new WatcherRequestInstance({ axiosInstance });
  }

  /**
   * @param {string} payload - Should be an xml string and replace any special characters like the following: https://stackoverflow.com/questions/1091945/what-characters-do-i-need-to-escape-in-xml-documents#:~:text=XML%20escape%20characters,the%20W3C%20Markup%20Validation%20Service
   */
  post({ path, payload }) {
    return this.rawRequestInstance.post({ path, payload });
  }
  get({ path }) {
    return this.rawRequestInstance.get({ path });
  }

  history({ path, query }) {
    return this.historyRequestInstance.historyRequest({ path, query });
  }

  batch({ batch }) {
    return this.batchRequestInstance.batchRequest({ batch });
  }

  read({ path }) {
    return this.standardRequestInstance.readRequest({ path });
  }
  write({ path, value }) {
    return this.standardRequestInstance.writeRequest({ path, value });
  }

  watcherCreate() {
    return this.watcherRequestInstance.watcherCreate();
  }
  watcherUpdateDefaultLease({ leaseTime }) {
    return this.watcherRequestInstance.watcherUpdateDefaultLease({ leaseTime });
  }
}

class BQLInstance {
  constructor({ protocol = 'https', host = 'localhost', port = '443', username, password, timeout, rejectUnauthorized, httpsAgent }) {
    validateConfig({ host, port, username, password });
    const axiosInstance = createInstance({ protocol, host, port, username, password, isBQL: true, timeout, rejectUnauthorized, httpsAgent });
    this.bqlQueryInstance = new BQLQueryInstance({ axiosInstance });
  }

  query({ query }) {
    return this.bqlQueryInstance.bqlQuery({ query });
  }
}

module.exports = { ObixInstance, BQLInstance };
