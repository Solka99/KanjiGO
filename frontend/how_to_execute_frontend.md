# Frontend Setup Guide

This document explains how to set up the local development environment for the "Kanji Go" application.

## 1. Prerequisites

Before you begin, ensure you have the following software installed on your PC:

* **Python 3.10 or later** and **pip**
* **VS Code** (or your preferred code editor)
* **A smartphone** (iOS or Android)

---

## 2. Installing Node.js and npm

Node.js and npm (Node Package Manager) are required for frontend development.

1.  **Go to the official Node.js website:**
    * [https://nodejs.org/](https://nodejs.org/)

2.  **Download and install the LTS version.**
    LTS stands for "Long Term Support" and is the recommended stable version.

3.  `npm` is automatically installed with Node.js. To verify the installation, open a terminal (Command Prompt or PowerShell) and run the following commands. You should see version numbers for both.
    ```shell
    node -v
    npm -v
    ```

---

## 3. Project Setup

Next, install the project's dependencies for both the backend and frontend.

### 3.1. Backend Setup (Python)

1.  Open a terminal and navigate to the project's root directory.
2.  Create a Python virtual environment by running the following command:
    ```shell
    python -m venv .venv
    ```
3.  Activate the virtual environment.
    * **On Windows (Command Prompt or PowerShell):**
        ```shell
        .\.venv\Scripts\activate
        ```
    * **On Mac / Linux / WSL:**
        ```shell
        source .venv/bin/activate
        ```
    After running the command, you should see `(.venv)` at the beginning of your terminal prompt.

4.  Install the required Python libraries from the `requirements.txt` file.
    ```shell
    pip install -r requirements.txt
    ```

### 3.2. Frontend Setup (React Native)

1.  In your terminal, navigate into the `frontend` directory.
    ```shell
    cd frontend
    ```
2.  Install the required JavaScript libraries. This may take a few minutes.
    ```shell
    npm install
    ```
3.  Once complete, you can return to the root directory.
    ```shell
    cd ..
    ```

---

## 4. ngrok Setup

We use a tool called `ngrok` to allow the smartphone app to communicate securely with the backend server running on your PC. This setup only needs to be done once per developer.

1.  **Sign up for an ngrok account**
    Go to the official `ngrok` website from the link below and create a free account. (You can sign up easily with a Google/GitHub account).
    * Sign-up Page: [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)

2.  **Copy your Authtoken**
    After logging in, go to the "Your Authtoken" page on the dashboard.
    * Authtoken Page: [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
    Copy your personal authentication token (a long string of characters) displayed on the page.

3.  **Configure your Authtoken**
    Return to your terminal (the virtual environment can remain active) and run the following command. Replace `<YOUR_AUTHTOKEN>` with the token you just copied.
    ```shell
    ngrok config add-authtoken <YOUR_AUTHTOKEN>
    ```

---

## 5. Running the Application

All setup is complete. It's time to run the app.
You will need to run the backend, ngrok, and frontend in **three separate terminals**. If you are using VS Code, you can easily open new terminals by clicking the `+` icon in the terminal panel.

### Terminal 1: Start the Backend Server

1.  Make sure your Python virtual environment is activated (`source .venv/bin/activate`).
2.  Run the following command to start the backend server:
    ```shell
    python -m uvicorn backend_python.main:app --reload --host 0.0.0.0
    ```
    You should see `Application startup complete.`

### Terminal 2: Start ngrok

1.  **Open a new terminal** and run the following command:
    ```shell
    ngrok http 8000
    ```
2.  Copy the `https://...ngrok-free.app` URL from the `Forwarding` line. This URL changes every time you restart ngrok.

### Terminal 2 (Continued): Update the API Config File

1.  In your code editor, open the file `frontend/src/apiConfig.ts`.
2.  Update the value of `NGROK_BASE_URL` with the `ngrok` URL you just copied, then save the file.
    ```ts
    // Example
    const NGROK_BASE_URL = '[https://ab12-cd34-ef56.ngrok-free.app](https://ab12-cd34-ef56.ngrok-free.app)'; 
    ```

### Terminal 3: Start the Frontend Server

1.  **Open a third new terminal** and navigate to the `frontend` directory.
    ```shell
    cd frontend
    ```
2.  Run the following command to start the frontend server:
    ```shell
    npx expo start --tunnel
    ```

### Running the App on a Smartphone

1.  When the frontend server starts, a **QR code** will be displayed in the terminal.
2.  Install the official **"Expo Go"** app on your smartphone.
    * [App Store (iOS)](https://apps.apple.com/us/app/expo-go/id982107779)
    * [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
3.  Open the "Expo Go" app and use its "Scan QR code" feature to scan the QR code displayed in your terminal.
4.  After a moment, the app will load and run on your phone.
