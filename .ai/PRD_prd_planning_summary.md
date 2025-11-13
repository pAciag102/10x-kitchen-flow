<conversation_summary>
<decisions>
 * Strategia Mobile: Aplikacja będzie webowa (PWA/RWD), ale widok "Listy Zakupów" zostanie priorytetowo dostosowany do urządzeń mobilnych, aby umożliwić wygodne korzystanie w sklepie.
 * Normalizacja danych: Normalizacja składników przez AI następuje jednorazowo w momencie zapisu przepisu, z obowiązkowym krokiem weryfikacji (edycji) przez użytkownika przed zatwierdzeniem.
 * Wypełnienie bazy (Seed Data): Problem "pustej kartki" zostanie rozwiązany poprzez jednorazowe zescrapowanie przepisów z jednej strony internetowej, aby zapewnić użytkownikom startową bazę danych.
 * Planowanie posiłków: Wykorzystanie biblioteki dnd-kit lub react-beautiful-dnd do stworzenia kalendarza z funkcją "przeciągnij i upuść" (Drag & Drop), podzielonego na kolumny.
 * Model udostępniania: W bazie danych zostanie użyte pole typu ENUM (statusy: private, public_pending, public_approved) do zarządzania widocznością przepisów w przyszłości.
 * Ograniczenia API: Logika limitowania zapytań do AI dla darmowych użytkowników będzie zaimplementowana po stronie Backend/Edge Functions w oparciu o tabelę użycia.
 * Interfejs AI: Asystent sugerujący zamienniki będzie posiadał 3 konkretne akcje: "Akceptuj", "Zapytaj ponownie", "Odrzuć". AI otrzyma pełny kontekst przepisu (JSON).
 * Hosting: Aplikacja będzie hostowana na DigitalOcean.
 * Usuwanie danych: Przy usuwaniu przepisu system wyświetli ostrzeżenie i wymusi aktualizację listy zakupów (usunięcie składników powiązanych z usuwanym daniem).
</decisions>
<matched_recommendations>
 * Mobile First dla Listy Zakupów: Skupienie się na responsywności kluczowego widoku (zakupy) zamiast tworzenia natywnej aplikacji mobilnej.
 * Weryfikacja AI: Zastosowanie mechanizmu "Human-in-the-loop" przy parsowaniu przepisów, aby uniknąć błędów w bazie danych.
 * Kontekstowe UI Asystenta: Zastąpienie ogólnego czatu dedykowanymi przyciskami i modalem przy składnikach.
 * Biblioteki gotowych komponentów: Użycie gotowych rozwiązań (Shadcn, dnd-kit) w celu zminimalizowania pracy nad CSS, zgodnie z profilem backendowym twórcy.
 * Mierzalność sugestii: Wprowadzenie fizycznych przycisków akcji dla sugestii AI, co pozwoli mierzyć wskaźnik sukcesu (akceptowalność > 60%).
   </matched_recommendations>
<prd_planning_summary>
a. Główne wymagania funkcjonalne produktu:
 * Zarządzanie przepisami: Możliwość dodawania przepisów (ręcznie/seed data), ich edycji oraz usuwania z walidacją wpływu na listę zakupów.
 * Normalizacja składników: Silnik AI parsujący tekst na strukturę (Produkt, Ilość, Jednostka) z interfejsem weryfikacji dla użytkownika.
 * Planer tygodniowy: Interfejs Drag & Drop pozwalający przypisać przepisy do dni tygodnia lub ogólnej puli tygodniowej.
 * Inteligentna Lista Zakupów: Automatyczna agregacja składników (sumowanie tych samych produktów i jednostek) z widokiem zoptymalizowanym pod urządzenia mobilne (RWD).
 * Asystent Kulinarny AI: Funkcja kontekstowej sugestii zamienników zintegrowana z listą składników.
b. Kluczowe historie użytkownika i ścieżki korzystania:
 * Jako użytkownik, chcę, aby aplikacja podpowiedziała mi, co kupić, sumując jajka z trzech różnych ciast, abym nie musiał liczyć tego w pamięci.
 * Jako użytkownik będący w sklepie, chcę wygodnie odznaczać kupione produkty na telefonie, bez konieczności powiększania ekranu.
 * Jako nowy użytkownik, chcę zobaczyć gotowe przepisy od razu po zalogowaniu, aby przetestować działanie planera bez żmudnego wpisywania danych.
 * Jako użytkownik, chcę szybko znaleźć zamiennik dla śmietany w zupie, wiedząc, że AI rozumie kontekst dania (zupa, a nie deser).
c. Ważne kryteria sukcesu i sposoby ich mierzenia:
 * North Star Metric: Liczba w pełni ukończonych cykli (Dodanie przepisu -> Zaplanowanie -> Wygenerowanie listy -> Odhaczenie zakupów).
 * Jakość AI: Współczynnik akceptacji sugestii zamienników na poziomie min. 60% (mierzony kliknięciami w "Akceptuj").
 * Retencja: Powracalność użytkowników do widoku listy zakupów w cyklach tygodniowych.
d. Pozostałe ustalenia:
 * Stack: Astro + React + Tailwind/Shadcn + Supabase + DigitalOcean.
 * Model bezpieczeństwa: Row Level Security (RLS) w Supabase dla danych prywatnych.
   </prd_planning_summary>
<unresolved_issues>
 * Szczegóły deploymentu na DigitalOcean: Należy doprecyzować, czy na DigitalOcean będzie hostowany tylko frontend (App Platform), czy również kontenery z logiką backendową, oraz jak to się łączy z Supabase (czy Supabase jest w chmurze jako SaaS, czy self-hosted na DO – to drugie jest znacznie trudniejsze w utrzymaniu).
 * Legalność scrapingu: Należy zweryfikować, czy strona wybrana do pobrania "Seed Data" pozwala na takie działanie w swoim regulaminie (robots.txt), aby uniknąć problemów prawnych na starcie.
 * Obsługa błędów AI przy normalizacji: Choć mamy weryfikację użytkownika, warto doprecyzować "fallback" – co system ma zrobić, gdy API LLM nie odpowie (np. pozwolić na wpisanie całkowicie ręczne bez żadnych podpowiedzi).
   </unresolved_issues>
   </conversation_summary>