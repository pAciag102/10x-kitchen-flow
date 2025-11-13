# Dokument wymagań produktu (PRD) - KitchenFlow

## 1. Przegląd produktu

KitchenFlow to aplikacja webowa typu Utility (narzędziowa), zaprojektowana w celu centralizacji zarządzania domowymi przepisami kulinarnymi oraz automatyzacji procesu planowania zakupów. Aplikacja adresuje problem rozproszenia danych kulinarnych (przepisy w zakładkach, książkach, zrzutach ekranu) oraz uciążliwości ręcznego tworzenia list zakupów.

Główną wartością dodaną produktu jest wykorzystanie sztucznej inteligencji (LLM) do strukturyzacji danych o składnikach, co umożliwia ich automatyczną agregację na liście zakupów, oraz kontekstowe wsparcie użytkownika w kuchni (np. sugerowanie zamienników). Aplikacja budowana jest w modelu Mobile First dla widoków konsumpcji (sklep, gotowanie), przy zachowaniu pełnej funkcjonalności desktopowej do planowania.

Technologicznie projekt opiera się na stacku: Astro, React, Tailwind/Shadcn, Supabase oraz DigitalOcean.

## 2. Problem użytkownika

Użytkownicy gotujący w domu borykają się z trzema głównymi problemami:

1.  Rozproszenie wiedzy: Przepisy są przechowywane w nieustrukturyzowany sposób w wielu miejscach, co utrudnia ich szybkie odnalezienie.
2.  Czasochłonne planowanie zakupów: Przenoszenie składników z przepisu na listę zakupów wymaga ręcznego przepisywania i sumowania (np. dodawanie jajek z trzech różnych przepisów w pamięci). Jest to proces podatny na błędy i frustrujący.
3.  Brak elastyczności w trakcie gotowania: W przypadku braku składnika, amatorzy gotowania często nie wiedzą, czym go zastąpić, nie rozumiejąc chemicznej lub smakowej roli składnika w konkretnym daniu (np. różnica między śmietaną w zupie a w deserze).

## 3. Wymagania funkcjonalne

### 3.1. Zarządzanie Przepisami (Core)

- System musi umożliwiać dodawanie przepisów ręcznie oraz poprzez import z URL (scraping).
- System musi posiadać mechanizm Seed Data, wypełniający bazę startową zestawem przepisów dla nowych użytkowników, aby uniknąć efektu pustej kartki.
- Edycja i usuwanie przepisów muszą być możliwe w każdym momencie.
- Usunięcie przepisu musi skutkować ostrzeżeniem o konsekwencjach dla aktywnej listy zakupów.

### 3.2. Normalizacja Danych (AI)

- System musi wykorzystywać AI do parsowania bloku tekstu ze składnikami na format JSON: {Nazwa Produktu, Ilość, Jednostka}.
- Proces normalizacji musi zawierać etap weryfikacji przez człowieka (Human-in-the-loop) przed zapisem do bazy.
- System musi obsługiwać fallback: w przypadku awarii AI, użytkownik musi mieć możliwość ręcznego wprowadzenia danych strukturalnych.

### 3.3. Planer Posiłków

- Interfejs musi obsługiwać mechanizm Drag & Drop (przeciągnij i upuść).
- Użytkownik musi mieć możliwość przypisania przepisu do konkretnego dnia lub do ogólnej puli Do zrobienia.

### 3.4. Inteligentna Lista Zakupów

- System musi automatycznie agregować składniki z zaplanowanych przepisów (sumowanie ilości dla tych samych produktów i jednostek).
- Widok listy zakupów musi być responsywny i zoptymalizowany pod obsługę jedną ręką na urządzeniach mobilnych (duże pola tapnięcia).
- Lista musi umożliwiać odznaczanie kupionych produktów (stan lokalny lub synchronizowany).

### 3.5. Asystent Kulinarny AI

- W widoku przepisu, przy każdym składniku, musi znajdować się opcja wywołania asystenta.
- Asystent musi oferować funkcje: Zamienniki (z uwzględnieniem kontekstu całego przepisu).
- Interfejs asystenta musi opierać się na predefiniowanych akcjach (Akceptuj sugestię, Odrzuć, Zapytaj ponownie), a nie na otwartym czacie.

### 3.6. Bezpieczeństwo i Dostęp

- Uwierzytelnianie użytkowników poprzez Supabase Auth.
- Separacja danych użytkowników za pomocą Row Level Security (RLS) w bazie danych.
- Limitowanie zapytań do AI dla darmowych użytkowników (logika backendowa).

