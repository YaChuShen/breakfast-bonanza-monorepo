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

  // 遊戲相關 GraphQL 查詢
  async getUser(email) {
    const query = `
      query GetUser($email: String!) {
        getUser(email: $email) {
          id
          email
          islevel2
        }
      }
    `;
    return this.query(query, { email });
  }

  async addScore(userId, score, timerStatus) {
    const mutation = `
      mutation AddScore($userId: ID!, $score: Int!, $timerStatus: String!) {
        addScore(userId: $userId, score: $score, timerStatus: $timerStatus)
      }
    `;
    return this.query(mutation, { userId, score, timerStatus });
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
}

// 導出客戶端實例
export const graphqlClient = new GraphQLClient();

// 預設使用 GraphQL 客戶端
export default graphqlClient;
