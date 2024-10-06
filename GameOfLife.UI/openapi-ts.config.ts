import { defineConfig } from '@hey-api/openapi-ts';

// Get the API target URL from environment variables
const apiTarget =
  process.env.services__gameoflifeapi__http__0 ||
  process.env.services__gameoflifeapi__https__0;


export default defineConfig({
  client: '@hey-api/client-axios',
  input: `${apiTarget}/swagger/v1/swagger.json`,
  output: 'src/api',
});
