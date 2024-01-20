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

async function fetchData() {
  const username = document.getElementById("username").value;
  try {
    const res = await fetch(`http://api.github.com/users/${username}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(err);
  }
}
async function fetchRepos() {
  const username = document.getElementById("username").value;
  try {
    const res = await fetch(`http://api.github.com/users/${username}/repos`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(err);
  }
}

userSearchSection.addEventListener("submit", async function (e) {
  e.preventDefault();
  try {
    const data = await fetchData();
    const repoData = await fetchRepos();
    console.log(data);
    if (data.message !== "Not Found") {
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
      reposSection.innerHTML = repoData
        .map(
          (el) =>
            `<div class="repo-box">
        <h2>${el.name}</h2>
        <p>${el.description === null ? "No Description" : el.description}</p>
        <div class="topics">
        ${el.topics
          .map((topic) => `<span class="topic">${topic}</span>`)
          .join("")}
        </div>
      </div>`
        )
        .join("");
    }
  } catch (err) {
    throw new Error(err);
  }
});
