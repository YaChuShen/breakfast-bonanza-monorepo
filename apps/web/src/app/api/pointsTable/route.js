import admin from 'functions/admin';
import { NextResponse } from 'next/server';
import { LEVEL2_SCORE } from 'contents/rules';
import { getServerSession } from 'next-auth';
import { NextAuthOptions } from 'pages/api/auth/[...nextauth]';

export async function POST(request) {
  const { profileId, score, timerStatus } = await request?.json();
  const db = admin.firestore();

  if (timerStatus !== 'end') {
    return NextResponse.json(
      {
        status: 400,
        error: 'Suspicious game duration',
      },
      { status: 400 }
    );
  }

  const session = await getServerSession(NextAuthOptions);

  if (profileId && session) {
    try {
      let isLevel2 = false;
      const userDocumentSnapshot = await db
        .collection('users')
        .doc(profileId)
        .get();

      if (userDocumentSnapshot.exists) {
        const userData = userDocumentSnapshot.data();
        isLevel2 = userData.isLevel2 || score >= LEVEL2_SCORE;
      } else {
        console.log(`No document found for profileId: ${profileId}`);
      }

      const newScoreRecord = {
        score: score,
        time: Date.now(),
      };

      await db
        .collection('users')
        .doc(profileId)
        .update({
          score: admin.firestore.FieldValue.arrayUnion(newScoreRecord),
          lastPlayTime: admin.firestore.FieldValue.serverTimestamp(),
          isLevel2,
        });
      return NextResponse.json({
        status: 200,
      });
    } catch (e) {
      console.error('Error fetching user data:', e);
      return NextResponse.json(
        {
          message: 'Error fetching user data',
        },
        {
          status: 400,
        }
      );
    }
  } else {
    return NextResponse.json({
      status: 401,
      message: 'No profileId',
    });
  }
}
