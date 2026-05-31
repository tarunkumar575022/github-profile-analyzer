const { Profile, Repository } = require('../models');
const githubService = require('../services/githubService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// 1. POST /api/analyze/:username
exports.analyzeProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Check if recently analyzed (cache check within last 1 hour)
    let profile = await Profile.findOne({ where: { username } });
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (profile && profile.last_analyzed_at > oneHourAgo) {
      // Return cached data
      const repos = await Repository.findAll({ where: { profile_id: profile.id } });
      return res.status(200).json({
        success: true,
        message: 'Returned cached profile data',
        data: {
          profile,
          repositories: repos
        }
      });
    }

    // Fetch from GitHub
    const githubData = await githubService.fetchProfileData(username);
    const reposData = await githubService.fetchRepositories(username);
    
    // Analyze repos
    const insights = githubService.analyzeRepositories(reposData);
    
    // Begin transaction for safety
    const transaction = await sequelize.transaction();
    
    try {
      const profileData = {
        username: githubData.login,
        name: githubData.name,
        bio: githubData.bio,
        avatar_url: githubData.avatar_url,
        github_url: githubData.html_url,
        public_repos: githubData.public_repos,
        followers: githubData.followers,
        following: githubData.following,
        account_created_at: githubData.created_at,
        last_analyzed_at: new Date(),
        total_stars: insights.total_stars,
        total_forks: insights.total_forks,
        most_used_language: insights.most_used_language,
        top_languages: insights.top_languages,
        top_repo_name: insights.top_repo_name,
        top_repo_stars: insights.top_repo_stars
      };

      if (profile) {
        // Update existing profile
        await profile.update(profileData, { transaction });
        
        // Remove old repos
        await Repository.destroy({ where: { profile_id: profile.id }, transaction });
      } else {
        // Create new profile
        profile = await Profile.create(profileData, { transaction });
      }

      // Prepare repos data
      const repositories = reposData.map(repo => ({
        profile_id: profile.id,
        repo_name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        is_forked: repo.fork,
        repo_url: repo.html_url
      }));

      // Bulk create repos
      const createdRepos = await Repository.bulkCreate(repositories, { transaction });
      
      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Profile analyzed successfully',
        data: {
          profile,
          repositories: createdRepos
        }
      });

    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

  } catch (error) {
    if (error.message === 'GitHub user not found') {
      return res.status(404).json({ success: false, message: 'GitHub user not found' });
    }
    if (error.message === 'GitHub API rate limit exceeded') {
      return res.status(429).json({ success: false, message: 'GitHub API rate limit exceeded' });
    }
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// 2. GET /api/profiles
exports.getProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Profile.findAndCountAll({
      attributes: ['username', 'name', 'public_repos', 'followers', 'total_stars', 'most_used_language', 'last_analyzed_at'],
      order: [['last_analyzed_at', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      message: 'Profiles fetched successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database connection error or query failed' });
  }
};

// 3. GET /api/profiles/:username
exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await Profile.findOne({
      where: { username },
      include: [{ model: Repository, as: 'repositories' }]
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile details fetched successfully',
      data: profile
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database connection error or query failed' });
  }
};

// 4. DELETE /api/profiles/:username
exports.deleteProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await Profile.findOne({ where: { username } });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    await profile.destroy(); // Associations CASCADE will handle repos if configured in DB, but Sequelize handles it in hooks if setup or directly in query

    return res.status(200).json({
      success: true,
      message: 'Profile and associated repositories deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database connection error or query failed' });
  }
};

// 5. GET /api/profiles/:username/repos
exports.getProfileRepos = async (req, res) => {
  try {
    const { username } = req.params;
    const { language } = req.query;

    const profile = await Profile.findOne({ where: { username } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const whereClause = { profile_id: profile.id };
    if (language) {
      whereClause.language = language;
    }

    const repos = await Repository.findAll({
      where: whereClause,
      order: [['stars', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Repositories fetched successfully',
      data: repos
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database connection error or query failed' });
  }
};

// 6. GET /api/stats
exports.getStats = async (req, res) => {
  try {
    const totalProfiles = await Profile.count();
    
    const maxStarsProfile = await Profile.findOne({
      order: [['total_stars', 'DESC']]
    });

    const avgFollowersQuery = await Profile.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('followers')), 'avgFollowers']]
    });
    
    const avgReposQuery = await Profile.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('public_repos')), 'avgRepos']]
    });

    // To find most analyzed language across all profiles
    const profiles = await Profile.findAll({ attributes: ['most_used_language'] });
    const langCounts = {};
    profiles.forEach(p => {
      if (p.most_used_language) {
        langCounts[p.most_used_language] = (langCounts[p.most_used_language] || 0) + 1;
      }
    });
    
    let topLang = null;
    let topLangCount = 0;
    for (const [lang, count] of Object.entries(langCounts)) {
      if (count > topLangCount) {
        topLangCount = count;
        topLang = lang;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Platform stats fetched successfully',
      data: {
        total_profiles_analyzed: totalProfiles,
        most_analyzed_language: topLang,
        top_github_user: maxStarsProfile ? maxStarsProfile.username : null,
        average_followers: avgFollowersQuery[0] ? parseFloat(avgFollowersQuery[0].dataValues.avgFollowers).toFixed(2) : 0,
        average_repos: avgReposQuery[0] ? parseFloat(avgReposQuery[0].dataValues.avgRepos).toFixed(2) : 0
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database connection error or query failed' });
  }
};

// 7. GET /api/compare?users=user1,user2
exports.compareProfiles = async (req, res) => {
  try {
    const { users } = req.query;
    if (!users) {
      return res.status(400).json({ success: false, message: 'Users query parameter is required. Example: ?users=user1,user2' });
    }

    const usernames = users.split(',').map(u => u.trim());
    if (usernames.length !== 2) {
      return res.status(400).json({ success: false, message: 'Please provide exactly two usernames to compare' });
    }

    const profiles = await Profile.findAll({
      where: {
        username: {
          [Op.in]: usernames
        }
      }
    });

    if (profiles.length < 2) {
      return res.status(404).json({ success: false, message: 'One or both profiles not found in database. Please analyze them first.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profiles compared successfully',
      data: profiles
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database connection error or query failed' });
  }
};