## 4. Granice produktu

- Brak natywnej aplikacji mobilnej: Produkt jest aplikacją webową (PWA/RWD). Nie będzie publikowany w App Store/Google Play w pierwszej fazie.
- Brak zaawansowanego śledzenia spiżarni: Aplikacja nie śledzi stanów magazynowych w domu użytkownika (inventory management), służy jedynie do planowania zakupów pod konkretne gotowanie.
- Brak funkcji społecznościowych (Feed): Użytkownicy nie mogą obserwować się nawzajem ani lajkować swoich działań. Współdzielenie przepisów ogranicza się do zmiany statusu widoczności (przygotowanie pod przyszłe funkcje).
- Płatności: W wersji MVP nie będzie zintegrowanych bramek płatności; limity AI są sztywne lub odnawialne, ale nie do kupienia.

## 5. Historyjki użytkowników

Poniżej znajdują się szczegółowe historyjki użytkowników. Każda z nich posiada unikalne ID oraz kryteria akceptacji.

### Uwierzytelnianie i Konfiguracja

ID: US-001
Tytuł: Rejestracja i logowanie użytkownika
Opis: Jako nowy użytkownik, chcę móc założyć bezpieczne konto i zalogować się, aby moje przepisy i listy zakupów były prywatne i dostępne na różnych urządzeniach.
Kryteria akceptacji:

1. Użytkownik może zarejestrować się podając e-mail i hasło lub używając dostawcy OAuth (np. Google/GitHub - zależnie od konfiguracji Supabase).
2. Po udanej rejestracji użytkownik jest automatycznie logowany.
3. Użytkownik widzi tylko swoje dane (przepisy, listy) po zalogowaniu (weryfikacja RLS).
4. Próba dostępu do chronionych zasobów bez logowania przekierowuje na stronę logowania.

ID: US-002
Tytuł: Start z wypełnioną bazą (Seed Data)
Opis: Jako nowy użytkownik, chcę zobaczyć przykładowe przepisy od razu po pierwszym zalogowaniu, abym mógł przetestować funkcje aplikacji bez konieczności żmudnego wprowadzania własnych danych.
Kryteria akceptacji:

1. Przy pierwszym logowaniu (lub inicjalizacji konta) do bazy danych użytkownika kopiowany jest zestaw min. 5 gotowych przepisów.
2. Przepisy te są w pełni edytowalne i usuwalne przez użytkownika.
3. Przepisy startowe posiadają już poprawnie znormalizowane składniki.

### Zarządzanie Przepisami i AI

ID: US-003
Tytuł: Import przepisu z URL (Scraping)
Opis: Jako użytkownik, chcę wkleić link do przepisu z popularnej strony kulinarnej, aby system automatycznie pobrał tytuł, zdjęcie, instrukcje i składniki.
Kryteria akceptacji:

1. System posiada pole input na URL.
2. Po wklejeniu URL i zatwierdzeniu, system pobiera treść strony.
3. Tytuł, zdjęcie (jeśli dostępne) i treść przepisu są poprawnie ekstrahowane do formularza edycji.
4. Jeśli strona jest nieobsługiwana lub zablokowana, wyświetla się czytelny komunikat błędu z prośbą o ręczne wprowadzenie.

ID: US-004
Tytuł: Normalizacja składników z weryfikacją (Human-in-the-loop)
Opis: Jako użytkownik dodający przepis, chcę, aby AI podzieliło tekst składników na produkt, ilość i jednostkę, ale chcę mieć możliwość poprawienia błędów przed zapisem, aby baza danych była czysta.
Kryteria akceptacji:

1. System wysyła surowy tekst składników do API AI.
2. System wyświetla użytkownikowi tabelę/listę z rozpoznanymi polami: Nazwa, Ilość, Jednostka.
3. Użytkownik może edytować każde pole ręcznie (np. zmienić sztuki na gramy).
4. Przycisk Zapisz jest aktywny dopiero po zatwierdzeniu sekcji składników przez użytkownika.
5. W przypadku błędu API AI, użytkownik otrzymuje puste pola do wypełnienia ręcznego (fallback).

ID: US-005
Tytuł: Usuwanie przepisu z walidacją wpływu
Opis: Jako użytkownik, chcę usunąć przepis, który mi nie smakował, i zostać poinformowanym, jeśli wpłynie to na moją listę zakupów.
Kryteria akceptacji:

