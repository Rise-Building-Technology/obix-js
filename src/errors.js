class BaseHTTPError extends Error {
  constructor(error, messages) {
    super();
    this.name = this.constructor.name;

    const status = error?.response?.status;

    if (error?.code?.includes('ECONNABORTED')) {
      this.friendlyError = 'Connection Error - Timeout';
      this.inDepthError =
        'Error ECONNABORTED- Connection to server could not be established:\n' +
        '\n1. Check the configured IP Address and Port' +
        '\n2. Ensure http/https is enabled in the WebServices in Niagara';
    } else if (status === 401 || error?.message?.includes('401')) {
      this.friendlyError = 'Invalid Username/Password - 401';
      this.inDepthError = messages.auth;
    } else if (status === 403 || error?.message?.includes('403')) {
      this.friendlyError = 'Permission Error - 403';
      this.inDepthError = messages.permission;
    } else if (status === 404 || error?.message?.includes('404')) {
      this.friendlyError = messages.notFoundFriendly;
      this.inDepthError = messages.notFound;
    } else if (error?.message?.includes('wrong version number')) {
      this.friendlyError = 'Possibly Wrong Port/Protocol';
      this.inDepthError = 'Check the port and security protocol';
    } else {
      this.friendlyError = error.message;
      this.inDepthError = error.message;
    }

    this.message = this.friendlyError;
  }
}

class HTTPError extends BaseHTTPError {
  constructor(error) {
    super(error, {
      auth:
        'Error 401 - Invalid Credentials:\n' +
        '\n1. Ensure the Username / Password is correct' +
        '\n2. Ensure the Obix user account has HTTPBasicScheme authentication (Check Documentation in Github for more details)',
      permission: 'Error 403 - Permission Error:\n' + '\n1. Ensure the obix user has the admin role assigned / admin privileges',
      notFoundFriendly: 'Obix Driver Missing - 404',
      notFound:
        'Error 404 - Obix Driver most likely missing:\n' +
        '\n1. Ensure the obix driver is placed directly under the Drivers in the Niagara tree (Check Documentation in Github for more details)',
    });
  }
}

class BQLHTTPError extends BaseHTTPError {
  constructor(error) {
    super(error, {
      auth:
        'Error 401 - Invalid Credentials:\n' +
        '\n1. Ensure the Username / Password is correct' +
        '\n2. Ensure the user account has HTTPBasicScheme authentication (Check Documentation in Github for more details)',
      permission: 'Error 403 - Permission Error:\n' + '\n1. Ensure the user has the admin role assigned / admin privileges',
      notFoundFriendly: 'Invalid Ord/Query - 404',
      notFound: 'Error 404 - BQL Query most likely incorrect.',
    });
    this.responseData = error.response?.data;
  }
}

class ProtocolError extends Error {
  constructor() {
    super('Invalid Security Protocol');
    this.name = 'ProtocolError';
    this.friendlyError = this.message;
    this.inDepthError = 'Invalid Security Protocol:\nProtocol must be either "https" or "http"';
  }
}

class PathError extends Error {
  constructor(path, reason, href) {
    super(`Invalid Path/Uri: ${path}`);
    this.name = 'PathError';
    this.friendlyError = this.message;
    this.inDepthError = `${reason || path}${href ? ` : ${href}` : ''}`;
  }
}

class InvalidTypeError extends Error {
  constructor() {
    super('Invalid Input Type');
    this.name = 'InvalidTypeError';
    this.friendlyError = this.message;
    this.inDepthError = 'Invalid Input Type:\nData Type of input does not match that of value trying to be written to';
  }
}

class UnknownTypeError extends Error {
  constructor() {
    super('Unknown Data Type');
    this.name = 'UnknownTypeError';
    this.friendlyError = this.message;
    this.inDepthError = 'Error with Value Parsing: Unknown Data Type';
  }
}

class PathTraversalError extends Error {
  constructor(path) {
    super(`Path traversal detected: ${path}`);
    this.name = 'PathTraversalError';
    this.friendlyError = this.message;
    this.inDepthError = 'Path contains ".." segments which are not allowed';
  }
}

class MissingHistoryQuery extends Error {
  constructor() {
    super('Missing history query');
    this.name = 'MissingHistoryQuery';
    this.friendlyError = this.message;
    this.inDepthError = this.message;
  }
}

class InvalidHistoryPresetQuery extends Error {
  constructor(query, presetOptions) {
    super(`Invalid preset history query: ${query}`);
    this.name = 'InvalidHistoryPresetQuery';
    this.friendlyError = this.message;
    this.inDepthError = `Valid preset queries include:\n${presetOptions.join('\n')}`;
  }
}

class InvalidHistoryQueryParameter extends Error {
  constructor(parameter, paramValue) {
    super(`Invalid parameter in history query: ${parameter}`);
    this.name = 'InvalidHistoryQueryParameter';
    if (parameter === 'limit') {
      this.friendlyError = this.message;
      this.inDepthError = `'limit' parameter must be a number but received : ${paramValue}`;
    } else if (parameter === 'start' || parameter === 'end') {
      this.friendlyError = this.message;
      this.inDepthError = `'${parameter}' parameter must be a valid date but received : ${paramValue}`;
    }
  }
}

class MissingBQLQuery extends Error {
  constructor() {
    super('Missing BQL query');
    this.name = 'MissingBQLQuery';
    this.friendlyError = this.message;
    this.inDepthError = 'Query parameter missing from request';
  }
}

module.exports = {
  HTTPError,
  BQLHTTPError,
  ProtocolError,
  PathError,
  InvalidTypeError,
  UnknownTypeError,
  PathTraversalError,
  MissingHistoryQuery,
  InvalidHistoryPresetQuery,
  InvalidHistoryQueryParameter,
  MissingBQLQuery,
};
