import HomePageProvider from 'Components/HomePageProvider';
import { graphqlClient } from 'lib/api-client';
import { NextAuthOptions } from 'pages/api/auth/[...nextauth]';
const { getServerSession } = require('next-auth');

const Page = async () => {
  const userSession = await getServerSession(NextAuthOptions);
  let data;
  let profileId;
  if (userSession?.user?.email) {
    try {
      const result = await graphqlClient.getUser(userSession.user.email);
      data = result.getUser;
      profileId = data?.id;

      if (!profileId) {
        console.warn(
          'warning: profileId is empty, user may not be registered in the database'
        );
      }
    } catch (error) {
      console.error('error details:', error.message);
    }
  } else {
    console.log('沒有用戶會話或電子郵件');
  }

  return <HomePageProvider dbData={data} profileId={profileId} />;
};

export default Page;
