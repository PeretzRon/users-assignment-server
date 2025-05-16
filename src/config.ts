import { get } from 'env-var';

export default () => ({
  port: get('PORT').default(3001).asPortNumber(),
  MONGO_URI: get('MONGO_URI').default('mongodb://localhost:27020').asString(),
  RETRY_COUNT: get('RETRY_COUNT').default(3).asIntPositive(),
  RETRY_DELAY_MS: get('RETRY_DELAY_MS').default(500).asIntPositive(),
  MONGO_SERVER_SELECTION_TIMEOUT_MS: get('MONGO_SERVER_SELECTION_TIMEOUT_MS').default(1000).asIntPositive(),
  MONGO_SOCKET_TIMEOUT_MS: get('MONGO_SOCKET_TIMEOUT_MS').default(1000).asIntPositive(),
  MONGO_CONNECT_TIMEOUT_MS: get('MONGO_CONNECT_TIMEOUT_MS').default(1000).asIntPositive(),
});