1. Wybranie opcji Usuń wyświetla modal potwierdzenia.
2. Jeśli przepis znajduje się w planie/liście zakupów, system wyświetla ostrzeżenie: Usunięcie tego przepisu usunie również powiązane składniki z Twojej listy zakupów.
3. Po potwierdzeniu przepis znika z bazy, a jego składniki są usuwane z listy zakupów.

### Planowanie i Zakupy

ID: US-006
Tytuł: Planowanie posiłków (Drag & Drop)
Opis: Jako użytkownik, chcę przeciągać przepisy z mojej bazy na dni tygodnia lub do ogólnej kolumny Do kupienia, aby szybko zaplanować wyżywienie.
Kryteria akceptacji:

1. Użytkownik widzi listę swoich przepisów (sidebar/drawer) i obszar planera (kolumny).
2. Przeciągnięcie kafelka przepisu na kolumnę przypisuje go do tej kolumny.
3. Możliwe jest przenoszenie przepisów między kolumnami (zmiana dnia).
4. Możliwe jest usunięcie przepisu z planera (nie z bazy) poprzez przeciągnięcie do kosza lub przycisk X.

ID: US-007
Tytuł: Generowanie i agregacja listy zakupów
Opis: Jako użytkownik, chcę, aby aplikacja zsumowała te same składniki z różnych przepisów w planerze, abym w sklepie widział jedną pozycję np. Jajka: 5 sztuk zamiast dwóch pozycji 2 sztuki i 3 sztuki.
Kryteria akceptacji:

1. Lista zakupów generuje się automatycznie na podstawie zawartości planera.
2. Składniki o tej samej znormalizowanej nazwie i jednostce są sumowane (np. 200ml śmietany + 100ml śmietany = 300ml śmietany).
3. Składniki o różnych jednostkach (np. gramy vs łyżki) są wyświetlane jako osobne pozycje lub (opcjonalnie) sprowadzane do wspólnej jednostki, jeśli logika na to pozwala.

ID: US-008
Tytuł: Mobilna lista zakupów w sklepie
Opis: Jako użytkownik będący w sklepie, chcę wygodnie odhaczać kupione produkty na telefonie, mając czytelny interfejs dostosowany do małego ekranu.
Kryteria akceptacji:

1. Widok listy zakupów na mobile posiada duże checkboxy/obszary klikalne.
2. Odhaczony produkt wizualnie zmienia stan (np. przekreślenie, wyszarzenie, przesunięcie na dół listy).
3. Stan listy (odhaczone/nieodhaczone) jest zachowywany po odświeżeniu strony.
4. Interfejs nie wymaga poziomego przewijania na standardowych ekranach smartfonów.

### Asystent AI

ID: US-009
Tytuł: Sugestie zamienników w kontekście
Opis: Jako użytkownik w trakcie gotowania, chcę kliknąć na składnik i zapytać o zamiennik, otrzymując odpowiedź pasującą do typu dania.
Kryteria akceptacji:

1. Przy każdym składniku na widoku szczegółów przepisu dostępna jest ikona/opcja Zamiennik.
2. Po kliknięciu otwiera się modal/popover.
3. AI generuje sugestię uwzględniając nazwę przepisu i pozostałe składniki (kontekst).
4. Użytkownik ma do wyboru przyciski akcji, np. Akceptuj (notatka zostaje dodana do przepisu) lub Odrzuć.

## 6. Metryki sukcesu

Aby ocenić skuteczność wdrożenia i wartość produktu, monitorowane będą następujące metryki:

### Metryka Północy (North Star Metric)

- Liczba Pełnych Cykli Tygodniowo: Definiowana jako sekwencja zdarzeń: Dodanie/Wybranie Przepisu -> Dodanie do Planera -> Wygenerowanie Listy -> Odhaczenie min. 80% pozycji na liście. Świadczy to o tym, że aplikacja faktycznie pomogła w procesie od planowania do zakupu.

### Metryki Jakościowe (AI)

- Współczynnik Akceptacji Normalizacji: Procent sesji dodawania przepisu, w których użytkownik NIE dokonał ręcznej edycji pól wygenerowanych przez AI przed zapisem. (Cel > 70%).
- Użyteczność Zamienników: Stosunek sugestii zamienników ocenionych pozytywnie (Akceptuj) do wszystkich wygenerowanych sugestii. (Cel > 60%).

### Metryki Utrzymania i Wydajności

- Retencja W1 i W4: Procent użytkowników wracających do widoku Listy Zakupów w kolejnych tygodniach po rejestracji.
- Czas Odpowiedzi AI: Średni czas oczekiwania na sparsowanie przepisu. Jeśli przekracza 5 sekund, należy rozważyć optymalizację UX (loadery, taski w tle).
