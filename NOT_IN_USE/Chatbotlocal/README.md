# Lokalny Chatbot dla Astro + Cloudflare

Opis: frontend w Astro + React, backend FastAPI + PyTorch używający lokalnego modelu (bez zewnętrznych kluczy).

Szybki start:
1. Przygotowanie serwera z GPU:
   - Zainstaluj sterowniki NVIDIA odpowiednie do karty.
   - Zainstaluj NVIDIA Docker (nvidia-container-toolkit).
   - Zainstaluj CUDA (jeśli wymagane).
   - Zainstaluj odpowiednią wersję PyTorch zgodną z CUDA:
     - Przykład (dla CUDA 11.8): pip install torch --index-url https://download.pytorch.org/whl/cu118
2. Umieść model w ./models (np. model z transformers lub lokalnie wytrenowany).
   - Możesz pobrać model z Hugging Face lokalnie (bez używania kluczy jeśli model jest publiczny) lub skopiować własny katalog modelu.
3. Uruchom Docker Compose:
   - docker compose up --build
4. W frontendzie ustaw apiBaseUrl na adres backendu (np. https://twoj-backend.example.com).
5. Wdróż frontend do Cloudflare Pages (repo z Astro); backend hostuj na VPS z GPU lub na serwerze prywatnym.

Optymalizacje pamięci i wydajności:
- Ładuj model z low_cpu_mem_usage=True
- Użyj dtype float16 (torch.float16) jeśli GPU obsługuje fp16
- Rozważ quantization (bitsandbytes lub llama.cpp/ggml) aby zmniejszyć pamięć RAM/VRAM
- Streamuj odpowiedzi (server-sent events lub websockets) aby UX był lepszy
- Ogranicz max_new_tokens i długość promptów, czyść stare konteksty

Deployment z Cloudflare:
- Frontend: Cloudflare Pages (statyczne)
- Backend: nie hostuj modelu na Cloudflare Workers (nie nadają się do ciężkich modeli).
  - Użyj Cloudflare Tunnel (cloudflared) aby bezpiecznie udostępnić backend na publiczny adres lub użyj Cloudflare Access do zabezpieczenia endpointu.
  - Alternatywnie: Cloudflare Workers jako proxy do twojego backendu i dodaj rate-limiting / auth.

Bezpieczeństwo:
- Zabezpiecz endpoint (tokeny, Cloudflare Access).
- Ogranicz zapytania per IP.
- Sanitizuj inputy jeśli model używany w produktach.

Przykładowe open-source komponenty z GitHub do rozważenia:
- https://github.com/botfront/rasa-webchat (self-hostable web widget)
- https://github.com/mckaywrigley/chatbot-ui (UI, często self-hostable)
- https://github.com/oobabooga/text-generation-webui (pełne web UI do lokalnego hostingu modeli)
- https://github.com/botpress/botpress (pełna platforma BOT, self-hosted)

Uwaga: powyższe repozytoria są przykładami — nie używają zewnętrznych kluczy, ale wymagają własnego hostingu modelu/serwera.