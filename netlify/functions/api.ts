import type { Handler } from '@netlify/functions';
import { getServerlessHandler } from '../../src/serverless';

export const handler: Handler = async (event, context) => {
  const serverlessHandler = await getServerlessHandler();
  return serverlessHandler(event, context);
};