const { HTTPError, BQLHTTPError, PathError, InvalidTypeError, UnknownTypeError, ProtocolError, PathTraversalError } = require('../src/errors');

describe('Errors', () => {
  describe('HTTPError', () => {
    test('should handle ECONNABORTED error', () => {
      const error = { code: 'ECONNABORTED' };
      const httpError = new HTTPError(error);
      expect(httpError.name).toEqual('HTTPError');
      expect(httpError.friendlyError).toEqual('Connection Error - Timeout');
      expect(httpError.inDepthError).toContain('Error ECONNABORTED');
    });

    test('should handle 401 error by status code', () => {
      const error = { response: { status: 401 }, message: 'Request failed' };
      const httpError = new HTTPError(error);
      expect(httpError.name).toEqual('HTTPError');
      expect(httpError.friendlyError).toEqual('Invalid Username/Password - 401');
      expect(httpError.inDepthError).toContain('Error 401');
    });

    test('should handle 401 error by message fallback', () => {
      const error = { message: '401 Unauthorized' };
      const httpError = new HTTPError(error);
      expect(httpError.name).toEqual('HTTPError');
      expect(httpError.friendlyError).toEqual('Invalid Username/Password - 401');
      expect(httpError.inDepthError).toContain('Error 401');
    });

    test('should handle 403 error', () => {
      const error = { response: { status: 403 }, message: '403 Forbidden' };
      const httpError = new HTTPError(error);
      expect(httpError.name).toEqual('HTTPError');
      expect(httpError.friendlyError).toEqual('Permission Error - 403');
      expect(httpError.inDepthError).toContain('Error 403');
    });

    test('should handle 404 error', () => {
      const error = { response: { status: 404 }, message: '404 Not Found' };
      const httpError = new HTTPError(error);
      expect(httpError.name).toEqual('HTTPError');
      expect(httpError.friendlyError).toEqual('Obix Driver Missing - 404');
      expect(httpError.inDepthError).toContain('Error 404');
    });

    test("should handle 'wrong version number' error", () => {
      const error = { message: 'wrong version number' };
      const httpError = new HTTPError(error);
      expect(httpError.name).toEqual('HTTPError');
      expect(httpError.friendlyError).toEqual('Possibly Wrong Port/Protocol');
      expect(httpError.inDepthError).toContain('Check the port and security protocol');
    });

    test('should handle unknown error with inDepthError set', () => {
      const error = { message: 'Some unknown error' };
      const httpError = new HTTPError(error);
      expect(httpError.name).toEqual('HTTPError');
      expect(httpError.friendlyError).toEqual(error.message);
      expect(httpError.inDepthError).toEqual(error.message);
    });
  });

  describe('BQLHTTPError', () => {
    test('should have correct name', () => {
      const error = { code: 'ECONNABORTED' };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.name).toEqual('BQLHTTPError');
    });

    test('should handle ECONNABORTED error', () => {
      const error = { code: 'ECONNABORTED' };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.friendlyError).toEqual('Connection Error - Timeout');
      expect(bqlError.inDepthError).toContain('Error ECONNABORTED');
    });

    test('should handle 401 error', () => {
      const error = { response: { status: 401 }, message: '401 Unauthorized' };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.friendlyError).toEqual('Invalid Username/Password - 401');
      expect(bqlError.inDepthError).toContain('Error 401');
      expect(bqlError.inDepthError).not.toContain('Obix');
    });

    test('should handle 403 error', () => {
      const error = { response: { status: 403 }, message: '403 Forbidden' };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.friendlyError).toEqual('Permission Error - 403');
      expect(bqlError.inDepthError).toContain('Error 403');
    });

    test('should handle 404 error', () => {
      const error = { response: { status: 404 }, message: '404 Not Found' };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.friendlyError).toEqual('Invalid Ord/Query - 404');
      expect(bqlError.inDepthError).toContain('BQL Query most likely incorrect');
    });

    test("should handle 'wrong version number' error", () => {
      const error = { message: 'wrong version number' };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.friendlyError).toEqual('Possibly Wrong Port/Protocol');
    });

    test('should handle unknown error with inDepthError set', () => {
      const error = { message: 'Some unknown error' };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.friendlyError).toEqual(error.message);
      expect(bqlError.inDepthError).toEqual(error.message);
    });

    test('should store responseData', () => {
      const error = { message: 'error', response: { data: 'some-data', status: 500 } };
      const bqlError = new BQLHTTPError(error);
      expect(bqlError.responseData).toEqual('some-data');
    });
  });

  describe('ProtocolError', () => {
    test('should handle ProtocolError', () => {
      const protocolError = new ProtocolError();
      expect(protocolError.name).toEqual('ProtocolError');
      expect(protocolError.message).toEqual('Invalid Security Protocol');
      expect(protocolError.inDepthError).toContain('Protocol must be either');
    });
  });

  describe('PathError', () => {
    test('should handle PathError', () => {
      const path = '/invalid-path';
      const reason = 'Path not found';
      const pathError = new PathError(path, reason);
      expect(pathError.name).toEqual('PathError');
      expect(pathError.message).toEqual(`Invalid Path/Uri: ${path}`);
      expect(pathError.inDepthError).toContain(reason);
    });
  });

  describe('InvalidTypeError', () => {
    test('should handle InvalidTypeError', () => {
      const invalidTypeError = new InvalidTypeError();
      expect(invalidTypeError.name).toEqual('InvalidTypeError');
      expect(invalidTypeError.message).toEqual('Invalid Input Type');
      expect(invalidTypeError.inDepthError).toContain('Invalid Input Type');
    });
  });

  describe('UnknownTypeError', () => {
    test('should handle UnknownTypeError', () => {
      const unknownTypeError = new UnknownTypeError();
      expect(unknownTypeError.name).toEqual('UnknownTypeError');
      expect(unknownTypeError.message).toEqual('Unknown Data Type');
      expect(unknownTypeError.inDepthError).toContain('Unknown Data Type');
    });
  });

  describe('PathTraversalError', () => {
    test('should handle PathTraversalError', () => {
      const error = new PathTraversalError('../../etc/passwd');
      expect(error.name).toEqual('PathTraversalError');
      expect(error.message).toContain('Path traversal detected');
      expect(error.inDepthError).toContain('..');
    });
  });
});
