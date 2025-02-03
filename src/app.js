import Fastify from 'fastify'
import cors from '@fastify/cors'

export async function buildApp (opts = {}) {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty'
      }
    },
    ...opts
  })

  // Register plugins
  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true
  })

  // Register route plugins
  // await app.register(import('./routes/api/users/index.js'), { prefix: '/api/users' })
  // await app.register(import('./routes/api/products/index.js'), { prefix: '/api/products' })

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error)

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message
      })
    }

    // Default error response
    reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong'
    })
  })

  // Health check route
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  return app
}
