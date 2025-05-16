import { get } from 'env-var';

export default () => ({
  port: get('PORT').default(3001).asPortNumber(),
  MONGO_URI: get('MONGO_URI').default('mongodb://localhost:27020').asString(),
  RETRY_COUNT: get('RETRY_COUNT').default(3).asIntPositive(),
  RETRY_DELAY_MS: get('RETRY_DELAY_MS').default(500).asIntPositive(),
});
