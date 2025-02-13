// This file contains the JavaScript code for handling speech recognition, transcribing speech to text, and updating subtitles on the web page. It also manages activity detection for silent and speaking moments.

let recognition;
let isTranscribing = false;
let finalTranscript = ''; // Store the complete transcript
const subtitleDisplay = document.getElementById('subtitles');
let translationHistory = []; // Array to store translation history

function startRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isTranscribing = true;
        console.log('Speech recognition started');
        document.getElementById('toggle-button').innerText = 'Stop Transcribing'; // Update button text
    };

    recognition.onresult = (event) => {
        let interimTranscript = ''; // Store the interim transcript
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const sentence = event.results[i][0].transcript;
                sendForTranslation(sentence); // Send the sentence for translation immediately
                finalTranscript += sentence; // Append to final transcript
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        // Display both final and interim transcripts
        // updateSubtitles(finalTranscript, interimTranscript); // No longer updating here
    };

    recognition.onend = () => {
        isTranscribing = false;
        console.log('Speech recognition ended');
        document.getElementById('toggle-button').innerText = 'Start Transcribing'; // Update button text
        // sendForTranslation(finalTranscript); // Send the complete transcript for translation
        finalTranscript = ''; // Clear the transcript for the next Transcribing
        displayTranslationHistory(); // Display the translation history
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.start();
}

function updateSubtitles(originalText, translatedText = '') {
    // Create a new subtitle entry
    const subtitleEntry = document.createElement('div');
    subtitleEntry.classList.add('subtitle-entry');

    // Original text column
    const originalColumn = document.createElement('div');
    originalColumn.classList.add('original-text');
    originalColumn.innerText = originalText;
    subtitleEntry.appendChild(originalColumn);

    // Translated text column
    const translatedColumn = document.createElement('div');
    translatedColumn.classList.add('translated-text');
    translatedColumn.innerText = translatedText;
    subtitleEntry.appendChild(translatedColumn);

    // Prepend the new entry to the subtitles display
    subtitleDisplay.prepend(subtitleEntry);

    // Add to translation history
    translationHistory.push({ original: originalText, translated: translatedText });
}

function toggleTranscribing() {
    if (isTranscribing) {
        recognition.stop();
        document.getElementById('toggle-button').innerText = 'Start Transcribing'; // Update button text
    } else {
        startRecognition();
    }
}

document.getElementById('toggle-button').addEventListener('click', toggleTranscribing);

async function sendForTranslation(text) {
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Translation:', data.translation);
        updateSubtitles(text, data.translation); // Update subtitles with original and translated text
    } catch (error) {
        console.error('Error getting translation:', error);
        updateSubtitles(text, 'Translation Failed'); // Display error message
    }
}

function displayTranslationHistory() {
    // Clear existing subtitles
    subtitleDisplay.innerHTML = '';

    // Display each entry in the translation history
    translationHistory.forEach(entry => {
        const subtitleEntry = document.createElement('div');
        subtitleEntry.classList.add('subtitle-entry');

        const originalColumn = document.createElement('div');
        originalColumn.classList.add('original-text');
        originalColumn.innerText = entry.original;
        subtitleEntry.appendChild(originalColumn);

        const translatedColumn = document.createElement('div');
        translatedColumn.classList.add('translated-text');
        translatedColumn.innerText = entry.translated;
        subtitleEntry.appendChild(translatedColumn);

        subtitleDisplay.appendChild(subtitleEntry);
    });
}

function downloadText(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

document.getElementById('download-original').addEventListener('click', () => {
    const originalText = translationHistory.map(entry => entry.original).join('\n');
    downloadText('original.txt', originalText);
});

document.getElementById('download-translated').addEventListener('click', () => {
    const translatedText = translationHistory.map(entry => entry.translated).join('\n');
    downloadText('translated.txt', translatedText);
});