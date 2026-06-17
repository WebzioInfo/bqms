import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'BQMS Enterprise API',
        version: '1.0.0',
        description: 'REST API for BQMS ERP and 3rd-party integrations.',
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
          ApiSecretAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-secret',
          },
        },
      },
      security: [
        {
          ApiKeyAuth: [],
          ApiSecretAuth: [],
        },
      ],
    },
  });
  return spec;
};
