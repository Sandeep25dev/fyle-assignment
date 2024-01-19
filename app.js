"use strict";

async function fetchData() {
  const res = await fetch("http://api.github.com/users/Sandeep25dev");
  const data = await res.json();
  console.log(data);
}
async function fetchRepos() {
  const res = await fetch("http://api.github.com/users/Sandeep25dev/repos");
  const data = await res.json();
  console.log(data);
}

fetchData();
fetchRepos();
