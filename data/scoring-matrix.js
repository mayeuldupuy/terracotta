// TERRACOTTA — Transcription de la matrice V1.0
// Ordre des colonnes : P1 P2 P3 P4 P5 P6 P7 P8
// Les réponses non listées sont hors scoring.
const rows = {
  'Q1.1': {
    A:[3,0,0,2,0,1,1,0], B:[1,3,0,1,0,0,0,1],
    C:[0,0,0,3,1,1,3,1], D:[0,0,1,1,3,0,2,0],
    E:[1,3,0,2,0,1,1,1], F:[1,1,0,1,0,0,0,3],
    G:[1,1,1,1,0,0,0,1]
  },
  'Q1.2': {
    A:[1,2,0,2,1,0,1,1], B:[1,2,2,1,1,1,0,0],
    C:[0,0,1,1,3,1,2,0], D:[3,0,0,3,0,1,1,0],
    E:[0,1,0,0,0,0,0,3]
  },
  'Q2.1': {
    A:[1,1,0,3,0,0,2,0], B:[0,0,2,1,3,0,2,0],
    C:[2,0,0,1,0,3,1,0], D:[2,0,0,1,1,3,1,2],
    E:[0,1,0,0,0,0,0,3], F:[0,3,0,1,0,1,1,0],
    G:[1,3,0,1,0,0,0,1]
  },
  'Q3.1': {
    A:[3,2,1,0,0,1,0,1], B:[2,0,2,2,1,2,1,0],
    C:[0,0,1,1,3,1,2,0], D:[0,0,0,1,3,0,3,0],
    E:[1,1,1,2,1,1,1,1]
  },
  'Q5.1': {
    A:[3,0,0,0,0,0,0,0], B:[2,1,2,0,0,0,0,0],
    C:[1,0,3,0,0,0,0,0], D:[0,0,1,1,1,1,1,0],
    E:[0,0,0,1,2,0,3,0]
  },
  'Q5.2': {
    A:[3,1,0,1,0,1,0,0], B:[2,1,1,2,0,1,0,1],
    C:[0,1,0,2,1,2,1,1], D:[0,0,0,2,2,2,3,0],
    E:[0,0,0,1,1,1,3,0]
  },
  'Q6.1': {
    A:[3,0,0,1,0,2,0,0], B:[1,0,0,1,0,3,2,0],
    C:[0,0,3,0,1,0,0,0], D:[0,0,1,1,3,1,2,0],
    E:[2,0,0,1,0,3,1,0], F:[1,1,0,3,0,1,2,0],
    G:[0,1,0,0,0,0,0,3], H:[0,3,0,1,0,0,0,1]
  }
};

export const PROFILE_IDS = ['P1','P2','P3','P4','P5','P6','P7','P8'];
export const scoringMatrix = Object.fromEntries(
  Object.entries(rows).flatMap(([questionId, options]) =>
    Object.entries(options).map(([code, scores]) => [
      `${questionId}-${code}`,
      Object.fromEntries(PROFILE_IDS.map((id, index) => [id, scores[index]]))
    ])
  )
);

// Les pondérations et groupes correspondent à la synthèse V1.0.
export const scoringDimensions = [
  {id:'motivation',label:'Motivation',weight:0.30,questionIds:['Q1.1','Q1.2']},
  {id:'experience_recherchee',label:'Expérience recherchée',weight:0.25,questionIds:['Q2.1','Q6.1']},
  {id:'effort',label:'Rapport à l’effort',weight:0.20,questionIds:['Q3.1']},
  {id:'autonomie',label:'Expérience et autonomie',weight:0.25,questionIds:['Q5.1','Q5.2']}
];
