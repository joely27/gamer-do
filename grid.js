document.addEventListener('DOMContentLoaded', function() {
  const parentDiv = document.getElementById('gridContainer'); // Get the parent div

  if (parentDiv) {
    const childDivs = parentDiv.querySelectorAll('.item'); // Get all child divs
    let imagesCount = 0; // Change variable name to imagesCount
    let allImagesLoaded = false;

    for (let i = 0; i < childDivs.length; i++) {
      const childDiv = childDivs[i];
      childDiv.style.marginBottom = '20px'; // Add a 20px bottom margin to each child div

      // Check if the child div contains an image
      const image = childDiv.querySelector('img');
      if (image) {
        image.addEventListener('load', function() {
          imagesCount++; // Change variable name to imagesCount

          // Check if all images have finished loading
          if (imagesCount === childDivs.length) { // Change variable name to imagesCount
            allImagesLoaded = true;
            initializeMasonry(); // Call the function after all images have loaded
          }
        });
      } else {
        imagesCount++; // Change variable name to imagesCount

        // Check if all images have finished loading
        if (imagesCount === childDivs.length) { // Change variable name to imagesCount
          allImagesLoaded = true;
          initializeMasonry(); // Call the function if there are no images to load
        }
      }
    }

    // Use the imagesLoaded library to detect when all images have finished loading
    imagesLoaded(parentDiv, function() { // Change function name to avoid conflicts
      if (!allImagesLoaded) {
        initializeMasonry(); // Call the function after all images have loaded (additional delay)
      }
    });
  }
});

function initializeMasonry() {
  setTimeout(function() {
    const gridContainer = document.getElementById("gridContainer");
    const masonry = new Masonry(gridContainer, {
      itemSelector: ".item",
      gutter: 30, // Set the desired gap between grid items
      percentPosition: true
    });

    // Show the grid and grid items
    gridContainer.style.visibility = "visible";
    const items = document.getElementsByClassName("item");
    for (let i = 0; i < items.length; i++) {
      items[i].style.opacity = "1";
    }
  }, 1000); // Delay Masonry initialization by 1 second
}

// Your Airtable configuration and data fetching code
const base = "app1Z4C0dO7ufbxUS";
const table = "tblGBDKi3iFTW5GT2";
const apiKey = "patKNF8F1xv6adKyZ.7a5269c2c65164ef8233b6e7c3b3d9f977ae7e9e7c65182d87827db1ead9fa12";
const desiredFields = "Work,Name,Notes,Website,Category,Instagram";

// Fetch Airtable data
const dataUrl = `https://api.airtable.com/v0/${base}/${table}`;
const view = "viwZ36CXYDIDlsBBe";
const pageSize = 16;
const dataHeaders = { Authorization: `Bearer ${apiKey}` };
let offset = ""; // Initialize offset variable for pagination

function loadNextRecords() {
  const urlWithOffset = `${dataUrl}?view=${view}&offset=${offset}&limit=${pageSize}`;

  fetch(urlWithOffset, { headers: dataHeaders })
    .then(response => response.json())
    .then(data => {
      const records = data.records;

      // Generate grid items using records data
      const gridContainer = document.getElementById("gridContainer");
      const recordsList = records.map(record => {
        const fields = desiredFields.split(",").map(field => {
          const fieldValue = record.fields[field.trim()];
          return fieldValue || "";
        });
        return fields;
      });

      recordsList.forEach(recordFields => {
        const item = document.createElement("div");
        item.className = "item";

        // Fetch and add image to the item div
        const imageSrc = recordFields[0];
        if (imageSrc !== "") {
          const img = document.createElement("img");
          img.src = imageSrc.trim();
          img.style.width = "100%"; // Set the image width to 100%
          img.style.height = "auto"; // Set the image height to auto for maintaining aspect ratio
          item.appendChild(img);
        }

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        recordFields.slice(1).forEach((fieldValue, index) => {
          const fieldName = desiredFields.split(",")[index + 1].trim();
          const fieldDiv = document.createElement("div");
          fieldDiv.id = `${fieldName}`;

          fieldDiv.textContent = fieldValue;

          cardBody.appendChild(fieldDiv);

          // Add spacer div after each field
          if (index < desiredFields.split(",").length - 2) {
            const spacerDiv = document.createElement("div");
            spacerDiv.className = "spacer";
            cardBody.appendChild(spacerDiv);
          }
        });

        item.appendChild(cardBody);
        gridContainer.appendChild(item);
      });

      offset = data.offset; // Update the offset for pagination
      initializeMasonry(); // Initialize Masonry after the grid items are added to the DOM
    })
    .catch(error => console.error(error.message));
}

// Load the initial set of records
loadNextRecords();

// Add event listener for scrolling to the end of the list
window.addEventListener('scroll', function() {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

  if (scrollTop + windowHeight >= documentHeight) {
    loadNextRecords(); // Load the next set of records
  }
});
