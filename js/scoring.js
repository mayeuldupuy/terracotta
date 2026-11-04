
import { profiles } from "../data/profiles.js";

import {
    scoringMatrix,
    scoringDimensions
} from "../data/scoring-matrix.js";

// TERRACOTTA — MOTEUR DE SCORING V2

const MAX_POINTS_PER_QUESTION = 3;

// Écart maximal autorisé entre le profil principal
// et le profil secondaire, sur une échelle de 100.

export const SECONDARY_PROFILE_MAX_GAP = 8;

// CALCUL DU PROFIL

export function calculateProfile(answers) {

    const profileScores = profiles.map(profile => {

        // CALCUL DES DIMENSIONS

        const dimensions = scoringDimensions.map(dimension => {

            const answeredQuestions =
                dimension.questionIds.filter(id =>
                    Array.isArray(answers[id]) &&
                    answers[id].length > 0
                );

            let earned = 0;

            for (const questionId of answeredQuestions) {

                const selected = answers[questionId];

                const questionPoints = selected.reduce(
                    (sum, answerId) =>
                        sum + (
                            scoringMatrix[answerId]?.[profile.id] || 0
                        ),
                    0
                );

                earned += Math.min(
                    MAX_POINTS_PER_QUESTION,
                    questionPoints
                );
            }

            const possible =
                answeredQuestions.length *
                MAX_POINTS_PER_QUESTION;

            const normalized = possible
                ? earned / possible
                : null;

            return {
                id: dimension.id,
                label: dimension.label,
                weight: dimension.weight,
                normalized,
                earned,
                possible
            };
        });

        // CALCUL DU SCORE GLOBAL PONDÉRÉ

        const activeWeight = dimensions.reduce(
            (sum, dimension) =>
                sum + (
                    dimension.normalized === null
                        ? 0
                        : dimension.weight
                ),
            0
        );

        const score = activeWeight
            ? 100 * dimensions.reduce(
                (sum, dimension) =>
                    sum +
                    (dimension.normalized ?? 0) *
                    dimension.weight,
                0
            ) / activeWeight
            : 0;

        return {
            ...profile,
            score: Number(score.toFixed(2)),
            dimensions
        };
    });

    // CLASSEMENT DES 8 PROFILS

    profileScores.sort(
        (a, b) =>
            b.score - a.score ||
            a.id.localeCompare(b.id)
    );

    const first = profileScores[0];

    // DÉTECTION DES EX ÆQUO

    const tied = profileScores.filter(
        item =>
            Math.abs(item.score - first.score) < 0.00001
    );

    // IDENTIFICATION DU PROFIL SECONDAIRE

    const next = profileScores.find(
        item =>
            item.score < first.score - 0.00001
    );

    const secondary =
        tied.length === 1 &&
        next &&
        first.score - next.score <= SECONDARY_PROFILE_MAX_GAP
            ? next
            : null;

    // RÉSULTAT FINAL

    return {
        primary: tied.length === 1
            ? first
            : null,

        tiedProfiles: tied.length > 1
            ? tied
            : [],

        secondary,

        ranking: profileScores,

        // PRÉFÉRENCES DU QUESTIONNAIRE V2
        // Ces réponses serviront au futur moteur
        // de recommandations personnalisées.

        preferences: {

            // Q3 — Activités qui attirent l'utilisateur
            activities: answers["Q3"] || [],

            // Q6 — Activités déjà pratiquées
            practicedActivities: answers["Q6"] || [],

            // Q7 — Durée souhaitée
            duration: answers["Q7"] || [],

            // Q8 — Type d'accompagnement
            guidance: answers["Q8"] || [],

            // Q9 — Équipement disponible
            equipment: answers["Q9"] || [],

            // Q10 — Budget envisagé
            budget: answers["Q10"] || []
        }
    };
}
