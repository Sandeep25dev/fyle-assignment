"use strict";

const userSearchSection = document.querySelector(".user-search-section");
const container = document.querySelector(".container");
const profilePic = document.getElementById("profile-pic");
const repoLink = document.getElementById("repo-link");
const name = document.getElementById("name");
const bio = document.getElementById("bio");
const userLocation = document.getElementById("location");
const twitter = document.getElementById("twitter");
const reposSection = document.querySelector(".repos-section");
const loader2 = document.getElementById("loader2");
const apiUrl = "https://api.github.com";
let repositoriesPerPage = 10;
let lastPage = 1;

const pagesCount = {
  repositoriesPerPage: 10,
  lastPage: 1,
  currentPage: 1,
};

async function fetchData(username) {
  try {
    const res = await fetch(`${apiUrl}/users/${username}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(err);
  }
}

userSearchSection.addEventListener("submit", async function (e) {
  const pageSize = document.getElementById("pageSize").value;
  pagesCount.repositoriesPerPage = pageSize;
  pagesCount.lastPage = 1;
  pagesCount.currentPage = 1;
  const username = document.getElementById("username").value;
  e.preventDefault();
  try {
    loader2.style.display = "block";
    const data = await fetchData(username);
    loader2.style.display = "none";
    if (data.id) {
      getRepositories();
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
    } else {
      alert(`username ${username.value} does not exist!`);
    }
  } catch (err) {
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
    `${apiUrl}/users/${username}/repos?per_page=${pagesCount.repositoriesPerPage}&page=${pagesCount.currentPage}`
  )
    .then((response) => {
      const linkHeader = response.headers.get("Link");
      if (linkHeader) {
        const links = parseLinkHeader(linkHeader);
        pagesCount.lastPage = links.last ? links.last : links.prev + 1;
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
  prevButton.classList.add("prev-btn");
  prevButton.textContent = "Prev";
  prevButton.onclick = () => {
    if (pagesCount.currentPage > 1) {
      pagesCount.currentPage--;
      getRepositories();
    }
  };
  paginationContainer.appendChild(prevButton);

  const startPage = Math.max(1, pagesCount.currentPage - 3);
  const endPage = Math.min(pagesCount.lastPage, pagesCount.currentPage + 3);

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.onclick = () => {
      pagesCount.currentPage = i;
      getRepositories();
    };
    if (i === pagesCount.currentPage) {
      button.classList.add("active");
    }
    paginationContainer.appendChild(button);
  }

  const nextButton = document.createElement("button");
  nextButton.classList.add("next-btn");
  nextButton.textContent = "Next";
  nextButton.onclick = () => {
    if (pagesCount.currentPage < pagesCount.lastPage) {
      pagesCount.currentPage++;
      getRepositories();
    }
  };
  paginationContainer.appendChild(nextButton);

  prevButton.disabled = pagesCount.currentPage === 1;

  nextButton.disabled = pagesCount.currentPage === pagesCount.lastPage;
}

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
