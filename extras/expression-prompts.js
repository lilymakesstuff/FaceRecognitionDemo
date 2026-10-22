(() => {
    const promptElement = document.getElementById('expression-prompt');

    if (!promptElement) {
        console.error('expression-prompts.js could not find the expression prompt element.');
        return;
    }

    const prompts = [
        'Try looking surprised!',
        'Can you look happy?',
        'Try a neutral expression!',
        'Can you look sad?',
        'Try looking angry!',
        'Can you look disgusted?',
        'Try looking fearful!'
    ];
    const promptDuration = 5000;
    const minimumDelay = 8000;
    const maximumDelay = 12000;
    let previousPromptIndex = -1;

    function showRandomPrompt() {
        let promptIndex;
        do {
            promptIndex = Math.floor(Math.random() * prompts.length);
        } while (promptIndex === previousPromptIndex);

        previousPromptIndex = promptIndex;
        promptElement.textContent = prompts[promptIndex];

        window.setTimeout(() => {
            promptElement.textContent = '';
            const delay = minimumDelay + Math.random() * (maximumDelay - minimumDelay);
            window.setTimeout(showRandomPrompt, delay);
        }, promptDuration);
    }

    const initialDelay = minimumDelay + Math.random() * (maximumDelay - minimumDelay);
    window.setTimeout(showRandomPrompt, initialDelay);
})();
