import { NLPService } from '../services/nlp.service.js'

const questionRouteOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string' },
        options: {
          type: 'object',
          properties: {
            count: { type: 'number', default: 5 },
            types: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['mcq', 'open', 'tf']
              },
              default: ['mcq', 'open', 'tf']
            }
          }
        }
      }
    }
  }
}

export async function questionsRoutes (fastify, options) {
  fastify.post('/generate', questionRouteOptions, async (request, reply) => {
    try {
      const { text, options } = request.body
      const result = await NLPService.generateQuestions(text, options)
      console.log(result)
      return result
    } catch (error) {
      request.log.error('Error generating questions:', error)
      throw error
    }
  })
}
