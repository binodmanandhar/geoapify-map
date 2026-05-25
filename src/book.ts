const bookInput = document.getElementById("book-title") as HTMLInputElement;
const suggestionsListt = document.getElementById("suggestions-book") as HTMLUListElement;

let debounceTimerr: number;
declare var L: any;
declare var marker: any;

// Debounce helper
function debouncee(fn: Function, delay: number) {
  clearTimeout(debounceTimer);
  debounceTimerr = window.setTimeout(() => fn(), delay);
}

// Autocomplete handler
async function handleAutocompletee() {
  const query = addressInput.value.trim();
  if (!query) {
    suggestionsList.innerHTML = "";
    return;
  }

  debouncee(async () => {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

    const requestOptions: RequestInit = {
      method: "GET",
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Could not fetch data!");
      }

      const data = await response.json();
      showSuggestionss(data.docs);
    } catch (err) {
      console.error(err);
    }
  }, 500);
}

function showSuggestionss(books: any[] | undefined) {
  console.log(books);
  suggestionsList.innerHTML = "";

  if (!books || books.length === 0) {
    suggestionsList.classList.remove("show");
    return; // nothing to show
  }

  suggestionsList.classList.add("show");

  books.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f.title;
    suggestionsList.appendChild(li);

    li.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Selected:", f.title);
      addressInput.value = f.title;
      suggestionsList.innerHTML = "";
      suggestionsList.classList.remove("show");
    });
  });
}

addressInput.addEventListener("input", handleAutocompletee);
