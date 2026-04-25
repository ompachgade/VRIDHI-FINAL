// js/auth.js
import { auth, db } from './firebase-setup.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Removed DOMContentLoaded wrapper since type="module" is deferred automatically
    
    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const emailInput = document.getElementById("user_email");
    const passwordInput = document.getElementById("user_password");
    const ageCheck = document.getElementById("age_check");
    const errorMsg = document.getElementById("auth-error-msg");
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Prevent page refresh on Enter key
        });
    }

    // Firebase Auth State Observer
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in.
            // Check if they have profile info in Firestore
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Profile exists, load dashboard
                    const userData = docSnap.data();
                    // Still saving to localStorage so other scripts don't break immediately
                    localStorage.setItem('vridhiUser', JSON.stringify(userData));
                    if (document.getElementById('dashboard-section')) {
                        renderDashboard(userData);
                        switchSection('dashboard-section');
                    }
                } else {
                    // Profile doesn't exist, they need to fill userinfo
                    if (document.getElementById('userinfo-section')) {
                        switchSection('userinfo-section');
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            // User is signed out.
            localStorage.removeItem('vridhiUser');
            if (document.getElementById('login-section')) {
                switchSection('login-section');
            }
        }
    });

    // Helper for showing errors
    const showError = (msg) => {
        if(errorMsg) {
            errorMsg.innerText = msg;
            errorMsg.style.display = "block";
        } else {
            alert(msg);
        }
    };

    // Signup logic
    signupBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        if (loginForm && !loginForm.reportValidity()) return;
        if (!emailInput.value || !passwordInput.value) {
            showError("Please enter email and password");
            return;
        }
        if (!ageCheck.checked) {
            showError("Please accept Terms and Conditions");
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            // onAuthStateChanged will trigger and handle the rest (go to userinfo)
        } catch (error) {
            showError(error.message);
        }
    });

    // Login logic
    loginBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        if (loginForm && !loginForm.reportValidity()) return;
        if (!emailInput.value || !passwordInput.value) {
            showError("Please enter email and password");
            return;
        }
        if (!ageCheck.checked) {
            showError("Please accept Terms and Conditions");
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            // onAuthStateChanged will trigger and handle the rest
        } catch (error) {
            showError("Login failed. Check email/password.");
        }
    });

    // --- Logout override ---
    // Remove the previous event listeners from navigation.js or override them
    document.querySelectorAll('.logout-btn').forEach(btn => {
        // Clone and replace to remove previous listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                localStorage.removeItem('vridhiUser');
                if (window.location.pathname.includes('learn.html')) {
                    window.location.href = 'index.html';
                } else {
                    window.location.reload();
                }
            } catch (error) {
                console.error("Error signing out: ", error);
            }
        });
    });


    // --- User Info Submission Logic ---
    const categoryCards = document.querySelectorAll('.category-card');
    const dynamicContainer = document.getElementById('dynamic-input-container');
    const hiddenCategoryInput = document.getElementById('selected_category');

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            hiddenCategoryInput.value = card.getAttribute('data-category');

            dynamicContainer.style.display = 'flex';
            dynamicContainer.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <label for="exact_income">Total Monthly Income (₹)</label>
                    <input type="number" id="exact_income" placeholder="E.g. 50000" min="0" style="width: 100%;" required>
                </div>
                <label>Customize Budget Rule (Default: 65-20-15)</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <label for="rule_needs" style="font-size: 0.8rem; font-weight: normal; margin-bottom: 3px;">Needs %</label>
                        <input type="number" id="rule_needs" value="65" min="0" max="100" style="padding: 8px;" required>
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <label for="rule_wants" style="font-size: 0.8rem; font-weight: normal; margin-bottom: 3px;">Wants %</label>
                        <input type="number" id="rule_wants" value="20" min="0" max="100" style="padding: 8px;" required>
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <label for="rule_savings" style="font-size: 0.8rem; font-weight: normal; margin-bottom: 3px;">Future %</label>
                        <input type="number" id="rule_savings" value="15" min="0" max="100" style="padding: 8px;" required>
                    </div>
                </div>
                <div id="rule-error" style="color: #ff4d4d; font-size: 0.85rem; margin-top: 8px; display: none; text-align: center;">Percentages must add up to 100%</div>
            `;
        });
    });

    const userInfoForm = document.getElementById("userinfo-form");
    userInfoForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!hiddenCategoryInput.value) {
            alert("Please select a category before continuing!");
            return;
        }

        let needs = 65, wants = 20, savings = 15;
        const needsInput = document.getElementById('rule_needs');
        const wantsInput = document.getElementById('rule_wants');
        const savingsInput = document.getElementById('rule_savings');

        if (needsInput && wantsInput && savingsInput) {
            needs = Number(needsInput.value);
            wants = Number(wantsInput.value);
            savings = Number(savingsInput.value);

            if (needs + wants + savings !== 100) {
                document.getElementById('rule-error').style.display = 'block';
                return;
            } else {
                document.getElementById('rule-error').style.display = 'none';
            }
        }

        const userData = {
            name: document.getElementById('full_name').value,
            age: Number(document.getElementById('user_age').value),
            mobile: document.getElementById('mobile_num').value,
            category: hiddenCategoryInput.value,
            income: Number(document.getElementById('exact_income').value),
            budgetRule: { needs, wants, savings }
        };

        const user = auth.currentUser;
        if (user) {
            try {
                // Save extra info to Firestore
                await setDoc(doc(db, "users", user.uid), userData);
                
                // Save locally and render
                localStorage.setItem('vridhiUser', JSON.stringify(userData));
                renderDashboard(userData);
                switchSection('dashboard-section');
            } catch (error) {
                console.error("Error writing document: ", error);
                alert("Failed to save profile details. Please try again.");
            }
        } else {
            alert("Please log in first!");
        }
    });

