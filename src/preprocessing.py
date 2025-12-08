import re
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

# NLTK data download (sirf pehli baar ke liye zaroori hai)
nltk.download('stopwords')

ps = PorterStemmer()


def clean_text(text):
    # 1. Agar text khali hai toh wapis bhej do
    if not text:
        return ""

    # 2. Sirf alphabets rakho (numbers aur symbols hata do)
    review = re.sub('[^a-zA-Z]', ' ', text)

    # 3. Lower case mein convert karo
    review = review.lower()

    # 4. Words ko split karo list mein
    review = review.split()

    # 5. Stopwords hatao (is, the, was) aur Stemming karo (running -> run)
    stop_words = set(stopwords.words('english'))
    review = [ps.stem(word) for word in review if not word in stop_words]

    # 6. Wapis sentence bana do
    review = ' '.join(review)
    return review