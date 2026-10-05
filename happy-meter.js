(() => {
    
    // Get references to the elements we need to update
    const emotionsFeed = document.querySelector('#emotions-feed');
    const faceOutput = document.getElementById('face-output');
    const displayEmotions = window.displayEmotions;

    //if the script runs before the above elements are available, log an error and exit
    if (!emotionsFeed || !faceOutput || typeof displayEmotions !== 'function') {
        console.error('happy-meter.js script could not find the emotion display elements.');
        return;
    }

    //adjust these if you want to change the time it takes to trigger the wave command
    const holdDuration = 2000; // 2 seconds
    const countdownDuration = 3000; // 3 seconds
    const emotionTimeout = 1500; //1.5 seconds

    //adds a status message below the emotions feed
    const status = document.createElement('p');
    status.id = 'happy-status';
    status.setAttribute('role', 'status'); // for screen readers
    status.setAttribute('aria-live', 'polite'); // also for screen readers. do not change this
    
    //insert the status message
    emotionsFeed.insertAdjacentElement('afterend', status);


    //styling for status message
    const statusStyles = document.createElement('style');
    statusStyles.textContent = `
        #happy-status {
            min-height: 1.5em;
            margin: 20px 0 0;
            color: #18856b;
            font-size: 1.1rem;
            font-weight: 600;
        }

        #happy-status:empty {
            visibility: hidden;
        }
    `;
    document.head.appendChild(statusStyles); //put it in index.html head

    let topEmotion = null;
    let happySince = null;
    let countdownStartedAt = null;
    let commandSent = false;
    let lastEmotionUpdate = null;

    //easy way to reset everything. i'm lazy, ok?
    function resetProgress() {
        topEmotion = null;
        happySince = null;
        countdownStartedAt = null;
        commandSent = false;
        status.textContent = '';
    }


    function decideHappy(emotions) {

        lastEmotionUpdate = performance.now();
        //i am honestly not sure if performance.now is the best way to do this.
        //it works fine for now
        //other options are date.now() or a counter that increments per frame.

        //if no scores at all, reset
        const entries = Object.entries(emotions || {});
        if (entries.length == 0) {
            resetProgress();
            return;
        } 


        //looks through emotions, finds one with highest score
        const [emotion] = entries.reduce((highest, current) =>
            current[1] > highest[1] ? current : highest
        );

        //if face is not happy, reset everything
        if(emotion !== 'happy') {
            resetProgress();
            topEmotion = emotion;
            return;
        }

        //if the last frame wasn't happy but this one is, trigger timer
        //note: this if statement only runs if the other one didn't return
        //so we know the current frame is happy already
        if(topEmotion !== 'happy') {
            topEmotion = 'happy';
            happySince = performance.now();
            countdownStartedAt = null;
            commandSent = false;
            status.textContent = 'Keep smiling...';
        }

    }

    function updateCountdown() {

        const now = performance.now();

        //reset if emotion scores stop arriving, such as when no face is detected
        if (topEmotion === 'happy' && now - lastEmotionUpdate > emotionTimeout) {
            resetProgress();
            return;
        }

        //if they're not happy, return
        if (topEmotion !== 'happy' || happySince == null || commandSent) {
            return;
        }

        if(countdownStartedAt == null) { //if we don't have a countdown yet...
            if(now - happySince < holdDuration) { //if it's been less than 2 seconds...
                return; 
            }

            countdownStartedAt = now; //start the countdown
        }

        //sets remaining time to how long it's been
        const remaining = countdownDuration - (now - countdownStartedAt);
        
        //if the 5 seconds runs out, send the command
        if(remaining <= 0) {
            commandSent = true;
            console.log('Countdown complete')
            window.sendWaveCommand();
            return;
        }

        //displays the time remaining
        const seconds = Math.ceil(remaining / 1000);
        status.textContent = `Waving in ${seconds}...`;


    }

    //placeholder for sending the wave command to the bridge
    window.sendWaveCommand = function() {};

    //Keep the existing emotion display and check its scores on every detection.
    window.displayEmotions = function (emotions) {
        displayEmotions.call(this, emotions);
        decideHappy(emotions);
    };

    window.setInterval(updateCountdown, 100);
})();