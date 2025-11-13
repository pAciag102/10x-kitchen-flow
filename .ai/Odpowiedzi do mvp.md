1. baza własna stworzona z sparingu ze strony https://aniagotuje.pl/
2. zaawansowane AI/LLM sugestie podczas tworzenia przepisu
3. Rekolekcja
4. Wszytko za darmo to ma być projekt zaliczeniowy nie chcemy komplikacji tylko jak najprost

Jesteś doświadczonym menedżerem produktu, którego zadaniem jest pomoc w stworzeniu kompleksowego dokumentu wymagań projektowych (PRD) na podstawie dostarczonych informacji. Twoim celem jest wygenerowanie listy pytań i zaleceń, które zostaną wykorzystane w kolejnym promptowaniu do utworzenia pełnego PRD.

Prosimy o uważne zapoznanie się z poniższymi informacjami:

<project_description>
Cel projektu:
Stworzenie aplikacji webowej typu "Utility", która służy do zarządzania przepisami kulinarnymi oraz automatyzacji procesu zakupowego. Aplikacja rozwiązuje problem rozproszonych przepisów i trudności w szybkim planowaniu zakupów na podstawie wybranych dań.
Główne filary funkcjonalności:
 * Agregator i Baza Przepisów:
   * System umożliwia przeglądanie przepisów pobranych z zewnętrznych źródeł (scraping) oraz dodanych ręcznie przez użytkownika.
   * Kluczowy wymóg techniczny: Każdy przepis w bazie musi posiadać składniki zapisane w ustrukturyzowanym formacie (nie jako blok tekstu), oddzielając nazwę produktu, ilość i znormalizowaną jednostkę miary.
 * Inteligentna Lista Zakupów:
   * Użytkownik może dodać wiele przepisów do "koszyka".
   * Aplikacja automatycznie agreguje składniki z różnych przepisów (np. sumuje jajka z przepisu A i przepisu B), tworząc jedną, czytelną listę zakupów.
 * Asystent AI (Kontekst Kulinarny):
   * Funkcja "Zamienniki": Możliwość zapytania o alternatywę dla konkretnego składnika w kontekście danego przepisu (np. czym zastąpić śmietanę w zupie, a czym w deserze).
   * Funkcja "Podobne": Sugerowanie przepisów o zbliżonym profilu składników lub stylu.
Stack Technologiczny (Kontekst realizacyjny):
 * Frontend: Astro (statyczne treści) + React (interaktywna lista zakupów) + Tailwind/Shadcn (UI).
 * Backend/DB: Supabase (PostgreSQL, Auth).
 * AI Integration: Wykorzystanie LLM do normalizacji danych wejściowych (parsowanie przepisów) oraz do funkcji asystenta dla użytkownika.
Profil Twórcy:
Backend Developer (Junior/Mid) z doświadczeniem w Python/JS, który preferuje rozwiązania logiczne i strukturalne nad pracą z CSS/designem.

</project_description>

Przeanalizuj dostarczone informacje, koncentrując się na aspektach istotnych dla tworzenia PRD. Rozważ następujące kwestie:
<prd_analysis>
1. Zidentyfikuj główny problem, który produkt ma rozwiązać.
2. Określ kluczowe funkcjonalności MVP.
3. Rozważ potencjalne historie użytkownika i ścieżki korzystania z produktu.
4. Pomyśl o kryteriach sukcesu i sposobach ich mierzenia.
5. Oceń ograniczenia projektowe i ich wpływ na rozwój produktu.
</prd_analysis>

Na podstawie analizy wygeneruj listę 10 pytań i zaleceń w formie łączonej (pytanie + zalecenie). Powinny one dotyczyć wszelkich niejasności, potencjalnych problemów lub obszarów, w których potrzeba więcej informacji, aby stworzyć skuteczny PRD. Rozważ pytania dotyczące:

1. Szczegółów problemu użytkownika
2. Priorytetyzacji funkcjonalności
3. Oczekiwanego doświadczenia użytkownika
4. Mierzalnych wskaźników sukcesu
5. Potencjalnych ryzyk i wyzwań
6. Harmonogramu i zasobów

<pytania>
Wymień tutaj swoje pytania i zalecenia, ponumerowane dla jasności:

Przykładowo:
1. Czy już od startu projektu planujesz wprowadzenie płatnych subskrypcji?

Rekomendacja: Pierwszy etap projektu może skupić się na funkcjonalnościach darmowych, aby przyciągnąć użytkowników, a płatne funkcje można wprowadzić w późniejszym etapie.
</pytania>

