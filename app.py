from flask import Flask, render_template, request, jsonify
import speech_recognition as sr
import io
from pydub import AudioSegment
from googletrans import Translator
import nltk  # Import nltk
import asyncio

app = Flask(__name__)

# Download nltk sentence tokenizer (only needs to be done once)
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")


@app.route('/')
def index():
    return render_template('index.html')


translator = Translator()

@app.route('/translate', methods=['POST'])
async def translate_text():
    data = request.get_json()
    text = data['text']

    try:
       
        result = translator.translate(text, dest="vi")
        return jsonify({'translation': result.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)