let cachedHandler;

exports.handler = async (event, context) => {
  if (!cachedHandler) {
    const { getServerlessHandler } = require('../../dist/serverless');
    cachedHandler = await getServerlessHandler();
  }

  return cachedHandler(event, context);
};