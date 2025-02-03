import { expect } from 'chai'
import { NLPService } from '../../src/services/nlp.service.js'
// import fs from 'fs'

describe('NLPService', () => {
  it('should analyze text and return key sentences', async () => {
    const text = 'This is a test sentence. This is another test sentence.'
    const result = await NLPService.analyzeText(text)
    expect(result).to.be.an.instanceOf(Object)
  })
  it('should generate questions', async function () {
    this.timeout(5000)
    // Uncomment to use a dummy text from Wikipedia
    // const text = fs.readFileSync('test/helpers/dummy_text.txt', 'utf8')
    const text = 'This is a test sentence. This is another test sentence.'
    const result = await NLPService.generateQuestions(text)
    expect(result).to.be.an.instanceOf(Object)
  })
})
