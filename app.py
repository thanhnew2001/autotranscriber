import os
from openai import OpenAI
from flask import Flask, request, jsonify, render_template
import nltk

app = Flask(__name__)

# Download nltk sentence tokenizer (only needs to be done once)
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")

@app.route('/caption')
def caption():
    return render_template('ontop.html')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    transcriptions = data['transcriptions']
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": f"""Summarize the following text, if the content is too complicated, 
             then break them down into multi-level. In the return text, 
             use bullet point system such as 1, 1.1, 1.2 then 2, 2.1, 2.2:
             \n\n{transcriptions}"""}
        ]
    )
    summary = response.choices[0].message.content
    bullet_points = summary.split('\n')
    bullet_points = [point.strip() for point in bullet_points if point.strip()]

    return jsonify({'summary': bullet_points})

@app.route('/create-quiz', methods=['POST'])
def create_quiz():
    data = request.get_json()
    transcriptions = data['transcriptions']
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": f"Create a MC quiz based on this text:\n\n{transcriptions}"}
        ]
    )
    quiz = response.choices[0].message.content
 

    return jsonify({'quiz': quiz})

if __name__ == '__main__':
    app.run(debug=True)