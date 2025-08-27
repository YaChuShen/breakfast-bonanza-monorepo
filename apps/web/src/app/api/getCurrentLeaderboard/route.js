import admin from 'functions/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const realtimeDb = admin.database();
    const rankingsSnapshot = await realtimeDb.ref('rankings').once('value');
    const currentRankings = rankingsSnapshot.val() || [];
    return NextResponse.json(currentRankings);
  } catch (error) {
    console.error('Error fetching current leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
