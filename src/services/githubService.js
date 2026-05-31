const axios = require('axios');

const getHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

const fetchProfileData = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('GitHub user not found');
    }
    if (error.response && error.response.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw error;
  }
};

const fetchRepositories = async (username) => {
  try {
    let allRepos = [];
    let page = 1;
    let hasMore = true;

    // GitHub allows max 100 per page. For large accounts, might need pagination, but instructions just said ?per_page=100
    // We will just fetch the first page of 100 for simplicity as requested: "GET https://api.github.com/users/{username}/repos?per_page=100"
    const response = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

const analyzeRepositories = (repos) => {
  let totalStars = 0;
  let totalForks = 0;
  const languageCounts = {};
  let topRepo = null;
  let maxStars = -1;

  repos.forEach(repo => {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;

    // Track language
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }

    // Track top repo by stars
    if (repo.stargazers_count > maxStars) {
      maxStars = repo.stargazers_count;
      topRepo = repo;
    }
  });

  // Calculate most used language
  let mostUsedLanguage = null;
  let maxLangCount = 0;
  
  // Create sorted languages array for top 5 JSON
  const sortedLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => ({ language: entry[0], count: entry[1] }));

  if (sortedLanguages.length > 0) {
    mostUsedLanguage = sortedLanguages[0].language;
  }

  const topLanguages = sortedLanguages.slice(0, 5);

  return {
    total_stars: totalStars,
    total_forks: totalForks,
    most_used_language: mostUsedLanguage,
    top_languages: topLanguages,
    top_repo_name: topRepo ? topRepo.name : null,
    top_repo_stars: topRepo ? topRepo.stargazers_count : 0
  };
};

module.exports = {
  fetchProfileData,
  fetchRepositories,
  analyzeRepositories
};
