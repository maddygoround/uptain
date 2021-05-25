/**
 * Main Handler
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */

const Wappalyzer = require("driver");

const handler = async (event, context, callback) => {
  let responseBody = {};
  let statusCode = 200;

  const body = JSON.parse(event.body);

  if (!body) {
    return {
      statusCode: statusCode,
      body: JSON.stringify(responseBody),
      isBase64Encoded: false,
    };
  }

  const URL = body.url;

  const options = {
    maxWait: 22000,
  };

  if (!URL) {
    return {
      statusCode: statusCode,
      body: JSON.stringify(responseBody),
      isBase64Encoded: false,
    };
  }

  const wappalyzer = new Wappalyzer(options);

  try {
    await wappalyzer.init();

    const site = await wappalyzer.open(URL);

    const results = await site.analyze();

    await wappalyzer.destroy();

    responseBody.data = {
      ...results,
      requestId: context.awsRequestId,
    };

    statusCode = 200;
  } catch (err) {
    console.log(err);
    await wappalyzer.destroy();
    statusCode = 500;
    err.requestId = context.awsRequestId;
    responseBody.errors = [err];
  }

  return {
    statusCode: statusCode,
    body: JSON.stringify(responseBody),
    isBase64Encoded: false,
  };
};

module.exports = { handler };
