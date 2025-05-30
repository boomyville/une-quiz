document.addEventListener('DOMContentLoaded', () => {
    const questionsContainer = document.getElementById('questions-container');
    const submitButton = document.getElementById('submit-quiz');
    const resultsDiv = document.getElementById('results');
    const scoreSpan = document.getElementById('score');
    const feedbackDiv = document.getElementById('feedback');

    let questionsData = []; // To store the fetched questions
    let correctAnswersMap = new Map(); // To store original correct answers for comparison

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to load questions from JSON
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            const data = await response.json();

            // Randomize the order of questions
            questionsData = shuffleArray(data);

            questionsData.forEach((q, index) => {
                const questionBlock = document.createElement('div');
                questionBlock.classList.add('question-block');
                questionBlock.dataset.questionIndex = index; // Store original question index

                const questionText = document.createElement('p');
                questionText.textContent = `${index + 1}. ${q.question}`;
                questionBlock.appendChild(questionText);

                const optionsContainer = document.createElement('div');
                optionsContainer.classList.add('options-container');

                // Store the original correct answer before shuffling options
                const originalCorrectAnswer = q.options[0];
                correctAnswersMap.set(index, originalCorrectAnswer); // Map original index to correct answer

                // Shuffle the options for the current question
                const shuffledOptions = shuffleArray([...q.options]);

                shuffledOptions.forEach((option, optionIndex) => {
                    const label = document.createElement('label');
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = `question-${index}`;
                    input.value = option;
                    label.appendChild(input);
                    label.appendChild(document.createTextNode(option));
                    optionsContainer.appendChild(label);
                });

                questionBlock.appendChild(optionsContainer);
                questionsContainer.appendChild(questionBlock);
            });
        } catch (error) {
            console.error('Error loading questions:', error);
            questionsContainer.innerHTML = '<p>Failed to load quiz questions. Please try again later.</p>';
        }
    }

    // Function to evaluate the quiz
    submitButton.addEventListener('click', () => {
        let score = 0;
        let attemptedQuestions = 0;
        feedbackDiv.innerHTML = ''; // Clear previous feedback

        questionsData.forEach((q, originalIndex) => {
            const selectedOption = document.querySelector(`input[name="question-${originalIndex}"]:checked`);
            const questionFeedback = document.createElement('div');
            questionFeedback.classList.add('question-feedback');
            questionFeedback.innerHTML = `<p><strong>${originalIndex + 1}. ${q.question}</strong></p>`;

            const correctAnswer = correctAnswersMap.get(originalIndex);

            if (selectedOption) {
                attemptedQuestions++;
                if (selectedOption.value === correctAnswer) {
                    score++;
                    questionFeedback.innerHTML += `<p class="correct">Your Answer: ${selectedOption.value} (Correct)</p>`;
                } else {
                    questionFeedback.innerHTML += `<p class="incorrect">Your Answer: ${selectedOption.value} (Incorrect)</p>`;
                    questionFeedback.innerHTML += `<p class="correct">Correct Answer: ${correctAnswer}</p>`;
                }
            } else {
                questionFeedback.innerHTML += `<p class="unanswered">You did not answer this question.</p>`;
                questionFeedback.innerHTML += `<p class="correct">Correct Answer: ${correctAnswer}</p>`;
            }
            feedbackDiv.appendChild(questionFeedback);
        });

        scoreSpan.textContent = `You scored ${score} out of ${attemptedQuestions} attempted questions. (Total questions: ${questionsData.length})`;
        resultsDiv.classList.remove('hidden');
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    });

    loadQuestions();
});
