document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    // Theme Toggle
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Forms
    const textForm = document.getElementById("text-form");
    const urlForm = document.getElementById("url-form");
    const newsText = document.getElementById("news-text");
    const newsUrl = document.getElementById("news-url");
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

    // History Section
    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history");

    // Toast
    const toast = document.getElementById("toast");
    const toastContent = document.getElementById("toast-content");
    const toastClose = document.getElementById("toast-close");

    // Login and Register Forms
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const registerName = document.getElementById("register-name");
    const registerEmail = document.getElementById("register-email");
    const registerPassword = document.getElementById("register-password");
    const confirmPassword = document.getElementById("confirm-password");
    const termsCheckbox = document.getElementById("terms");

    // Navigation
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".section");
    const loginNavLink = document.getElementById("login-nav-link");
    const registerLink = document.getElementById("register-link");
    const loginLink = document.getElementById("login-link");

    // Set current year in footer
    document.getElementById("current-year").textContent =
        new Date().getFullYear();

    // (API token configured via GEMINI_API_KEY constant below)

    // Gemini API key: set it here for local demo only (DO NOT commit your real key)
    // Example: const GEMINI_API_KEY = 'AIza...';
    const GEMINI_API_KEY = "AIzaSyCaedw9V-Dt5ceIbMz3x7mqKHc2OuTVTvo";
    // GEMINI_MODEL: set the model resource name that works with your key. Example values you may see in ListModels:
    // 'models/gemini-1.0', 'models/gemini-2.1', 'models/gemini-2.5-flash', 'models/chat-bison-001', etc.
    // If you got a successful response for 'models/gemini-2.5-flash' in the console, set that here.
    const GEMINI_MODEL = "models/gemini-2.5-flash";

    // Check login status
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userEmail = localStorage.getItem("userEmail");

    // Update navigation based on login status
    updateNavigation(isLoggedIn, userEmail);

    // Check for saved theme preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    // Theme Toggle Event Listener
    darkModeToggle.addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    });

    // Navigation
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetSection = this.getAttribute("data-section");

            // Remove active class from all links and sections
            navLinks.forEach((link) => link.classList.remove("active"));
            sections.forEach((section) => section.classList.remove("active"));

            // Add active class to current link and section
            this.classList.add("active");
            document
                .getElementById(`${targetSection}-section`)
                .classList.add("active");

            // Scroll to top
            window.scrollTo(0, 0);
        });
    });

    // Register and Login links
    if (registerLink) {
        registerLink.addEventListener("click", function (e) {
            e.preventDefault();
            document.getElementById("login-section").classList.remove("active");
            document.getElementById("register-section").classList.add("active");

            // Update navigation
            navLinks.forEach((link) => link.classList.remove("active"));
            loginNavLink.classList.add("active");
        });
    }

    if (loginLink) {
        loginLink.addEventListener("click", function (e) {
            e.preventDefault();
            document
                .getElementById("register-section")
                .classList.remove("active");
            document.getElementById("login-section").classList.add("active");

            // Update navigation
            navLinks.forEach((link) => link.classList.remove("active"));
            loginNavLink.classList.add("active");
        });
    }

    // Tab Switching
    tabBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const tabId = this.dataset.tab;

            // Remove active class from all buttons and contents
            tabBtns.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) =>
                content.classList.remove("active")
            );

            // Add active class to current button and content
            this.classList.add("active");
            document.getElementById(`${tabId}-tab`).classList.add("active");
        });
    });

    // File Upload Handling
    if (textFileUpload) {
        textFileUpload.addEventListener("change", function () {
            if (this.files.length > 0) {
                textFileName.textContent = this.files[0].name;
            } else {
                textFileName.textContent = "";
            }
        });
    }

    if (urlFileUpload) {
        urlFileUpload.addEventListener("change", function () {
            if (this.files.length > 0) {
                urlFileName.textContent = this.files[0].name;
            } else {
                urlFileName.textContent = "";
            }
        });
    }

    // Form Submission - Text Analysis
    if (textForm) {
        textForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const text = newsText.value.trim();
            if (text) {
                showLoadingState(textForm);
                // Simulate API call
                setTimeout(async () => {
                    await analyzeContent(text, "text");
                    hideLoadingState(textForm);
                }, 2000);
            }
        });
    }

    // Form Submission - URL Analysis
    if (urlForm) {
        urlForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const url = newsUrl.value.trim();
            if (url) {
                showLoadingState(urlForm);
                // Simulate API call
                setTimeout(async () => {
                    await analyzeContent(url, "url");
                    hideLoadingState(urlForm);
                }, 2000);
            }
        });
    }

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let isValid = true;

            // Validate email
            if (!validateEmail(loginEmail.value)) {
                document.getElementById("login-email-error").style.display =
                    "block";
                loginEmail.classList.add("shake");
                setTimeout(() => loginEmail.classList.remove("shake"), 500);
                isValid = false;
            } else {
                document.getElementById("login-email-error").style.display =
                    "none";
            }

            // Validate password
            if (loginPassword.value.length < 6) {
                document.getElementById("login-password-error").style.display =
                    "block";
                loginPassword.classList.add("shake");
                setTimeout(() => loginPassword.classList.remove("shake"), 500);
                isValid = false;
            } else {
                document.getElementById("login-password-error").style.display =
                    "none";
            }

            if (isValid) {
                // Show loading state
                const submitBtn = loginForm.querySelector(".submit-btn");
                const btnText = submitBtn.querySelector(".btn-text");
                const spinner = submitBtn.querySelector(".spinner");

                btnText.textContent = "Signing In...";
                spinner.classList.remove("hidden");
                submitBtn.disabled = true;

                // Simulate login process
                setTimeout(() => {
                    // In a real app, you would handle the login response here
                    showToast("Login successful! Redirecting...", "success");

                    // Save login state to localStorage
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userEmail", loginEmail.value);

                    // Redirect to home page after 1 second
                    setTimeout(() => {
                        // Update navigation
                        updateNavigation(true, loginEmail.value);

                        // Show home section
                        sections.forEach((section) =>
                            section.classList.remove("active")
                        );
                        document
                            .getElementById("home-section")
                            .classList.add("active");

                        // Update navigation links
                        navLinks.forEach((link) =>
                            link.classList.remove("active")
                        );
                        document
                            .querySelector('[data-section="home"]')
                            .classList.add("active");

                        // Reset form
                        loginForm.reset();
                        btnText.textContent = "Sign In";
                        spinner.classList.add("hidden");
                        submitBtn.disabled = false;

                        // Scroll to top
                        window.scrollTo(0, 0);
                    }, 1000);
                }, 1500);
            }
        });
    }

    // Register Form Submission
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let isValid = true;

            // Validate name
            if (!registerName.value.trim()) {
                document.getElementById("register-name-error").style.display =
                    "block";
                registerName.classList.add("shake");
                setTimeout(() => registerName.classList.remove("shake"), 500);
                isValid = false;
            } else {
                document.getElementById("register-name-error").style.display =
                    "none";
            }

            // Validate email
            if (!validateEmail(registerEmail.value)) {
                document.getElementById("register-email-error").style.display =
                    "block";
                registerEmail.classList.add("shake");
                setTimeout(() => registerEmail.classList.remove("shake"), 500);
                isValid = false;
            } else {
                document.getElementById("register-email-error").style.display =
                    "none";
            }

            // Validate password
            if (registerPassword.value.length < 6) {
                document.getElementById(
                    "register-password-error"
                ).style.display = "block";
                registerPassword.classList.add("shake");
                setTimeout(
                    () => registerPassword.classList.remove("shake"),
                    500
                );
                isValid = false;
            } else {
                document.getElementById(
                    "register-password-error"
                ).style.display = "none";
            }

            // Validate confirm password
            if (registerPassword.value !== confirmPassword.value) {
                document.getElementById(
                    "confirm-password-error"
                ).style.display = "block";
                confirmPassword.classList.add("shake");
                setTimeout(
                    () => confirmPassword.classList.remove("shake"),
                    500
                );
                isValid = false;
            } else {
                document.getElementById(
                    "confirm-password-error"
                ).style.display = "none";
            }

            // Validate terms
            if (!termsCheckbox.checked) {
                showToast("Please agree to the Terms & Conditions", "warning");
                isValid = false;
            }

            if (isValid) {
                // Show loading state
                const submitBtn = registerForm.querySelector(".submit-btn");
                const btnText = submitBtn.querySelector(".btn-text");
                const spinner = submitBtn.querySelector(".spinner");

                btnText.textContent = "Creating Account...";
                spinner.classList.remove("hidden");
                submitBtn.disabled = true;

                // Simulate registration process
                setTimeout(() => {
                    // In a real app, you would handle the registration response here
                    showToast(
                        "Account created successfully! Redirecting to login...",
                        "success"
                    );

                    // Redirect to login page after 1.5 seconds
                    setTimeout(() => {
                        // Show login section
                        document
                            .getElementById("register-section")
                            .classList.remove("active");
                        document
                            .getElementById("login-section")
                            .classList.add("active");

                        // Reset form
                        registerForm.reset();
                        btnText.textContent = "Create Account";
                        spinner.classList.add("hidden");
                        submitBtn.disabled = false;

                        // Pre-fill email in login form
                        loginEmail.value = registerEmail.value;

                        // Scroll to top
                        window.scrollTo(0, 0);
                    }, 1500);
                }, 2000);
            }
        });
    }

    // Toggle password visibility
    const togglePasswordElements =
        document.querySelectorAll(".toggle-password");

    togglePasswordElements.forEach((element) => {
        element.addEventListener("click", function () {
            const passwordField = this.previousElementSibling;
            const type =
                passwordField.getAttribute("type") === "password"
                    ? "text"
                    : "password";
            passwordField.setAttribute("type", type);

            // Toggle eye icon
            const icon = this.querySelector("i");
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        });
    });

    // Show loading state
    function showLoadingState(form) {
        const submitBtn = form.querySelector(".submit-btn");
        const btnText = submitBtn.querySelector(".btn-text");
        const spinner = submitBtn.querySelector(".spinner");

        btnText.textContent = "Analyzing...";
        spinner.classList.remove("hidden");
        submitBtn.disabled = true;
    }

    // Hide loading state
    function hideLoadingState(form) {
        const submitBtn = form.querySelector(".submit-btn");
        const btnText = submitBtn.querySelector(".btn-text");
        const spinner = submitBtn.querySelector(".spinner");

        btnText.textContent =
            form.id === "text-form" ? "Analyze Text" : "Analyze URL";
        spinner.classList.add("hidden");
        submitBtn.disabled = false;
    }

    // Analyze content and show results
    async function analyzeContent(content, type) {
        // Gemini REST API (Google generative language) integration
        const apiKey = GEMINI_API_KEY;

        if (!apiKey) {
            showToast(
                "No Gemini API key found. Set GEMINI_API_KEY in script.js",
                "error"
            );
            return;
        }

        const prompt = `You are a fake news detection AI.\nRate the following news article on a scale of 0 to 100, where:\n- 0 = completely fake\n- 100 = completely true\nOnly return the number. No explanation.\n\nNews: "${content}"`;

        try {
            // Use the configured model resource name with the v1 endpoint
            const modelPath = GEMINI_MODEL || "models/gemini-pro";
            const url = `https://generativelanguage.googleapis.com/v1/${modelPath}:generateContent?key=${apiKey}`;

            let resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });
            let data = null;

            if (!resp.ok) {
                const errText = await resp.text().catch(() => "");
                console.error("Gemini API error", resp.status, errText);

                // If model not found for this API version, try listing available models to help debugging
                if (resp.status === 404) {
                    try {
                        const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
                        const listResp = await fetch(listUrl);
                        if (listResp.ok) {
                            const listData = await listResp.json();
                            console.warn(
                                "Available models:",
                                listData.models || listData
                            );

                            // Try to pick likely candidate models (gemini / bison / chat) and attempt generateContent with them
                            const names = (listData.models || []).map((m) =>
                                m.name ? m.name : String(m)
                            );
                            const candidates = names
                                .filter((n) => /gemini|bison|chat/i.test(n))
                                .slice(0, 6);

                            if (candidates.length === 0) {
                                const modelNames = names.slice(0, 8).join(", ");
                                showToast(
                                    `Model not found (404). No obvious candidates found. Available models: ${modelNames}. See console for full list.`,
                                    "error"
                                );
                            } else {
                                // Try candidates in sequence (limit to 3 attempts)
                                let tried = 0;
                                let success = false;
                                for (const candidate of candidates) {
                                    if (tried >= 3) break;
                                    tried++;
                                    try {
                                        showToast(
                                            `Trying alternative model: ${candidate}`,
                                            "info"
                                        );
                                        const tryUrl = `https://generativelanguage.googleapis.com/v1/${candidate}:generateContent?key=${apiKey}`;
                                        const tryResp = await fetch(tryUrl, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                contents: [
                                                    {
                                                        parts: [
                                                            { text: prompt },
                                                        ],
                                                    },
                                                ],
                                            }),
                                        });
                                        if (tryResp.ok) {
                                            const tryData =
                                                await tryResp.json();
                                            // Replace resp/data with the successful candidate's response
                                            console.info(
                                                `Model ${candidate} worked.`
                                            );
                                            resp = tryResp;
                                            data = tryData;
                                            success = true;
                                            break;
                                        } else {
                                            const tErr = await tryResp
                                                .text()
                                                .catch(() => "");
                                            console.warn(
                                                `Candidate ${candidate} failed:`,
                                                tryResp.status,
                                                tErr
                                            );
                                        }
                                    } catch (innerErr) {
                                        console.warn(
                                            `Error trying candidate ${candidate}:`,
                                            innerErr
                                        );
                                    }
                                }

                                if (!success) {
                                    const modelNames = names
                                        .slice(0, 8)
                                        .join(", ");
                                    showToast(
                                        `Model not found (404). Tried ${tried} candidates and none responded. Available models: ${modelNames}. See console.`,
                                        "error"
                                    );
                                } else {
                                    // If success, continue processing below by reading data from the successful try
                                    // Note: we set `data` above. Fall through to processing logic.
                                }
                            }
                        } else {
                            const listErr = await listResp
                                .text()
                                .catch(() => "");
                            console.error(
                                "List models failed",
                                listResp.status,
                                listErr
                            );
                            showToast(
                                `Model not found (404). Also failed to list models (status ${listResp.status}). Check your key.`,
                                "error"
                            );
                        }
                    } catch (le) {
                        console.error("Failed to list models", le);
                        showToast(
                            "Model not found (404) and failed to list available models. Check your API key and permissions.",
                            "error"
                        );
                    }
                } else {
                    showToast(
                        `Gemini API call failed (status ${resp.status}). Check your key and network.`,
                        "error"
                    );
                }

                return;
            }

            if (!data) data = await resp.json();

            // Robustly extract textual content from the response by traversing the object
            function collectTexts(obj) {
                const texts = [];
                if (obj == null) return texts;
                if (typeof obj === "string") return [obj];
                if (Array.isArray(obj)) {
                    for (const v of obj) texts.push(...collectTexts(v));
                    return texts;
                }
                if (typeof obj === "object") {
                    for (const v of Object.values(obj))
                        texts.push(...collectTexts(v));
                    return texts;
                }
                return texts;
            }

            const allText = collectTexts(data).join(" \n ");
            const match = allText.match(/(\d{1,3})/);

            if (!match) {
                console.error("Gemini returned unexpected content:", data);
                showToast(
                    "Gemini returned unexpected response. Analysis unavailable. Check console for raw response.",
                    "error"
                );
                console.debug("Raw Gemini response:", data);
                return;
            }

            let credibility = parseInt(match[1], 10);
            if (isNaN(credibility)) credibility = 0;
            if (credibility < 0) credibility = 0;
            if (credibility > 100) credibility = 100;

            let verdict, explanationText, sources;
            if (credibility >= 70) {
                verdict = "real";
                explanationText = "Model judgment: likely real news.";
                sources = [
                    {
                        name: "Gemini",
                        url: "https://makersuite.google.com/app",
                    },
                ];
            } else if (credibility <= 30) {
                verdict = "fake";
                explanationText = "Model judgment: likely fake news.";
                sources = [
                    {
                        name: "Gemini",
                        url: "https://makersuite.google.com/app",
                    },
                ];
            } else {
                verdict = "uncertain";
                explanationText = "Model judgment: uncertain.";
                sources = [
                    {
                        name: "Gemini",
                        url: "https://makersuite.google.com/app",
                    },
                ];
            }

            displayResults(
                content,
                type,
                verdict,
                credibility,
                explanationText,
                sources
            );
            addToHistory(content, type, verdict, credibility);
            resultsSection.classList.remove("hidden");
            resultsSection.scrollIntoView({ behavior: "smooth" });
        } catch (err) {
            console.error("Gemini request failed", err);
            showToast("Error calling Gemini: " + (err.message || err), "error");
            return;
        }
    }

    // Images removed: gpt-3.5-turbo is text-only so fileToBase64 and image logic were removed.

    // Display results in the UI
    function displayResults(
        content,
        type,
        verdict,
        credibility,
        explanationText,
        sources
    ) {
        // Update verdict icon and text
        verdictIcon.className = "verdict-icon " + verdict;
        verdictText.className = "verdict-text " + verdict;

        if (verdict === "real") {
            verdictIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            verdictText.textContent = "Likely Real News";
        } else if (verdict === "fake") {
            verdictIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            verdictText.textContent = "Likely Fake News";
        } else {
            verdictIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
            verdictText.textContent = "Uncertain";
        }

        // Update confidence score
        confidenceValue.textContent = credibility + "%";

        // Animate progress bar
        progressBar.className = "progress-bar " + verdict;
        progressBar.style.width = "0%";
        setTimeout(() => {
            progressBar.style.width = credibility + "%";
        }, 100);

        // Update explanation
        explanation.textContent = explanationText;

        // Update sources
        sourcesList.innerHTML = "";
        if (sources && sources.length > 0) {
            sources.forEach((source) => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = source.url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.textContent = source.name;
                li.appendChild(a);
                sourcesList.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "No verified sources available.";
            sourcesList.appendChild(li);
        }
    }

    // Add to history
    function addToHistory(content, type, verdict, credibility) {
        // Get existing history or initialize empty array
        let history = JSON.parse(localStorage.getItem("newsHistory")) || [];

        // Create history item
        const historyItem = {
            id: Date.now(),
            content: content,
            type: type,
            verdict: verdict,
            credibility: credibility,
            date: new Date().toISOString(),
        };

        // Add to beginning of array
        history.unshift(historyItem);

        // Limit history to 10 items
        if (history.length > 10) {
            history = history.slice(0, 10);
        }

        // Save to localStorage
        localStorage.setItem("newsHistory", JSON.stringify(history));

        // Update history display
        displayHistory();
    }

    // Display history
    function displayHistory() {
        if (!historyList) return;

        const history = JSON.parse(localStorage.getItem("newsHistory")) || [];

        if (history.length === 0) {
            historyList.innerHTML =
                '<p class="empty-history">No recent checks found.</p>';
            return;
        }

        historyList.innerHTML = "";

        history.forEach((item) => {
            const historyItem = document.createElement("div");
            historyItem.className = "history-item";

            const content = document.createElement("div");
            content.className = "history-item-content";

            const title = document.createElement("div");
            title.className = "history-item-title";
            title.textContent =
                item.type === "url"
                    ? item.content
                    : item.content.substring(0, 50) + "...";

            const date = document.createElement("div");
            date.className = "history-item-date";
            date.textContent = new Date(item.date).toLocaleString();

            content.appendChild(title);
            content.appendChild(date);

            const verdict = document.createElement("div");
            verdict.className = "history-item-verdict " + item.verdict;
            verdict.textContent = item.credibility + "%";

            historyItem.appendChild(content);
            historyItem.appendChild(verdict);

            // Add click event to show result again
            historyItem.addEventListener("click", function () {
                (async () => {
                    if (item.type === "url") {
                        newsUrl.value = item.content;
                        document.querySelector('[data-tab="url"]').click();
                    } else {
                        newsText.value = item.content;
                        document.querySelector('[data-tab="text"]').click();
                    }

                    // Simulate analysis
                    showLoadingState(item.type === "url" ? urlForm : textForm);
                    setTimeout(async () => {
                        await analyzeContent(item.content, item.type);
                        hideLoadingState(
                            item.type === "url" ? urlForm : textForm
                        );
                    }, 1000);
                })();
            });

            historyList.appendChild(historyItem);
        });
    }

    // Clear history
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", function () {
            localStorage.removeItem("newsHistory");
            displayHistory();
            showToast("History cleared successfully", "success");
        });
    }

    // Share results
    if (shareBtn) {
        shareBtn.addEventListener("click", function () {
            // In a real app, you might generate a shareable link
            // For this demo, we'll just copy the current URL to clipboard
            navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                    showToast("Link copied to clipboard", "success");
                })
                .catch((err) => {
                    showToast("Failed to copy link", "error");
                    console.error("Could not copy text: ", err);
                });
        });
    }

    // Show toast notification
    function showToast(message, type = "info") {
        toastContent.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove("hidden");

        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    }

    // Close toast
    toastClose.addEventListener("click", function () {
        toast.classList.add("hidden");
    });

    // Auto-suggestions for URL (simulated)
    const urlSuggestions = document.getElementById("url-suggestions");
    const sampleSuggestions = [
        "https://example.com/breaking-news",
        "https://example.com/politics",
        "https://example.com/science",
    ];

    if (newsUrl) {
        newsUrl.addEventListener("input", function () {
            const value = this.value.trim();

            if (value.length > 3) {
                // Filter suggestions based on input
                const filtered = sampleSuggestions.filter((s) =>
                    s.includes(value)
                );

                if (filtered.length > 0) {
                    urlSuggestions.innerHTML = "";
                    urlSuggestions.style.display = "block";

                    filtered.forEach((suggestion) => {
                        const div = document.createElement("div");
                        div.className = "suggestion-item";
                        div.textContent = suggestion;
                        div.addEventListener("click", function () {
                            newsUrl.value = suggestion;
                            urlSuggestions.style.display = "none";
                        });
                        urlSuggestions.appendChild(div);
                    });
                } else {
                    urlSuggestions.style.display = "none";
                }
            } else {
                urlSuggestions.style.display = "none";
            }
        });
    }

    // Hide suggestions when clicking outside
    document.addEventListener("click", function (e) {
        if (
            urlSuggestions &&
            e.target !== newsUrl &&
            e.target !== urlSuggestions
        ) {
            urlSuggestions.style.display = "none";
        }
    });

    // FAQ accordion
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", function () {
            // Toggle current item
            item.classList.toggle("active");

            // Close other items
            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                }
            });
        });
    });

    // Email validation function
    function validateEmail(email) {
        const re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Update navigation based on login status
    function updateNavigation(isLoggedIn, userEmail) {
        if (isLoggedIn) {
            // Update login link to show user menu
            if (loginNavLink) {
                loginNavLink.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span class="user-email">${userEmail || "User"}</span>
                `;
                loginNavLink.parentElement.innerHTML += `
                    <div class="dropdown-menu">
                        <a href="#" class="dropdown-item">My Profile</a>
                        <a href="#" class="dropdown-item">My History</a>
                        <a href="#" class="dropdown-item" id="logout-btn">Logout</a>
                    </div>
                `;

                // Add logout functionality
                const logoutBtn = document.getElementById("logout-btn");
                if (logoutBtn) {
                    logoutBtn.addEventListener("click", function (e) {
                        e.preventDefault();
                        localStorage.removeItem("isLoggedIn");
                        localStorage.removeItem("userEmail");
                        showToast("Logged out successfully", "success");
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    });
                }
            }
        }
    }

    // Social login buttons
    const socialButtons = document.querySelectorAll(".social-btn");

    socialButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const provider = this.querySelector("span").textContent;
            showToast(
                `${provider} login is not implemented in this demo`,
                "info"
            );
        });
    });

    // Forgot password link
    const forgotPasswordLink = document.querySelector(".forgot-password");
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function (e) {
            e.preventDefault();
            showToast(
                "Password reset functionality is not implemented in this demo",
                "info"
            );
        });
    }

    // Load history on page load
    displayHistory();
});
