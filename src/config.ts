import { get } from 'env-var';

export default () => ({
  port: get('PORT').default(3001).asPortNumber(),
  MONGO_URI: get('MONGO_URI').default('mongodb://localhost:27020').asString(),
});
