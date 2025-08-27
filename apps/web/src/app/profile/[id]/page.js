import admin from 'functions/admin';
import Profile from 'Components/Profile';
import { Suspense } from 'react';
import Loading from 'Components/Loading';

const Page = async ({ params }) => {
  const db = admin.firestore();

  const profileSnaps = await db.collection('users').doc(params.id).get();
  const safeData = profileSnaps.exists
    ? JSON.parse(JSON.stringify(profileSnaps.data()))
    : {};

  return (
    <Suspense fallback={<Loading />}>
      <Profile data={safeData} profileId={params.id} />
    </Suspense>
  );
};

export default Page;

export async function generateStaticParams() {
  const db = admin.firestore();
  const profileSnaps = await db.collection('users').get();

  const paths = profileSnaps.docs.map((doc) => ({
    params: { id: doc.id },
  }));

  return paths;
}
