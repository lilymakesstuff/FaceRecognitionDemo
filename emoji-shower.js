(() => {

//note: a lot of this file is based on the happy-meter.js file.
//it would be ideal to make a single .js file that controls the basic mechanism of detecting emotions 
//for now I will keep them separate so that the python bridge is unaffected by any changes I make to the emoji stuff.


    // Get references to the elements we need to update
    const video = document.querySelector('video');
    const faceOutput = document.getElementById('face-output');
    const displayEmotions = window.displayEmotions;

    //if the script runs before the above elements are available, log an error and exit
    if (!video || !faceOutput || typeof displayEmotions !== 'function') {
        console.error('emoji-shower.js script could not find the emotion display elements.');
        return;
    }


    const particleDuration = 1500; //how long the animation lasts
    const spawnInterval = 600; //how often a particle is checked 
    const emotionTimeout = 1500; //how long emotion is used before it is considered stale
    const holdEmotionTime = 4000; //how long it takes until the emoji flow starts


    //creates CSS and div for the emoji
    const emoji = document.createElement('div');
    emoji.id = 'emoji';

    //if the camera is static, set the camera to relative
    //i keep messing up index so this is what has to happen. lol
    if (getComputedStyle(video.parentElement).position === 'static') {
        video.parentElement.style.position = 'relative';
    }

    //place the emoji div after the video element in the DOM
    video.insertAdjacentElement('afterend', emoji);


    //styling for status message
    const emojiStyles = document.createElement('style');
    emojiStyles.textContent = `
        #emoji {
            position: absolute;
            inset: 0;
            z-index: 2;
            overflow: hidden;
            pointer-events: none;
        }

        #emoji span {
            position: absolute;
            right: var(--particle-right);
            bottom: 10px;
            font-size: 4rem;
            line-height: 1;
            will-change: transform, opacity;
        }
    `;
    document.head.appendChild(emojiStyles); //put it in index.html head

    let topEmotion = null;
    let topEmotionSince = null;
    let lastEmotionUpdate = null;

    //processes each emotion update and returns the "top" emotion
    function decideTopEmotion(emotions) {
        const now = performance.now();
        if (lastEmotionUpdate !== null && now - lastEmotionUpdate > emotionTimeout) {
            topEmotion = null;
            topEmotionSince = null;
        }
        lastEmotionUpdate = now;
        const entries = Object.entries(emotions || {});
        if (entries.length === 0) {
            topEmotion = null;
            topEmotionSince = null;
            return;
        }

        const [emotion] = entries.reduce((highest, current) =>
            current[1] > highest[1] ? current : highest
        );

        if (emotion !== topEmotion) {
            topEmotion = emotion;
            topEmotionSince = now;
        }
    }

    //creates one particle
    function particleEffect(emojiCharacter) {

        //if no emoji, skip this function
        if (!emojiCharacter) return;

        //creates particle element
        const particle = document.createElement('span');

        //set the content to the right emoji
        particle.textContent = emojiCharacter;

        //random horizontal spawn position between 7% and 27%
        particle.style.setProperty('--particle-right', `${7 + Math.random() * 20}%`);

        //add particle to overlay
        emoji.appendChild(particle);

        //animate the particle using the Web Animations API
        const animation = particle.animate(
            [
                { transform: 'translateY(0)', opacity: 1 },
                { transform: 'translateY(-60px)', opacity: 1, offset: 0.2 },
                { transform: 'translateY(-180px)', opacity: 0 }
            ],
            { duration: particleDuration, easing: 'ease-out' } //ease-out makes the particle slow down as it rises
        );
        animation.onfinish = () => particle.remove();
    }


    //returns which emoji corresponds to the given emotion
    window.sendEmoji = function (emotion) {
        const emojiGuide = {
            neutral: '😐',
            happy: '☺️',
            sad: '🙁',
            angry: '😡',
            fearful: '😨',
            disgusted: '🤢',
            surprised: '😲'
        };

        return emojiGuide[emotion] ?? null; //default to null if emotion is not found
    };

    //calls the display function from index
    window.displayEmotions = function (emotions) {
        displayEmotions.call(this, emotions);
        decideTopEmotion(emotions);
    };

    //Spawn particles only after the same emotion has persisted through the hold period.
    window.setInterval(() => {
        const now = performance.now();
        const emotionIsFresh = lastEmotionUpdate !== null &&
            now - lastEmotionUpdate <= emotionTimeout;

        if (!emotionIsFresh) {
            topEmotion = null;
            topEmotionSince = null;
        } else if (topEmotion !== null && topEmotionSince !== null &&
            now - topEmotionSince >= holdEmotionTime) {
            particleEffect(window.sendEmoji(topEmotion) || '');
        }
    }, spawnInterval);

})();
