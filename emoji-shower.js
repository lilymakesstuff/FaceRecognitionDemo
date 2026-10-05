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


    //adjust these if you want to change the time it takes to trigger emojis
    const holdDuration = 4000; //4 seconds

    const emoji = document.createElement('div');
    emoji.id = 'emoji';
    emoji.style.position = 'absolute';
    emoji.style.fontSize = '5rem';
    emoji.style.pointerEvents = 'none';

    video.insertAdjacentElement('afterend', emoji);


    //styling for status message
    const emojiStyles = document.createElement('style');
    emojiStyles.textContent = `
        #emoji {
            min-height: 1.5em;
            margin: 20px 0 0;
            font-size: 3rem;
        }

        #emoji:empty {
            visibility: hidden;
        }
    `;
    document.head.appendChild(emojiStyles); //put it in index.html head

    let topEmotion = null;
    let commandSent = false;
    let lastEmotionUpdate = null;


    function resetProgress() {
        topEmotion = null;
        commandSent = false;
        emoji.textContent = '';
    }

    function startEmojiTimer() {

    }


    function decideTopEmotion(emotions) {

        lastEmotionUpdate = performance.now();

        //looks through emotions, finds one with highest score
        const entries = Object.entries(emotions);
        const [emotion] = entries.reduce((highest, current) =>
            current[1] > highest[1] ? current : highest
        );

        topEmotion = emotion;
    
    }

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

        return emojiGuide[emotion] ?? null;
    };

    window.displayEmotions = function (emotions) {
        displayEmotions.call(this, emotions);
        decideTopEmotion(emotions);
        emoji.textContent = window.sendEmoji(topEmotion) || '';
    };



})();
