# 📚 ZENO Web Core - Instrukcje Treningowe

Ten katalog zawiera wszystkie materiały treningowe i dokumentację dla AI Assistanta oraz systemu Orchestrator.

## 📁 Zawartość

### Główne Pliki

**AI_ASSISTANT_TRAINING_GUIDE.md**
- Kompletny przewodnik treningowy dla AI Assistanta
- Dokumentacja wszystkich 8 funkcji ZENO Web Core
- Przykłady odpowiedzi i scenariusze użycia
- API Reference i skróty klawiszowe
- Training prompts do wdrożenia w systemie

### Dokumentacja Orchestrator (LIB)

**LIB_01.md** - Koncepcja lokalnych bibliotek tematycznych
- Wprowadzenie do systemu bibliotek
- Struktura katalogów i kategorii
- Koncepcja agentów AI

**LIB_02.md** - Implementacja serwisów
- Storage Service (zarządzanie plikami)
- Classifier Service (klasyfikacja AI)
- Agent Service (przetwarzanie stron)

**LIB_03.md** - Orchestrator i Dashboard
- System kolejkowania
- React Dashboard UI
- API endpoints

**LIB_04.md** - Kompletne pliki implementacyjne
- Pełny kod wszystkich komponentów
- Gotowe do użycia implementacje

## 🎯 Cel

Materiały te służą do:

1. **Treningu AI Assistanta** - Pełna wiedza o funkcjach ZENO
2. **Dokumentacji Orchestrator** - Opis systemu klasyfikacji treści
3. **Onboarding** - Wprowadzenie nowych użytkowników/developerów
4. **Reference** - Szybki dostęp do API i funkcjonalności

## 🚀 Zastosowanie

### Dla AI Assistanta

Użyj **AI_ASSISTANT_TRAINING_GUIDE.md** jako system prompt:

```javascript
const systemPrompt = fs.readFileSync('./INSTRUCTIONS_FOR_TRAINING/AI_ASSISTANT_TRAINING_GUIDE.md', 'utf-8');

const messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: 'Jak działa Iframe Tester?' }
];
```

### Dla Developerów

Przeczytaj pliki LIB_* aby zrozumieć:
- Architekturę systemu Orchestrator
- Proces klasyfikacji treści
- Integrację z OpenAI
- Strukturę API endpoints

## 📊 Status Implementacji

- ✅ Wszystkie pliki LIB zaimplementowane w aplikacji
- ✅ Orchestrator działający na `/orchestrator`
- ✅ AI Assistant zintegrowany z OpenAI
- ✅ System bibliotek lokalnych działający
- ✅ Dashboard z monitoringiem w czasie rzeczywistym

## 🔗 Powiązane Pliki

Implementacja znajduje się w:
- `/src/services/orchestrator/` - Wszystkie serwisy
- `/src/components/OrchestratorDashboard.tsx` - UI komponenty
- `/src/pages/orchestrator.astro` - Główna strona
- `/src/pages/api/orchestrator/[...action].ts` - API endpoints

## 📝 Wersja

**Wersja**: 1.0.0
**Data utworzenia**: 2025-11-04
**Ostatnia aktualizacja**: 2025-11-04

---

**Autor**: Claude Code Assistant
**Projekt**: ZENO Web Core
**Framework**: Astro + React + TypeScript
