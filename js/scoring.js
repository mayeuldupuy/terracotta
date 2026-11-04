import { profiles } from '../data/profiles.js';
import { scoringMatrix, scoringDimensions } from '../data/scoring-matrix.js';

const MAX_POINTS_PER_QUESTION = 3;
// Hypothèse technique configurable : le document ne fixe pas le seuil.
export const SECONDARY_PROFILE_MAX_GAP = 8;

export function calculateProfile(answers) {
  const profileScores = profiles.map(profile => {
    const dimensions = scoringDimensions.map(dimension => {
      const answeredQuestions = dimension.questionIds.filter(id =>
        Array.isArray(answers[id]) && answers[id].length > 0
      );
      let earned = 0;

      for (const questionId of answeredQuestions) {
        const selected = answers[questionId];
        const questionPoints = selected.reduce((sum, answerId) =>
          sum + (scoringMatrix[answerId]?.[profile.id] || 0), 0
        );
        earned += Math.min(MAX_POINTS_PER_QUESTION, questionPoints);
      }

      const possible = answeredQuestions.length * MAX_POINTS_PER_QUESTION;
      const normalized = possible ? earned / possible : null;
      return {
        id: dimension.id,
        label: dimension.label,
        weight: dimension.weight,
        normalized,
        earned,
        possible
      };
    });

    const activeWeight = dimensions.reduce((sum, dimension) =>
      sum + (dimension.normalized === null ? 0 : dimension.weight), 0
    );
    const score = activeWeight
      ? 100 * dimensions.reduce((sum, dimension) =>
          sum + (dimension.normalized ?? 0) * dimension.weight, 0
        ) / activeWeight
      : 0;

    return { ...profile, score: Number(score.toFixed(2)), dimensions };
  });

  profileScores.sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));

  const first = profileScores[0];
  const tied = profileScores.filter(item =>
    Math.abs(item.score - first.score) < 0.00001
  );
  const next = profileScores.find(item => item.score < first.score - 0.00001);
  const secondary = tied.length === 1 && next &&
    first.score - next.score <= SECONDARY_PROFILE_MAX_GAP
      ? next
      : null;

  return {
    primary: tied.length === 1 ? first : null,
    tiedProfiles: tied.length > 1 ? tied : [],
    secondary,
    ranking: profileScores,
    // Hors scoring : conservées pour le futur moteur de recommandations.
    preferences: {
      activities: answers['Q4.1'] || [],
      discovery: answers['Q4.2'] || [],
      fitness: answers['Q5.3'] || [],
      practicedActivities: answers['Q5.4'] || [],
      duration: answers['Q6.2'] || [],
      guidance: answers['Q6.3'] || [],
      equipment: answers['Q6.4'] || [],
      budget: answers['Q6.5'] || []
    }
  };
}
