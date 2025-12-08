import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier
from sklearn.metrics import accuracy_score
from src.preprocessing import clean_text

# --- 1. DATA LOAD (DO FILES) ---
print("Loading datasets...")

# Fake aur True data alag-alag load karo
try:
    df_fake = pd.read_csv('data/Fake.csv')
    df_true = pd.read_csv('data/True.csv')
except FileNotFoundError:
    print("Error: 'data/Fake.csv' ya 'data/True.csv' nahi mili. Please check karo files wahin hain na.")
    exit()

# === 2. SMART CLEANING (REMOVE REUTERS) ===
# Ye function "WASHINGTON (Reuters) -" jaisa part hata dega
# Taaki model text padhe, source ka naam nahi.
print("Improving data quality (Removing source names)...")

def remove_publisher(text):
    # Aksar true news mein " - " se pehle source likha hota hai
    if " - " in text:
        # Check karte hain agar shuru mein 100 characters ke andar dash hai toh split karo
        if len(text) > 20 and text.find(" - ") < 100:
            return text.split(" - ", 1)[1]
    return text

# Sirf True news ko saaf karne ki zarurat hoti hai
df_true['text'] = df_true['text'].apply(remove_publisher)

# --- 3. LABELING ---
df_fake['label'] = 'FAKE'
df_true['label'] = 'REAL'

# --- 4. MERGING ---
# Dono ko ek hi table mein jod do
df = pd.concat([df_fake, df_true], axis=0)

# Data ko shuffle karo (mix karo)
df = df.sample(frac=1).reset_index(drop=True)

print(f"Total News Articles: {df.shape[0]}")
print("Deep Cleaning shuru (Isme 1-2 minute lagenge)...")

# --- 5. TEXT PREPROCESSING ---
# Agar dataset columns alag hain toh yahan check kar lena (ISOT dataset mein 'text' hota hai)
df['text'] = df['text'].apply(clean_text)

print("Cleaning complete. Training Model...")

# --- 6. SPLITTING ---
x_train, x_test, y_train, y_test = train_test_split(df['text'], df['label'], test_size=0.2, random_state=7)

# --- 7. VECTORIZATION ---
tfidf_vectorizer = TfidfVectorizer(max_df=0.7)
tfidf_train = tfidf_vectorizer.fit_transform(x_train)
tfidf_test = tfidf_vectorizer.transform(x_test)

# --- 8. MODEL TRAINING ---
pac = PassiveAggressiveClassifier(max_iter=50)
pac.fit(tfidf_train, y_train)

# --- 9. ACCURACY CHECK ---
y_pred = pac.predict(tfidf_test)
score = accuracy_score(y_test, y_pred)
print(f'Model Accuracy: {round(score*100, 2)}%')

# --- 10. SAVING FILES ---
with open('models/vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf_vectorizer, f)

with open('models/model.pkl', 'wb') as f:
    pickle.dump(pac, f)

print("Badhai ho! Smart Model save ho gaya.")