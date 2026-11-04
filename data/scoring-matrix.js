// TERRACOTTA — Matrice de scoring V2 (pondérations proposées).
// Profils dans l'ordre P1 à P8 ; Q3 et Q6 à Q10 sont hors scoring.
const rows = {
  "Q1": {
    "A": [
      2,
      1,
      0,
      3,
      0,
      1,
      2,
      0
    ],
    "B": [
      1,
      3,
      0,
      1,
      0,
      0,
      0,
      1
    ],
    "C": [
      0,
      0,
      0,
      3,
      1,
      1,
      3,
      1
    ],
    "D": [
      0,
      0,
      1,
      1,
      3,
      0,
      2,
      0
    ],
    "E": [
      1,
      1,
      0,
      1,
      0,
      0,
      0,
      3
    ],
    "F": [
      1,
      3,
      0,
      1,
      0,
      0,
      0,
      1
    ]
  },
  "Q2": {
    "A": [
      1,
      2,
      0,
      2,
      1,
      0,
      1,
      1
    ],
    "B": [
      1,
      2,
      2,
      1,
      1,
      1,
      0,
      0
    ],
    "C": [
      0,
      0,
      1,
      1,
      3,
      1,
      2,
      0
    ],
    "D": [
      3,
      0,
      0,
      3,
      0,
      1,
      1,
      0
    ],
    "E": [
      2,
      0,
      0,
      1,
      0,
      3,
      1,
      0
    ],
    "F": [
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      3
    ]
  },
  "Q4": {
    "A": [
      3,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "B": [
      2,
      1,
      2,
      0,
      0,
      0,
      0,
      0
    ],
    "C": [
      1,
      0,
      3,
      0,
      0,
      0,
      0,
      0
    ],
    "D": [
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      0
    ],
    "E": [
      0,
      0,
      0,
      1,
      2,
      0,
      3,
      0
    ]
  },
  "Q5": {
    "A": [
      3,
      1,
      0,
      1,
      0,
      1,
      0,
      0
    ],
    "B": [
      2,
      1,
      1,
      2,
      0,
      1,
      0,
      1
    ],
    "C": [
      0,
      1,
      0,
      2,
      1,
      2,
      1,
      1
    ],
    "D": [
      0,
      0,
      0,
      2,
      2,
      2,
      3,
      0
    ],
    "E": [
      0,
      0,
      0,
      1,
      1,
      1,
      3,
      0
    ]
  }
};
export const PROFILE_IDS = ["P1","P2","P3","P4","P5","P6","P7","P8"];
export const scoringMatrix = Object.fromEntries(
  Object.entries(rows).flatMap(([questionId, options]) =>
    Object.entries(options).map(([code, scores]) => [
      `${questionId}-${code}`,
      Object.fromEntries(PROFILE_IDS.map((id, index) => [id, scores[index]]))
    ])
  )
);
export const scoringDimensions = [
  { id:"motivation", label:"Motivations", weight:0.55, questionIds:["Q1","Q2"] },
  { id:"experience", label:"Expérience et pratique", weight:0.45, questionIds:["Q4","Q5"] }
];
