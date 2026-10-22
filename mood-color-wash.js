(() => {
    const displayEmotions = window.displayEmotions;

    if (typeof displayEmotions !== 'function') {
        console.error('mood-color-wash.js could not find the emotion display function.');
        return;
    }

    const neutralColor = '#f4f3ec';
    const emotionColors = {
        neutral: neutralColor,
        happy: '#ffec9e',
        sad: '#9fc0e9',
        angry: '#f9c6bf',
        fearful: '#c8b4fc',
        disgusted: '#b5e098',
        surprised: '#ebc7a0'
    };

    const styles = document.createElement('style');
    styles.textContent = `
        :root {
            background-color: var(--mood-wash, ${neutralColor});
            transition: background-color 1400ms ease;
        }

        @media (prefers-reduced-motion: reduce) {
            :root {
                transition: none;
            }
        }
    `;
    document.head.appendChild(styles);

    let resetTimer;

    function updateMoodColor(emotions) {
        const entries = Object.entries(emotions || {}).filter(
            ([emotion, score]) => emotion in emotionColors && Number.isFinite(score)
        );

        if (entries.length > 0) {
            const [emotion] = entries.reduce((highest, current) =>
                current[1] > highest[1] ? current : highest
            );
            document.documentElement.style.setProperty('--mood-wash', emotionColors[emotion]);
        }

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
            document.documentElement.style.setProperty('--mood-wash', neutralColor);
        }, 1500);
    }

    window.displayEmotions = function (emotions) {
        displayEmotions.call(this, emotions);
        updateMoodColor(emotions);
    };
})();
