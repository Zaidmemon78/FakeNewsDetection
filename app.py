from flask import Flask, render_template, request
import pickle
from src.preprocessing import clean_text

app = Flask(__name__)

# Load Model and Vectorizer
with open('models/model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('models/vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        news_text = request.form['news_content']

        # --- DEBUGGING START (Ye terminal mein dikhega) ---
        print("\n" + "=" * 30)
        print(f"User Input: {news_text[:50]}...")  # Pehle 50 characters

        cleaned_news = clean_text(news_text)
        print(f"Cleaned Text: {cleaned_news[:50]}...")

        vec_news = vectorizer.transform([cleaned_news])
        # Check karo ki vector mein kuch data aaya ya sab zero hai
        print(f"Vector Non-Zero Count: {vec_news.nnz}")

        prediction = model.predict(vec_news)
        print(f"Model Prediction: {prediction[0]}")
        print("=" * 30 + "\n")
        # --- DEBUGGING END ---

        result = prediction[0]
        return render_template('index.html', prediction_text=f'Yeh Khabar Hai: {result}', news=news_text)


if __name__ == '__main__':
    app.run(debug=True)