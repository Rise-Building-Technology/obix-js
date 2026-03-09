const cheerio = require('cheerio');
const { MissingBQLQuery } = require('../errors');

class BQLQueryInstance {
  constructor({ axiosInstance }) {
    this.axiosInstance = axiosInstance;
  }

  async bqlQuery({ query } = {}) {
    if (!query) throw new MissingBQLQuery();

    const { data } = await this.axiosInstance.get(`ord?${encodeURIComponent(query)}|view:file:ITableToHtml`);

    const $ = cheerio.load(data);
    const $table = $('table');

    if ($table.length === 0) {
      return [];
    }

    const $rows = $table.find('tr');
    if ($rows.length < 2) {
      return [];
    }

    const $headers = $rows.eq(0).find('th');
    const parsedDataArray = [];

    function convertType(value) {
      if (value === 'null') {
        return null;
      } else if (value === '') {
        return value;
      } else if (value === 'true' || value === 'false') {
        return value === 'true';
      } else if (!isNaN(value)) {
        return parseFloat(value);
      } else {
        return value;
      }
    }

    $rows.slice(1).each(function () {
      const $cells = $(this).find('td');

      if ($cells.length !== $headers.length) {
        return;
      }

      const rowData = {};

      $headers.slice(0, -1).each(function (j) {
        const headerText = $(this).text().trim().replaceAll(' ', '_');
        const cellText = convertType($cells.eq(j).text().trim());
        rowData[headerText] = cellText;
      });

      parsedDataArray.push(rowData);
    });

    return parsedDataArray;
  }
}

module.exports = { BQLQueryInstance };
