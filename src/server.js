import { buildApp } from './app.js'
// import { config } from './config/index.js'

const start = async () => {
  const app = await buildApp()

  try {
    const address = await app.listen({
      port: 8000, // config.port,
      host: 'localhost' // config.host
    })

    app.log.info(`Server listening at ${address}`)

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM']
    for (const signal of signals) {
      process.on(signal, async () => {
        app.log.info(`${signal} signal received, closing HTTP server...`)

        try {
          await app.close()
          app.log.info('HTTP server closed')
          process.exit(0)
        } catch (err) {
          app.log.error('Error shutting down server:', err)
          process.exit(1)
        }
      })
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
