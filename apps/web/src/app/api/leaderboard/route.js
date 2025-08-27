import admin from 'functions/admin';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NextAuthOptions } from 'pages/api/auth/[...nextauth]';

export async function POST(request) {
  try {
    const { profileId, score, name, timerStatus, timestamp, newLeaderboard } =
      await request.json();
    const timeDiff = Date.now() - timestamp;

    if (timerStatus !== 'end' && timeDiff > 5000) {
      return NextResponse.json(
        {
          status: 400,
          error: 'Suspicious game duration',
        },
        { status: 400 }
      );
    }

    const session = await getServerSession(NextAuthOptions);
    const realtimeDb = admin.database();
    const db = admin.firestore();

    if (profileId && session) {
      await db.collection('leaderboard').doc(profileId).set({
        score,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        profileId,
        name,
      });

      await realtimeDb.ref('rankings').set(newLeaderboard);

      return NextResponse.json({
        status: 200,
        newLeaderboard,
      });
    }
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      {
        status: 500,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
