import natural from 'natural'
import OpenAI from 'openai'
import { TokenService } from './token.service.js'

const tokenizer = new natural.SentenceTokenizer()
const TfIdf = natural.TfIdf
const openai = new OpenAI(process.env.OPENAI_API_KEY)

export class NLPService {
  static async generateQuestions (text, options = { count: 5, types: ['mcq', 'open', 'tf'] }) {
    const analysis = await this.analyzeText(text)

    // Calculate input tokens
    const inputTokens = TokenService.calculateTokens(text, options.model)

    // Use GPT to generate questions based on the key phrases and sentences
    const prompt = `Generate ${options.count} questions from the following text. 
                Include a mix of ${options.types.join(', ')} questions. 
                For each question, provide:
                1. The question text
                2. The correct answer
                3. For MCQs, provide 3 plausible distractors
                4. The type of question
                5. Difficulty level (easy, medium, hard)
                
                Text: ${text}
                
                Key concepts to focus on: ${analysis.keyPhrases.join(', ')}`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        store: true,
        messages: [
          {
            role: 'system',
            content: 'You are a professional educator creating high-quality quiz questions. Format your response as JSON.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000 // Limit response tokens

      })

      // Calculate output tokens
      const responseText = completion.choices[0].message.content
      const outputTokens = TokenService.calculateTokens(responseText, options.model)

      // Estimate cost
      const costEstimate = TokenService.estimateCost(inputTokens, outputTokens, options.model)

      const questions = JSON.parse(responseText)

      return {
        questions: this.processGPTResponse(questions),
        tokenUsage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          costEstimate
        }
      }
    } catch (error) {
      console.error('Question generation error:', error)
      throw error
    }
  }

  static async analyzeText (text) {
    // Extract key sentences using TF-IDF
    const tfidf = new TfIdf()
    const sentences = tokenizer.tokenize(text)
    sentences.forEach(sentence => tfidf.addDocument(sentence))

    const keyPhrases = []
    tfidf.listTerms(0).slice(0, 10).forEach(item => {
      keyPhrases.push(item.term)
    })

    return {
      sentences,
      keyPhrases
    }
  }

  static processGPTResponse (gptQuestions) {
    // Process and validate questions
    return gptQuestions.questions.map(q => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9)
    }))
  }
}
