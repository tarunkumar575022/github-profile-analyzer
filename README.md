# GitHub Profile Analyzer

A Node.js backend API that analyzes GitHub profiles and their public repositories to calculate insights like total stars, most used languages, and top repositories.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **External API**: GitHub REST API

## Setup Instructions

1. **Clone the repository** (if not already cloned)
   ```bash
   git clone <repository_url>
   cd github-profile-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Update the `DB_USER` and `DB_PASSWORD` to match your local MySQL credentials. Optionally, add `GITHUB_TOKEN` to avoid rate limits.*

4. **Start the Server (Auto-Migrates Database)**
   Make sure your local MySQL server is running. Then, run:
   ```bash
   npm run dev
   ```
   *Note: When you run this, the application will automatically create the `github_analyzer` database if it doesn't exist, and run all required Sequelize migrations to create the `profiles` and `repositories` tables automatically!*

## API Documentation

### 1. Analyze Profile
**Endpoint**: `POST /api/analyze/:username`
**Description**: Fetches GitHub profile and calculates insights. Updates if already exists.
**Response**:
```json
{
  "success": true,
  "message": "Profile analyzed successfully",
  "data": { "profile": { ... }, "repositories": [ ... ] }
}
```

### 2. Get All Profiles
**Endpoint**: `GET /api/profiles?page=1&limit=10`
**Description**: Returns a paginated list of analyzed profiles.

### 3. Get Single Profile
**Endpoint**: `GET /api/profiles/:username`
**Description**: Returns the profile with all its repositories.

### 4. Delete Profile
**Endpoint**: `DELETE /api/profiles/:username`
**Description**: Deletes a profile and associated repositories.

### 5. Get Profile Repositories
**Endpoint**: `GET /api/profiles/:username/repos?language=JavaScript`
**Description**: Returns repositories for a profile, ordered by stars. Can filter by language.

### 6. Get Stats
**Endpoint**: `GET /api/stats`
**Description**: Returns overall system stats (total analyzed, top user, etc.).

### 7. Compare Profiles
**Endpoint**: `GET /api/compare?users=user1,user2`
**Description**: Compares two GitHub profiles side-by-side.

## Postman Collection
A complete Postman collection is included in `postman/collection.json`. Import this file into Postman to easily test all endpoints.

## Database Schema Explanation
The database consists of two tables with a One-to-Many relationship:
- **`profiles`**: Stores user information fetched from GitHub and calculated insights like `total_stars`, `total_forks`, and a JSON structure of their `top_languages`.
- **`repositories`**: Stores all public repositories for the analyzed profiles. Includes `profile_id` as a foreign key to `profiles`.
