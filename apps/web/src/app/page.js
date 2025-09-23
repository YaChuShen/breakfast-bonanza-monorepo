import HomePageProvider from 'Components/HomePageProvider';
import { graphqlClient } from 'lib/api-client';
import { NextAuthOptions } from 'pages/api/auth/[...nextauth]';
const { getServerSession } = require('next-auth');

const Page = async () => {
  const userSession = await getServerSession(NextAuthOptions);

  let data;
  let profileId;
  // 使用 GraphQL 查詢用戶資料
  if (userSession?.user?.email) {
    try {
      const result = await graphqlClient.getUser(userSession.user.email);
      data = result.getUser;
      profileId = data?.id;

      if (!profileId) {
        console.warn('警告: profileId 為空，用戶可能未在資料庫中註冊');
      }
    } catch (error) {
      console.error('GraphQL 查詢失敗:', error);
      console.error('錯誤詳情:', error.message);
      // 如果 GraphQL 查詢失敗，data 和 profileId 保持 undefined
    }
  } else {
    console.log('沒有用戶會話或電子郵件');
  }

  return <HomePageProvider dbData={userSession} profileId={profileId} />;
};

export default Page;
