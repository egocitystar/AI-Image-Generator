// set theme based on user's system preference
const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.querySelector("#model-select");
const countSelect = document.querySelector("#count-select");
const ratioSelect = document.querySelector("#ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "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"; // hugging face api key

const examplePrompt = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
];

// set theme based on user's system preference
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();

// switch between dark and light theme
const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.round(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);

  return { width: calculatedWidth, height: calculatedHeight };
};

const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  if (!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}" class="result-img" />
                       <div class="img-overlay">
                         <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                           <i class="fa-solid fa-download"></i>
                         </a>
                       </div>`;
};

// send request to hugging face api to create images
const generateImage = async (
  selectedModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", true);

  // create an array of images generation promises
  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    // send request to the model api
    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          options: { wait_for_model: true, use_cache: false },
        }),
      });

      if (!response.ok) throw new Error((await response.json())?.error);

      const result = await response.blob();
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent =
        "Generation failed! Check console for more details.";
    }
  });

  await Promise.all(imagePromises);
  generateBtn.removeAttribute("disabled");
};

// create placeholder cards with loading spinner
const createImageCards = (
  selectedModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                                <div class="status-container">
                                  <div class="spinner"></div>
                                  <i class="fa-solid fa-triangle-exclamation"></i>
                                  <p class="status-text">Generating...</p>
                                </div>
                              </div>`;
  }
};

// handle form submission
const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
  generateImage(selectedModel, imageCount, aspectRatio, promptText);
};

// fill prompt input with a random example
promptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompt[Math.floor(Math.random() * examplePrompt.length)];
  promptInput.value = prompt;
  promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);