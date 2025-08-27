import admin from 'functions/admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { profileId, publicURL } = await request?.json();
  const db = admin.firestore();
  try {
    await db
      .collection('users')
      .doc(profileId)
      .update({
        avatar: publicURL || '',
      });
    return NextResponse.json({
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: '',
      },
      {
        status: 400,
      }
    );
  }
}
