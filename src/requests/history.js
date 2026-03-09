const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // dependent on utc plugin
const advanced = require('dayjs/plugin/advancedFormat');
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(advanced);
dayjs.extend(localizedFormat);

const { stripPaths, makeArray } = require('../helpers');
const { MissingHistoryQuery, InvalidHistoryPresetQuery, InvalidHistoryQueryParameter } = require('../errors');

class HistoryRequestInstance {
  constructor({ axiosInstance }) {
    this.axiosInstance = axiosInstance;
  }

  async historyRequest({ path, query }) {
    if (!query) throw new MissingHistoryQuery();
    path = stripPaths(path)[0];
    let historyData;

    // Check if query is a presetQuery or custom timestamps
    if (typeof query === 'string') {
      const presetOptions = [
        'yesterday',
        'last24Hours',
        'weekToDate',
        'lastWeek',
        'last7Days',
        'monthToDate',
        'lastMonth',
        'yearToDate',
        'lastYear',
        'unboundedQuery',
      ];
      if (!presetOptions.some((option) => option === query)) {
        throw new InvalidHistoryPresetQuery(query, presetOptions);
      }

      // Call to get all preset queries
      const { data: presetQueryData } = await this.axiosInstance.get(`histories/${path}`);
      const presetHref = presetQueryData.obj.ref.find((presetQuery) => presetQuery._attributes.name.startsWith(query))?._attributes.href;
      if (!presetHref) {
        throw new InvalidHistoryPresetQuery(query, presetOptions);
      }
      historyData = (await this.axiosInstance.get(`histories/${path}${presetHref}`)).data;
    } else {
      if (query.start) {
        try {
          query.start = new Date(query.start).toISOString();
        } catch (error) {
          throw new InvalidHistoryQueryParameter('start', query.start);
        }
      }
      if (query.end) {
        try {
          query.end = new Date(query.end).toISOString();
        } catch (error) {
          throw new InvalidHistoryQueryParameter('end', query.end);
        }
      }
      if (query.limit) {
        if (!Number.isInteger(Number(query.limit))) {
          throw new InvalidHistoryQueryParameter('limit', query.limit);
        }
      }

      historyData = (await this.axiosInstance.get(`histories/${path}/~historyQuery/`, { params: query })).data;
    }
    return this.#parseHistoryDataHelper({ data: historyData.obj, path });
  }

  #parseHistoryDataHelper({ data, path }) {
    const tz = data.obj?.abstime?._attributes?.tz;
    const limit = data.int?._attributes?.val;
    const abstimeArray = makeArray(data.abstime);
    const startVal = abstimeArray.find((a) => a._attributes?.name === 'start')?._attributes?.val;
    const endVal = abstimeArray.find((a) => a._attributes?.name === 'end')?._attributes?.val;
    const start = startVal && tz ? dayjs(startVal).tz(tz).format('LLLL z') : startVal;
    const end = endVal && tz ? dayjs(endVal).tz(tz).format('LLLL z') : endVal;

    const dataObjList = makeArray(data.list?.obj);
    const values = dataObjList.map((dataObj) => {
      const timestamp = dataObj.abstime?._attributes?.val;
      const realVal = dataObj.real?._attributes?.val;
      const boolVal = dataObj.bool?._attributes?.val;
      const strVal = dataObj.str?._attributes?.val;
      const value = realVal ?? boolVal ?? strVal ?? '';
      return {
        timestamp: timestamp && tz ? dayjs(timestamp).tz(tz).format('LLLL z') : timestamp,
        value: String(value),
      };
    });

    return {
      history: path,
      start,
      end,
      limit,
      timezone: tz,
      results: values,
    };
  }
}

module.exports = { HistoryRequestInstance };
