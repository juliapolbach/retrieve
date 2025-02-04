/* global chrome */

document.addEventListener('DOMContentLoaded', function () {
  // Get the selected text when popup opens
  chrome.storage.local.get(['selectedText'], function (result) {
    const selectedTextDiv = document.getElementById('selectedText')
    selectedTextDiv.textContent = result.selectedText || 'No text selected'
  })

  document.getElementById('generateBtn').addEventListener('click', async function () {
    const selectedText = await chrome.storage.local.get(['selectedText'])
    const count = document.getElementById('questionCount').value

    // Get selected question types
    const types = Array.from(document.querySelectorAll('.question-types input:checked'))
      .map(checkbox => checkbox.value)

    if (!selectedText.selectedText) {
      document.getElementById('result').textContent = 'Please select some text first'
      return
    }

    const resultDiv = document.getElementById('result')
    resultDiv.textContent = 'Generating questions...'

    try {
      const response = await fetch('http://localhost:8000/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: selectedText.selectedText,
          options: {
            count: parseInt(count),
            types: types.map(t => t.toLowerCase())
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (!data || !data.questions) {
        throw new Error('Invalid response format from API')
      }

      // Filter out open-ended questions
      const filteredQuestions = data.questions.filter(q => q.question_type !== 'Open')

      // Display the questions
      resultDiv.innerHTML = filteredQuestions.map((q, questionIndex) => `
        <div class="question" data-question-index="${questionIndex}">
          <p><strong>Q:</strong> ${q.question_text}</p>
          
          ${q.question_type === 'MCQ'
            ? `
              <div class="options">
                ${[q.correct_answer, ...(q.distractors || [])]
                  .sort(() => Math.random() - 0.5) // Randomize options order
                  .map((option, index) => `
                    <button class="option-btn" data-option="${option}">
                      ${String.fromCharCode(65 + index)}) ${option}
                    </button>
                  `).join('')}
              </div>
            `
            : q.question_type === 'TF'
              ? `
                <div class="options">
                  <button class="option-btn" data-option="True">True</button>
                  <button class="option-btn" data-option="False">False</button>
                </div>
              `
              : ''}
          
          <div class="feedback" style="display: none;">
            <p class="answer-feedback"></p>
            <p><strong>Explanation:</strong> ${q.explanation}</p>
          </div>
          <hr>
        </div>
      `).join('')

      // Add click handlers for option buttons
      document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', function () {
          const questionDiv = this.closest('.question')
          const questionIndex = parseInt(questionDiv.dataset.questionIndex)
          const question = filteredQuestions[questionIndex]
          const selectedOption = this.dataset.option
          const feedback = questionDiv.querySelector('.feedback')
          const answerFeedback = questionDiv.querySelector('.answer-feedback')

          // Disable all buttons in this question
          questionDiv.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true
            if (btn.dataset.option === question.correct_answer) {
              btn.classList.add('correct')
            }
          })

          // Show feedback
          feedback.style.display = 'block'
          if (selectedOption === question.correct_answer) {
            this.classList.add('correct')
            answerFeedback.innerHTML = '✅ Correct!'
          } else {
            this.classList.add('incorrect')
            answerFeedback.innerHTML = '❌ Incorrect. The correct answer is: ' + question.correct_answer
          }
        })
      })
    } catch (error) {
      console.error('Full error:', error)
      resultDiv.textContent = 'Error generating questions: ' + error.message
    }
  })
})
