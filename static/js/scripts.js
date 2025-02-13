// This file contains the JavaScript code for handling speech recognition, transcribing speech to text, and updating subtitles on the web page. It also manages activity detection for silent and speaking moments.

let recognition;
let isTranscribing = false;
let finalTranscript = ''; // Store the complete transcript
const subtitleDisplay = document.getElementById('subtitles');
let translationHistory = []; // Array to store translation history
let currentSubtitleEntry = null; // Track the current subtitle entry

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
        let interimTranscript = ''; 
        let lastFinalSentence = ''; // Store last processed sentence to prevent duplication
    
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal ) {
                const sentence = event.results[i][0].transcript.trim();
                
                if (sentence !== lastFinalSentence) { // Prevent processing the same sentence twice
                    finalTranscript += sentence + ' ';
                    lastFinalSentence = sentence;
                    
                    if (!currentSubtitleEntry) {
                        currentSubtitleEntry = createSubtitleEntry(sentence);
                    } else {
                        currentSubtitleEntry.querySelector('.original-text').innerText = sentence;
                    }
                    if (sentence.trim().length > 0)
                        sendForTranslation(sentence, currentSubtitleEntry);
                    currentSubtitleEntry = null; // Reset for the next segment
                }
            } else {
                interimTranscript += event.results[i][0].transcript + ' ';
            }
        }
    
        // Update the current subtitle entry for streaming interim text
        if (!currentSubtitleEntry) {
            currentSubtitleEntry = createSubtitleEntry(interimTranscript);
        } else {
            currentSubtitleEntry.querySelector('.original-text').innerText = interimTranscript;
        }
    };

    

    recognition.onend = () => {
        isTranscribing = false;
        console.log('Speech recognition ended');
        document.getElementById('toggle-button').innerText = 'Start Transcribing'; // Update button text
        finalTranscript = ''; // Clear the transcript for the next transcribing session
        currentSubtitleEntry = null; // Reset subtitle entry
        displayTranslationHistory(); // Display the translation history
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.start();
}

function createSubtitleEntry(originalText, translatedText = 'Translating...') {
    const subtitleEntry = document.createElement('div');
    subtitleEntry.classList.add('subtitle-entry');

    const originalColumn = document.createElement('div');
    originalColumn.classList.add('original-text');
    originalColumn.innerText = originalText;
    subtitleEntry.appendChild(originalColumn);

    const translatedColumn = document.createElement('div');
    translatedColumn.classList.add('translated-text');
    translatedColumn.innerText = translatedText;
    subtitleEntry.appendChild(translatedColumn);

    subtitleDisplay.prepend(subtitleEntry);

    translationHistory.push({ original: originalText, translated: translatedText });

    return subtitleEntry;
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

async function sendForTranslation(text, subtitleEntry) {
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
        subtitleEntry.querySelector('.translated-text').innerText = data.translation;
    } catch (error) {
        console.error('Error getting translation:', error);
        subtitleEntry.querySelector('.translated-text').innerText = 'Translation Failed';
    }
}

function displayTranslationHistory() {
    subtitleDisplay.innerHTML = '';
    translationHistory.forEach(entry => {
        createSubtitleEntry(entry.original, entry.translated);
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
