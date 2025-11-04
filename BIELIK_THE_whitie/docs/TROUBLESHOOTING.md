# Troubleshooting Guide

This guide provides solutions to common problems encountered while using the BIELIK agent system.

---

### 1. API Key Errors

**Problem:** You receive an "Unauthorized", "401", or "Invalid API Key" error when the system tries to use a model.

**Solution:**

-   **Check `.env` file:** Ensure you have a `.env` file in the root directory (copied from `.env.example`) and that it's correctly formatted.
-   **Verify API Key:** Double-check that the API key for the specific provider (e.g., `OPENAI_API_KEY`) is correct and has not expired.
-   **Check Config:** In `src/config/models.config.ts`, make sure the `apiKeyEnvVar` for your model points to the correct variable name in your `.env` file.
-   **Restart the application:** Environment variables are loaded on startup. If you've just created or modified the `.env` file, restart the application.

---

### 2. Model Not Found / Incorrect Model Name

**Problem:** The system throws an error indicating that the model does not exist or is not available.

**Solution:**

-   **Check Provider Dashboard:** Verify the exact model name from the provider's official documentation or your user dashboard (e.g., OpenAI, OpenRouter). Names can be very specific (e.g., `gpt-4o` vs. `gpt-4`).
-   **Check `models.config.ts`:** Ensure the `modelName` property in your model's configuration matches the official name.
-   **Local Models (Ollama):** If you're using a local model, ensure you have pulled the model correctly (`ollama pull llama3`). Also, check that the Ollama server is running and accessible at the `baseURL` specified in the config.

---

### 3. Agent Fails to Use a Tool

**Problem:** An agent reports that it cannot use a tool or that a tool is not available.

**Solution:**

-   **Check `agents.config.ts`:** Verify that the `toolIds` array for the specific agent profile includes the ID of the tool you want it to use.
-   **Check Tool Registration:** Make sure the tool is correctly defined and registered within the system (this will be in `src/tools/`).
-   **Model Capability:** Some smaller or specialized models may not be good at tool-use (function calling). If you're having trouble, try switching the agent to a more powerful model like GPT-4o or Gemini 1.5 Pro to see if the issue is with the model's reasoning capability.

---

### 4. High Latency or Slow Responses

**Problem:** The agent takes a very long time to produce a response.

**Solution:**

-   **Provider Status:** Check the status page of your model provider (e.g., OpenAI Status) to see if there are any ongoing incidents.
-   **Network Connection:** For local models, ensure your machine has sufficient resources (RAM, VRAM) and that the connection to the local server is stable.
-   **Model Choice:** Larger models are naturally slower. If speed is critical, consider using a smaller, faster model (e.g., GPT-3.5 Turbo, Llama 3 8B) for less complex tasks.
-   **Task Complexity:** A very complex prompt or task will require more processing time. Try breaking the task down into smaller steps.

---

### 5. Installation and Dependency Issues

**Problem:** `npm install` fails or you get errors about missing modules when running the application.

**Solution:**

-   **Node.js Version:** Ensure you are using a compatible version of Node.js (e.g., v18 or later).
-   **Clean Install:** Delete the `node_modules` directory and the `package-lock.json` file, then run `npm install` again to get a fresh installation of dependencies.
