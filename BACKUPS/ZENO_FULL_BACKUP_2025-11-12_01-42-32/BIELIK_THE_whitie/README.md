# BIELIK_THE_whitie - Modular Agent System

This project is a flexible and extensible framework for creating and managing AI agents. The core design principle is modularity, allowing developers to easily configure agents, integrate various language models from different sources, and add new tools.

## Core Concepts

1.  **Agents**: Specialized entities designed to perform specific tasks (e.g., research, coding, planning). Each agent is configured with a specific model, tools, and a system prompt that defines its role.

2.  **Models**: Pluggable language models. The system is not tied to a single provider. You can configure models from OpenAI, Google Gemini, Anthropic, OpenRouter, or even local models running via Ollama or LM Studio.

3.  **Tools**: Functions that agents can use to interact with the outside world (e.g., `web_search`, `file_read`, `execute_code`). Tools are designed to be easily added and assigned to agents.

4.  **Tasks**: The work units assigned to agents. A task has a goal, and the agent uses its model and tools to achieve that goal.

5.  **Orchestrator**: The central component (`AgentManager`) that assigns tasks to appropriate agents, manages the execution flow, and facilitates communication between agents if needed.

## Directory Structure

-   `/agents`: Contains the logic for different types of agents.
-   `/config`: All system configurations (agents, models, tools).
-   `/core`: The core orchestration and management logic.
-   `/docs`: Project documentation, including troubleshooting and improvement roadmaps.
-   `/models`: Interfaces and implementations for different model providers.
-   `/tools`: The implementation of tools available to the agents.
-   `/tasks`: Task management and definitions.
-   `/logs`: For storing execution logs.
