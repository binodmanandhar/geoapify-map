const form = document.querySelector("form") as HTMLFormElement;

//https://myprojects.geoapify.com/api/rKlki5WxSmylTWeJ7mC2/statistics
const GEOAPIFY_API_KEY = "388f37c795e54f8ba9acf0dabcae24b3";
const addressInput = document.getElementById("address") as HTMLInputElement;
const suggestionsList = document.getElementById("suggestions") as HTMLUListElement;

let debounceTimer: number;
declare var L: any;
declare var marker: any;

function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredAddress = addressInput.value;

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(enteredAddress)}&apiKey=${GEOAPIFY_API_KEY}`;

  const requestOptions: RequestInit = {
    method: "GET",
  };

  // send this to Geoapify API
  fetch(url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not fetch location!");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      const { lat, lon } = data.features[0].properties;
      console.log("Coordinates:", lat, lon);
      const map = L.map("map").setView([lat, lon], 12); // Sydney
      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
        {
          maxZoom: 20,
        },
      ).addTo(map);
      const marker = L.marker([lat, lon]).addTo(map);
      marker.bindPopup("Selected location");
      map.setView([lat, lon], 16);
    })
    .catch((err) => {
      console.error(err);
    });
}

// Debounce helper
function debounce(fn: Function, delay: number) {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => fn(), delay);
}

// Autocomplete handler
async function handleAutocomplete() {
  const query = addressInput.value.trim();
  if (!query) {
    suggestionsList.innerHTML = "";
    return;
  }

  console.log("Query:", query);

  debounce(async () => {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      query,
    )}&limit=5&format=json&apiKey=${GEOAPIFY_API_KEY}`;

    const requestOptions: RequestInit = {
      method: "GET",
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error("Could not fetch data!");
      }

      const data = await response.json();
      showSuggestions(data.results);
    } catch (err) {
      console.error(err);
    }
  }, 500);
}

// Render suggestions
function showSuggestions(features: any[] | undefined) {
  suggestionsList.innerHTML = "";

  console.log(features);

  if (!features || features.length === 0) {
    suggestionsList.classList.remove("show");
    return; // nothing to show
  }

  suggestionsList.classList.add("show");

  features.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f.formatted;
    suggestionsList.appendChild(li);

    li.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Selected:", f.formatted);
      addressInput.value = f.formatted;
      suggestionsList.innerHTML = "";
      suggestionsList.classList.remove("show");
      searchAddressHandler(e);
    });
  });
}

addressInput.addEventListener("input", handleAutocomplete);
