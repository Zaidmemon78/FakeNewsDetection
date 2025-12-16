from flask import Flask, render_template, request, jsonify
import pickle
from src.preprocessing import clean_text

app = Flask(__name__)

# --- Load Models ---
try:
    with open('models/model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('models/vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
except FileNotFoundError:
    print("Error: Models nahi mile. Pehle train_model.py run karo.")
    exit()


@app.route('/')
def home():
    return render_template('indexFN.html')


@app.route('/predict', methods=['POST'])
def predict():
    # JavaScript se data JSON format mein aayega
    data = request.get_json()
    news_text = data.get('text', '')

    if not news_text:
        return jsonify({'error': 'No text provided'}), 400

    # 1. Clean Text
    cleaned_news = clean_text(news_text)

    # 2. Vectorize
    vec_news = vectorizer.transform([cleaned_news])

    # 3. Predict
    prediction = model.predict(vec_news)[0]  # Returns 'FAKE' or 'REAL'

    # 4. Confidence Score Logic (Jugaad kyunki PAC probability nahi deta)
    # Agar model ne REAL bola toh hum high score bhejenge, FAKE pe low score
    if prediction == 'REAL':
        credibility_score = 95  # High confidence for Real
        verdict = 'real'
    else:
        credibility_score = 5  # Low confidence (High Fake)
        verdict = 'fake'

    # JSON response wapis bhejo JS ko
    return jsonify({
        'verdict': verdict,
        'credibility': credibility_score,
        'prediction_text': prediction
    })


if __name__ == '__main__':
    app.run(debug=True)