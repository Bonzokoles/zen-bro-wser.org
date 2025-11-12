# Improvements & Future Roadmap

This document outlines potential improvements and a roadmap for the future development of the BIELIK agent system.

---

### Phase 1: Core Functionality Enhancements

These are foundational improvements to make the system more robust and capable.

-   **Concrete Model Providers:**
    -   [ ] Implement `OpenAIProvider` using the official OpenAI SDK.
    -   [ ] Implement `GeminiProvider` for Google's models.
    -   [ ] Implement `OllamaProvider` to properly stream responses from local models.
    -   [ ] Implement `OpenRouterProvider` to unify access to dozens of models.

-   **Robust Tool System:**
    -   [ ] Create a `BaseTool` class with `execute` and `schema` methods.
    -   [ ] Implement a tool factory to load tools dynamically.
    -   [ ] Implement core tools: `web_search`, `file_read`, `file_write`, `execute_code`.
    -   [ ] Develop a robust JSON schema for tool function calling that works across different models.

-   **Agent Execution Loop:**
    -   [ ] Implement a proper ReAct (Reason-Act) loop in `BaseAgent`.
    -   [ ] The agent should be able to reason about which tool to use, use it, observe the result, and continue until the task is complete.
    -   [ ] Add a maximum number of iterations to prevent infinite loops.

-   **Task Management:**
    -   [ ] Implement a `TaskQueue` to manage multiple tasks.
    -   [ ] Add support for task dependencies (e.g., task B starts after task A is complete).
    -   [ ] Persist task state to disk to allow for resuming after a restart.

---

### Phase 2: Advanced Capabilities

Building on the core, these features will unlock more complex workflows.

-   **Agent Collaboration:**
    -   [ ] Create a "Manager" or "Orchestrator" agent that can delegate sub-tasks to specialized agents.
    -   [ ] Implement a shared "scratchpad" or memory space for agents to share information.
    -   [ ] Define a simple communication protocol for agents to exchange messages.

-   **Long-Term Memory:**
    -   [ ] Integrate a vector database (e.g., ChromaDB, Pinecone) for semantic memory.
    -   [ ] Agents should be able to save key learnings to the vector store.
    -   [ ] Before starting a task, agents should be able to query the memory for relevant context.

-   **Dynamic Tool Creation:**
    -   [ ] Allow a "coder" agent to write and import new tools at runtime.
    -   [ ] This would require a secure environment for code execution.

-   **User Interaction & Feedback:**
    -   [ ] Implement a mechanism for the agent to ask the user for clarification if a task is ambiguous.
    -   [ ] Allow the user to provide feedback on the agent's final output, which can be used for future fine-tuning.

---

### Phase 3: Usability and Operations

Focus on making the system easier to use, monitor, and deploy.

-   **Configuration UI:**
    -   [ ] A simple web interface (or CLI) for adding/editing models, agents, and tools without modifying the source code directly.

-   **Enhanced Logging & Monitoring:**
    -   [ ] Structured logging (e.g., JSON format) for easier parsing.
    -   [ ] A simple dashboard to view running agents, queued tasks, and model costs.
    -   [ ] Integration with tools like LangSmith for better observability.

-   **Security & Sandboxing:**
    -   [ ] For tools that execute code or shell commands, implement a sandboxed environment (e.g., using Docker) to prevent unintended side effects.

-   **Performance Optimization:**
    -   [ ] Implement caching for tool outputs and model responses where appropriate.
    -   [ ] Explore model quantization and other techniques for running local models more efficiently.
