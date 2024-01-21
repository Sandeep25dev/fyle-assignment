"use strict";

const apiUrl = "https://api.github.com";
const userSearchSection = document.querySelector(".user-search-section");
const container = document.querySelector(".container");
const profilePic = document.getElementById("profile-pic");
const repoLink = document.getElementById("repo-link");
const name = document.getElementById("name");
const bio = document.getElementById("bio");
const userLocation = document.getElementById("location");
const twitter = document.getElementById("twitter");
const reposSection = document.querySelector(".repos-section");
let currentPage = 1;
let repositoriesPerPage = 10;
let lastPage = 1;

async function fetchData() {
  const username = document.getElementById("username").value;
  try {
    const res = await fetch(`http://api.github.com/users/${username}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

userSearchSection.addEventListener("submit", async function (e) {
  e.preventDefault();
  try {
    const data = await fetchData();
    getRepositories();
    console.log(data);
    container.classList.remove("disable");
    profilePic.src = data.avatar_url;
    repoLink.href = data.html_url;
    repoLink.innerHTML = `<span>
      <i class="fa-solid fa-link"></i>
    </span>
    ${data.html_url}`;
    name.textContent = data.name;
    bio.textContent = data.bio;
    userLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i>
      ${data.location}`;
    twitter.innerHTML = `<strong>Twitter: </strong>${
      data.twitter_username === null
        ? "User doesn't have twitter handle"
        : data.twitter_username
    }`;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

function getRepositories() {
  const username = document.getElementById("username").value;
  const repositoriesContainer = document.getElementById("repositories");
  const loader = document.getElementById("loader");

  repositoriesContainer.innerHTML = "";
  loader.style.display = "block";

  fetch(
    `${apiUrl}/users/${username}/repos?per_page=${repositoriesPerPage}&page=${currentPage}`
  )
    .then((response) => {
      const linkHeader = response.headers.get("Link");
      console.log("linkheader", linkHeader);
      if (linkHeader) {
        const links = parseLinkHeader(linkHeader);
        console.log("links", links);
        lastPage = links.last ? links.last : links.prev + 1;
      }
      return { repositories: response.json() };
    })
    .then((data) => {
      loader.style.display = "none";

      data.repositories.then((repositories) => {
        repositories.forEach((repo) => {
          const repositoryElement = document.createElement("div");
          repositoryElement.classList.add("repository");
          repositoryElement.innerHTML = `
                                  <h2>${repo.name}</h2>
                                  <p>${
                                    repo.description ||
                                    "No description available"
                                  }</p>
                                  <p>Language: ${repo.language || "N/A"}</p>
                                  <div class="topics">
                                  ${repo.topics
                                    .map(
                                      (topic) =>
                                        `<span class="topic">${topic}</span>`
                                    )
                                    .join("")}
                                  </div>
                              `;
          repositoriesContainer.appendChild(repositoryElement);
        });

        // Display pagination
        displayPagination();
      });
    })
    .catch((error) => {
      loader.style.display = "none";
      repositoriesContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

function displayPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.textContent = "Prev";
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      getRepositories();
    }
  };
  paginationContainer.appendChild(prevButton);

  // Display dynamic range of pages
  const startPage = Math.max(1, currentPage - 3);
  const endPage = Math.min(lastPage, currentPage + 3);

  console.log("start, end", startPage, endPage);

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.onclick = () => {
      currentPage = i;
      getRepositories();
    };
    if (i === currentPage) {
      button.classList.add("active");
    }
    paginationContainer.appendChild(button);
  }

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.onclick = () => {
    if (currentPage < lastPage) {
      currentPage++;
      getRepositories();
    }
  };
  paginationContainer.appendChild(nextButton);

  // Disable Prev button on the first page
  prevButton.disabled = currentPage === 1;

  // Disable Next button on the last page
  nextButton.disabled = currentPage === lastPage;
}

// Function to parse the Link header
function parseLinkHeader(header) {
  const links = {};
  header.split(",").forEach((part) => {
    const section = part.split(";");
    if (section.length !== 2) {
      throw new Error("Section could not be split on ';'");
    }
    const url = section[0].replace(/<(.*)>/, "$1").trim();
    const name = section[1].replace(/rel="(.*)"/, "$1").trim();
    links[name] = parseInt(url.match(/&page=(\d+)/)[1]);
  });
  return links;
}
