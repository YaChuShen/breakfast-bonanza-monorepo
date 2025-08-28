import HomePageProvider from 'Components/HomePageProvider';
import { graphqlClient } from 'lib/api-client';
import NextAuthOptions from 'pages/api/auth/[...nextauth]';
const { getServerSession } = require('next-auth');

const Page = async () => {
  const userSession = await getServerSession(NextAuthOptions);

  let data;
  let profileId;

  console.log('userSession', userSession);

  // 使用 GraphQL 查詢用戶資料
  if (userSession?.user?.email) {
    try {
      const result = await graphqlClient.getUser(userSession.user.email);

      console.log('result', result);
      data = result.getUser;
      profileId = data?.id;
      console.log('GraphQL 獲取的用戶資料:', data);
    } catch (error) {
      console.error('GraphQL 查詢失敗:', error);
      // 如果 GraphQL 查詢失敗，data 和 profileId 保持 undefined
    }
  }

  return <HomePageProvider dbData={userSession} profileId={profileId} />;
};

export default Page;
