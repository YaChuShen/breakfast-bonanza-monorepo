// API 客戶端 - 用於前端調用 Express API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://breakfast-bonanza-express-api.onrender.com'
    : 'http://localhost:3002');

// GraphQL 客戶端（如果選擇 GraphQL 方案）
class GraphQLClient {
  constructor() {
    this.endpoint = `${API_BASE_URL}/graphql`;
  }

  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  async register(input) {
    const mutation = `
      mutation Register($name: String!, $email: String!, $password: String!) {
        register(name: $name, email: $email, password: $password) {
          id
          email
          name
          success
          message
          password
        }
      }
    `;
    return this.query(mutation, {
      name: input.name,
      email: input.email,
      password: input.password,
    });
  }

  async tour(profileId) {
    const mutation = `
      mutation FinishTour($profileId: ID!) {
        finishTour(profileId: $profileId)
      }
    `;
    return this.query(mutation, { profileId });
  }

  async addScore(userId, score, timerStatus) {
    const mutation = `
      mutation AddScore($userId: ID!, $score: Int!, $timerStatus: String!) {
        addScore(userId: $userId, score: $score, timerStatus: $timerStatus) {
          success
          isTopFive
          isLevel2
        }
      }
    `;
    return this.query(mutation, { userId, score, timerStatus });
  }

  // 遊戲相關 GraphQL 查詢
  async getUser(email) {
    const query = `
      query GetUser($email: String!) {
        getUser(email: $email) {
          id
          email
          islevel2
          isfinishedtour
          highest_score
          latest_score
          total_games
          total_score
          average_score
          lastplaytime
          created_at
        }
      }
    `;
    return this.query(query, { email });
  }

  async getCurrentRankings() {
    const query = `
      query GetCurrentRankings {
        getCurrentRankings {
          rank
          profileId
          name
          score
          updatedAt
        }
      }
    `;
    return this.query(query);
  }

  async getLeaderboard(limit = 10) {
    const query = `
      query GetLeaderboard($limit: Int) {
        getLeaderboard(limit: $limit) {
          rank
          profileId
          name
          score
          updatedAt
        }
      }
    `;
    return this.query(query, { limit });
  }
}

// 導出客戶端實例
export const graphqlClient = new GraphQLClient();

// 預設使用 GraphQL 客戶端
export default graphqlClient;