Kontynuuj ten proces, generując nowe pytania i rekomendacje w oparciu o odpowiedzi użytkownika, dopóki użytkownik wyraźnie nie poprosi o podsumowanie.

Pamiętaj, aby skupić się na jasności, trafności i dokładności wyników. Nie dołączaj żadnych dodatkowych komentarzy ani wyjaśnień poza określonym formatem wyjściowym.

Pracę analityczną należy przeprowadzić w bloku myślenia. Końcowe dane wyjściowe powinny składać się wyłącznie z pytań i zaleceń i nie powinny powielać ani powtarzać żadnej pracy wykonanej w sekcji prd_analysis.


Oto obiektywne podsumowanie naszej analizy, sformatowane tak, aby posłużyło jako idealny "prompt startowy" do nowej konwersacji nastawionej na generowanie MVP.
Czego się nauczyliśmy (Wnioski z analizy wykonalności)
 * Krytyczna rola struktury danych: Początkowe założenie o "pobieraniu przepisów" okazało się niewystarczające. Aby funkcja listy zakupów działała, nie możemy przechowywać składników jako prostego tekstu. Konieczne jest użycie AI na etapie "ingestii" danych (scrapingu), aby sparsować język naturalny (np. "dwie duże łyżki mąki") do formatu strukturalnego JSON (ilość, jednostka, produkt). Bez tego sumowanie składników na liście zakupów jest niemożliwe.
 * Przesunięcie ciężaru AI: AI nie służy tu tylko jako "bajer" dla użytkownika (sugerowanie zamienników), ale przede wszystkim jako narzędzie backendowe (ETL) do czyszczenia i normalizacji danych przychodzących z zewnętrznych źródeł.
 * Ograniczenie zakresu (Scope Cut): Aby dowieźć projekt w założonym czasie, musimy całkowicie zrezygnować z funkcji społecznościowych (komentarze, profile publiczne) i skupić się wyłącznie na ścieżce "Utility": Przepis -> Baza Danych -> Lista Zakupów.
 * Wyzwanie Frontendowe: Jako backendowiec, największe ryzyko opóźnień leży w warstwie UI/UX. Decyzja o użyciu gotowych bibliotek (Shadcn/UI) oraz generowaniu komponentów przez AI jest niezbędna, aby nie utknąć na pisaniu CSS.
Zaktualizowany kontekst projektu (Opis dla nowej konwersacji)
Cel projektu:
Stworzenie aplikacji webowej typu "Utility", która służy do zarządzania przepisami kulinarnymi oraz automatyzacji procesu zakupowego. Aplikacja rozwiązuje problem rozproszonych przepisów i trudności w szybkim planowaniu zakupów na podstawie wybranych dań.
Główne filary funkcjonalności:
 * Agregator i Baza Przepisów:
   * System umożliwia przeglądanie przepisów pobranych z zewnętrznych źródeł (scraping) oraz dodanych ręcznie przez użytkownika.
   * Kluczowy wymóg techniczny: Każdy przepis w bazie musi posiadać składniki zapisane w ustrukturyzowanym formacie (nie jako blok tekstu), oddzielając nazwę produktu, ilość i znormalizowaną jednostkę miary.
 * Inteligentna Lista Zakupów:
   * Użytkownik może dodać wiele przepisów do "koszyka".
   * Aplikacja automatycznie agreguje składniki z różnych przepisów (np. sumuje jajka z przepisu A i przepisu B), tworząc jedną, czytelną listę zakupów.
 * Asystent AI (Kontekst Kulinarny):
   * Funkcja "Zamienniki": Możliwość zapytania o alternatywę dla konkretnego składnika w kontekście danego przepisu (np. czym zastąpić śmietanę w zupie, a czym w deserze).
   * Funkcja "Podobne": Sugerowanie przepisów o zbliżonym profilu składników lub stylu.
Stack Technologiczny (Kontekst realizacyjny):
 * Frontend: Astro (statyczne treści) + React (interaktywna lista zakupów) + Tailwind/Shadcn (UI).
 * Backend/DB: Supabase (PostgreSQL, Auth).
 * AI Integration: Wykorzystanie LLM do normalizacji danych wejściowych (parsowanie przepisów) oraz do funkcji asystenta dla użytkownika.
Profil Twórcy:
Backend Developer (Junior/Mid) z doświadczeniem w Python/JS, który preferuje rozwiązania logiczne i strukturalne nad pracą z CSS/designem.




