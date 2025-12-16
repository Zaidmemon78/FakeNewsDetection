document.addEventListener("DOMContentLoaded", function () {
    // --- DOM Elements ---
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Forms
    const textForm = document.getElementById("text-form");
    const urlForm = document.getElementById("url-form");
    const newsText = document.getElementById("news-text");
    const newsUrl = document.getElementById("news-url");

    // File Uploads
    const textFileUpload = document.getElementById("text-file-upload");
    const urlFileUpload = document.getElementById("url-file-upload");
    const textFileName = document.getElementById("text-file-name");
    const urlFileName = document.getElementById("url-file-name");

    // Tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // Results Section
    const resultsSection = document.getElementById("results-section");
    const verdictIcon = document.getElementById("verdict-icon");
    const verdictText = document.getElementById("verdict-text");
    const confidenceValue = document.getElementById("confidence-value");
    const progressBar = document.getElementById("progress-bar");
    const explanation = document.getElementById("explanation");
    const sourcesList = document.getElementById("sources-list");
    const shareBtn = document.getElementById("share-btn");

    // History & Toast
    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history");
    const toast = document.getElementById("toast");
    const toastContent = document.getElementById("toast-content");
    const toastClose = document.getElementById("toast-close");

    // Set Year
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // --- THEME & UI LOGIC ---

    // Check saved theme
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        if(darkModeToggle) darkModeToggle.checked = true;
    }

    // Toggle Theme
    if(darkModeToggle){
        darkModeToggle.addEventListener("change", function () {
            if (this.checked) {
                document.body.classList.add("dark-mode");
                localStorage.setItem("darkMode", "enabled");
            } else {
                document.body.classList.remove("dark-mode");
                localStorage.setItem("darkMode", "disabled");
            }
        });
    }

    // Tab Switching
    tabBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const tabId = this.dataset.tab;
            tabBtns.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) => content.classList.remove("active"));
            this.classList.add("active");
            document.getElementById(`${tabId}-tab`).classList.add("active");
        });
    });

    // File Upload Name Display
    if (textFileUpload) {
        textFileUpload.addEventListener("change", function () {
            textFileName.textContent = this.files.length > 0 ? this.files[0].name : "";
        });
    }

    // --- MAIN ANALYSIS LOGIC (Connects to YOUR Python Model) ---

    // 1. Text Form Submit
    if (textForm) {
        textForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const text = newsText.value.trim();
            if (text) {
                showLoadingState(textForm);
                // Call Python Backend
                analyzeContent(text, "text", textForm);
            }
        });
    }

    // 2. URL Form Submit
    if (urlForm) {
        urlForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const url = newsUrl.value.trim();
            if (url) {
                // Filhal hum sirf URL string ko hi check kar rahe hain
                showLoadingState(urlForm);
                analyzeContent(url, "url", urlForm);
            }
        });
    }

    // --- FUNCTION TO CALL FLASK API (/predict) ---
    async function analyzeContent(content, type, formElement) {
        try {
            console.log("Sending to local model:", content);

            // POST request bhej rahe hain app.py ko
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: content }),
            });

            const data = await response.json();

            // Agar error aaya backend se
            if (data.error) {
                showToast("Error: " + data.error, "error");
                hideLoadingState(formElement);
                return;
            }

            // Data receive hua (Verdict, Score)
            const verdict = data.verdict; // 'real' or 'fake'
            const credibility = data.credibility; // 95 or 5

            // Explanation Logic
            let explanationText = "";
            let sources = [];

            if (verdict === 'real') {
                explanationText = "AI Result: Based on the writing style and vocabulary, our model classifies this as REAL news.";
                sources = [{ name: "Verified Pattern Match", url: "#" }];
            } else {
                explanationText = "AI Result: This content contains sensational language and patterns commonly found in FAKE news.";
                sources = [];
            }

            // UI Update Karo
            displayResults(content, type, verdict, credibility, explanationText, sources);
            addToHistory(content, type, verdict, credibility);

            // Result Section Show Karo
            resultsSection.classList.remove("hidden");
            resultsSection.scrollIntoView({ behavior: "smooth" });

        } catch (err) {
            console.error("Connection Failed:", err);
            showToast("Failed to connect to Local AI Model. Make sure 'app.py' is running!", "error");
        } finally {
            hideLoadingState(formElement);
        }
    }

    // --- UI HELPER FUNCTIONS ---

    function showLoadingState(form) {
        const submitBtn = form.querySelector(".submit-btn");
        const btnText = submitBtn.querySelector(".btn-text");
        const spinner = submitBtn.querySelector(".spinner");
        btnText.textContent = "Analyzing...";
        spinner.classList.remove("hidden");
        submitBtn.disabled = true;
    }

    function hideLoadingState(form) {
        const submitBtn = form.querySelector(".submit-btn");
        const btnText = submitBtn.querySelector(".btn-text");
        const spinner = submitBtn.querySelector(".spinner");
        btnText.textContent = form.id === "text-form" ? "Analyze Text" : "Analyze URL";
        spinner.classList.add("hidden");
        submitBtn.disabled = false;
    }

    function displayResults(content, type, verdict, credibility, explanationText, sources) {
        // Reset Classes
        verdictIcon.className = "verdict-icon";
        verdictText.className = "verdict-text";
        progressBar.className = "progress-bar";

        // Set Values
        verdictIcon.classList.add(verdict);
        verdictText.classList.add(verdict);
        progressBar.classList.add(verdict);

        if (verdict === "real") {
            verdictIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            verdictText.textContent = "Likely Real News";
        } else {
            verdictIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            verdictText.textContent = "Likely Fake News";
        }

        confidenceValue.textContent = credibility + "%";

        // Animation
        progressBar.style.width = "0%";
        setTimeout(() => { progressBar.style.width = credibility + "%"; }, 100);

        explanation.textContent = explanationText;

        // Sources Update
        sourcesList.innerHTML = "";
        if (sources.length > 0) {
            sources.forEach((source) => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="#">${source.name}</a>`;
                sourcesList.appendChild(li);
            });
        } else {
            sourcesList.innerHTML = "<li>No specific sources cited for fake content.</li>";
        }
    }

    // --- HISTORY FUNCTIONS ---
    function addToHistory(content, type, verdict, credibility) {
        let history = JSON.parse(localStorage.getItem("newsHistory")) || [];
        const historyItem = {
            id: Date.now(),
            content: content,
            type: type,
            verdict: verdict,
            credibility: credibility,
            date: new Date().toISOString(),
        };
        history.unshift(historyItem);
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem("newsHistory", JSON.stringify(history));
        displayHistory();
    }

    function displayHistory() {
        if (!historyList) return;
        const history = JSON.parse(localStorage.getItem("newsHistory")) || [];

        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No recent checks found.</p>';
            return;
        }

        historyList.innerHTML = "";
        history.forEach((item) => {
            const historyItem = document.createElement("div");
            historyItem.className = "history-item";

            const titleText = item.content.length > 40 ? item.content.substring(0, 40) + "..." : item.content;

            historyItem.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-title">${titleText}</div>
                    <div class="history-item-date">${new Date(item.date).toLocaleString()}</div>
                </div>
                <div class="history-item-verdict ${item.verdict}">${item.verdict.toUpperCase()}</div>
            `;

            historyItem.addEventListener("click", () => {
                newsText.value = item.content;
                analyzeContent(item.content, "text", textForm);
            });

            historyList.appendChild(historyItem);
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", function () {
            localStorage.removeItem("newsHistory");
            displayHistory();
            showToast("History cleared", "success");
        });
    }

    function showToast(message, type = "info") {
        toastContent.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove("hidden");
        setTimeout(() => { toast.classList.add("hidden"); }, 3000);
    }
    if(toastClose) toastClose.addEventListener("click", () => toast.classList.add("hidden"));

    // Init History
    displayHistory();
});