const axios = require('axios');
const https = require('https');
const convert = require('xml-js');
const { HTTPError, BQLHTTPError, ProtocolError } = require('./errors');
const { parseError } = require('./parsers/errors');

class XMLParseError extends Error {
  constructor(rawData) {
    super('Failed to parse XML response');
    this.name = 'XMLParseError';
    this.friendlyError = this.message;
    this.inDepthError = 'The server returned a response that could not be parsed as XML';
    this.rawData = rawData;
  }
}

const createInstance = ({ protocol, host, port, username, password, isBQL = false, timeout, rejectUnauthorized = true, httpsAgent }) => {
  if (protocol !== 'https' && protocol !== 'http') throw new ProtocolError();

  const agent = httpsAgent || new https.Agent({ rejectUnauthorized, keepAlive: true });

  if (isBQL) {
    const axiosInstance = axios.create({
      baseURL: `${protocol}://${host}:${port}`,
      timeout: timeout || 10000,
      auth: { username, password },
      httpsAgent: agent,
    });
    axiosInstance.interceptors.response.use(
      (response) => {
        const [cookie] = response.headers['set-cookie'] || [];
        if (cookie) axiosInstance.defaults.headers.Cookie = cookie;
        return response;
      },
      (error) => {
        throw new BQLHTTPError(error);
      }
    );
    return axiosInstance;
  } else {
    const axiosInstance = axios.create({
      baseURL: `${protocol}://${host}:${port}/obix/`,
      timeout: timeout || 10000,
      auth: { username, password },
      httpsAgent: agent,
      transformResponse: [
        function (data) {
          try {
            return convert.xml2js(data, { compact: true, spaces: 4 });
          } catch (error) {
            throw new XMLParseError(data);
          }
        },
      ],
    });
    axiosInstance.interceptors.response.use(
      (response) => {
        const [cookie] = response.headers['set-cookie'] || [];
        if (cookie) axiosInstance.defaults.headers.Cookie = cookie;
        parseError(response.data?.err);
        return response;
      },
      (error) => {
        throw new HTTPError(error);
      }
    );
    return axiosInstance;
  }
};

module.exports = { createInstance, XMLParseError };
