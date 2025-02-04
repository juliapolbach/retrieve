import { encoding_for_model as encodingForModel } from 'tiktoken'

export class TokenService {
  static calculateTokens (text, model = 'gpt-3.5-turbo') {
    try {
      const encoder = encodingForModel(model)
      const tokens = encoder.encode(text)
      encoder.free()
      return tokens.length
    } catch (error) {
      console.error('Token calculation error:', error)
      return 0
    }
  }

  static estimateCost (inputTokens, outputTokens, model = 'gpt-3.5-turbo') {
    const PRICING = {
      'gpt-3.5-turbo': {
        input: 0.0005 / 1000, // $0.0005 per 1K input tokens
        output: 0.0015 / 1000 // $0.0015 per 1K output tokens
      },
      'gpt-4': {
        input: 0.03 / 1000, // $0.03 per 1K input tokens
        output: 0.06 / 1000 // $0.06 per 1K output tokens
      },
      'gpt-4-turbo': {
        input: 0.01 / 1000, // $0.01 per 1K input tokens
        output: 0.03 / 1000 // $0.03 per 1K output tokens
      }
    }

    const pricing = PRICING[model] || PRICING['gpt-3.5-turbo']

    return {
      inputCost: inputTokens * pricing.input,
      outputCost: outputTokens * pricing.output,
      totalCost: (inputTokens * pricing.input) + (outputTokens * pricing.output)
    }
  }
}
