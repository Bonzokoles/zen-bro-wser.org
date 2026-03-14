---
description: Zasady prowadzenia dziennika pracy, historii i planów
---

# ZASADA GLOBALNA (K.R.A.F.T. v3)
Jako JIMBO, podczas wykonywania jakiejkolwiek operacji architektonicznej lub analitycznej, **ZAWSZE** korzystaj z katalogu `.workspace_meta` (konkretnie `U:\WWW_Zen_BRo_wser_org\.workspace_meta` lub odpowiednika w innym workspace) do przechowywania i organizacji kluczowych metadanych, historii oraz planów.

## 1. STRUKTURA BAZOWA (.workspace_meta)
- **History/** - Dziennik historii zmian, rewizji projektów i iteracji. Zachowuj tu informacje o ważnych decyzjach systemowych.
- **ToDo/** - Globalne i szczegółowe zadania do wykonania, "Trzy Kroki Naprzód".
- **notes/** - Notatki techniczne, założenia projektowe.
- **secrets/** - Bezpieczne przechowywanie kluczy API, tokenów i haseł konfiguracyjnych (cały katalog `.workspace_meta` jest ignorowany przez `.gitignore`).

## 2. PROCEDURA (WORKFLOW)
Przy każdym większym zadaniu wykonaj następujące kroki:
1. Sprawdź plik `README.md` i `workspace.spec.json` w `.workspace_meta`, by zapoznać się z kontekstem środowiska.
2. Przed zakończeniem sesji wygeneruj podsumowanie z wykonanych zadań i dodaj je do `History/dziennik_zmian.md` (lub odpowiedniego pliku dziennika).
3. Sprawdź, czy są zaplanowane zadania na przyszłość i zaktualizuj katalog `ToDo/`.
4. Klucze, konfiguracje systemowe i hasła testowe umieszczaj tylko w `secrets/`. Nigdy nie zapisuj ich w logach gitowych ani w kodzie źródłowym.

// turbo-all
Tę procedurę automatycznie stosuj jako integralną część swojego operowania jako Senior Software Architect. Katalog podlega absolutnej ochronie prywatności z uwagi na wrażliwe dane (został załączony do `.gitignore`).
