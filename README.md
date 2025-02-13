# Speech to Text Web Application

This project is a web application that listens to speech, transcribes it in real-time, and displays subtitles on the page. It also includes activity detection to identify silent and speaking moments.

## Project Structure

```
speech-to-text-app
├── static
│   ├── css
│   │   └── styles.css
│   ├── js
│       └── scripts.js
├── templates
│   └── index.html
├── app.py
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd speech-to-text-app
   ```

2. **Install dependencies:**
   Make sure you have Python and pip installed. Then run:
   ```
   pip install -r requirements.txt
   ```

3. **Run the application:**
   Start the Flask server by executing:
   ```
   python app.py
   ```

4. **Access the application:**
   Open your web browser and go to `http://127.0.0.1:5000`.

## Usage

- Click the button to start listening to speech.
- The transcribed text will appear as subtitles on the page.
- The application will detect silent and speaking moments, providing a seamless experience.

## Dependencies

- Flask
- SpeechRecognition
- Other libraries as specified in `requirements.txt`

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.