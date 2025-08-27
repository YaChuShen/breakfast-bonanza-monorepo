import { TOP_RANKINGS } from 'contents/rules';

const calculateRanking = (score, currentLeaderboard, profileId, name) => {
  const lowestTopScore =
    currentLeaderboard.length >= TOP_RANKINGS
      ? currentLeaderboard[currentLeaderboard.length - 1].score
      : 0;

  const isTopFive =
    score > lowestTopScore || currentLeaderboard.length < TOP_RANKINGS;

  if (profileId) {
    if (isTopFive) {
      let newRankings = [...currentLeaderboard];

      newRankings.push({ profileId, score, name });

      newRankings = newRankings
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_RANKINGS)
        .map((rank, index) => ({
          ...rank,
          rank: index + 1,
        }));

      return {
        newLeaderboard: newRankings,
        isTopFive,
      };
    }

    return {
      newLeaderboard: currentLeaderboard,
      isTopFive,
    };
  } else {
    return {
      newLeaderboard: currentLeaderboard,
      isTopFive,
    };
  }
};

export default calculateRanking;
