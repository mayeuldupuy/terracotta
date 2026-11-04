// TERRACOTTA — Questionnaire V2 : source Excel validée, 10 questions.
const q = (id, page, category, title, entries, extra = {}) => ({
  id, page, category, title, type: extra.type || "single",
  optional: false,
  maxSelections: extra.maxSelections,
  description: extra.type === "multiple" ? "Plusieurs réponses possibles." : "Choisissez une réponse.",
  options: entries.map(([code, label]) => ({ id: `${id}-${code}`, label }))
});

export const questions = [
  // Ancien ID : Q1.1
  q("Q1", 1, "Émotionnel", "Qu'est-ce qui te donne envie de vivre une aventure en pleine nature en ce moment ?", [
    ["A", "Découvrir de nouveaux paysages"],
    ["B", "Prendre l’air et déconnecter"],
    ["C", "Vivre une aventure et explorer"],
    ["D", "Me dépasser physiquement"],
    ["E", "Partager une expérience humaine"],
    ["F", "Profiter sans objectif particulier"]
  ]),
  // Ancien ID : Q1.2
  q("Q2", 2, "Émotionnel", "Qu'est-ce qui te pousse à franchir le pas maintenant ?", [
    ["A", "J’ai envie de sortir de ma routine"],
    ["B", "J’ai besoin d’un nouveau départ"],
    ["C", "J’ai envie de relever un défi personnel"],
    ["D", "J’aimerais découvrir un univers que je connais peu"],
    ["E", "J'aimerais apprendre de nouvelles choses"],
    ["F", "J’ai envie de rencontrer et partager"]
  ]),
  // Ancien ID : Q4.1
  q("Q3", 3, "Affinité", "Parmi ces activités, lesquelles t’attirent le plus en ce moment ?", [
    ["A", "Randonnée"],
    ["B", "Trail / Running"],
    ["C", "Vélo / VTT"],
    ["D", "Kayak"],
    ["E", "Escalade"],
    ["F", "Bivouac"],
    ["G", "Trekking / itinérance"],
    ["H", "Orientation / survie douce"],
    ["I", "Découverte de la faune et de la flore"],
    ["J", "Je suis ouvert à toutes les propositions"]
  ], {type:"multiple"}),
  // Ancien ID : Q5.1
  q("Q4", 4, "Expérience", "Comment décrirais-tu ton rapport au sport aujourd'hui ?", [
    ["A", "Je découvre complètement le sport"],
    ["B", "Je pratique très occasionnellement"],
    ["C", "Je reprends progressivement une activité"],
    ["D", "Je pratique régulièrement"],
    ["E", "Je suis très sportif et entraîné"]
  ]),
  // Ancien ID : Q5.2
  q("Q5", 5, "Expérience", "Quelle est ton expérience des activités en pleine nature ?", [
    ["A", "Je découvre complètement cet univers"],
    ["B", "J’ai déjà fait quelques sorties"],
    ["C", "Je pratique régulièrement des activités outdoor"],
    ["D", "J’ai déjà réalisé des aventures itinérantes ou engagées"],
    ["E", "Je suis autonome dans la plupart de mes activités"]
  ]),
  // Ancien ID : Q5.4
  q("Q6", 6, "Expérience", "As-tu déjà pratiqué certaines activités outdoor ?", [
    ["A", "Randonnée"],
    ["B", "Trail / Running"],
    ["C", "Vélo / VTT"],
    ["D", "Kayak"],
    ["E", "Escalade"],
    ["F", "Bivouac"],
    ["G", "Trekking / itinérance"],
    ["H", "Aucune de ces activités"]
  ], {type:"multiple"}),
  // Ancien ID : Q6.2
  q("Q7", 7, "Pratique", "Quel format d’expérience t’attirerait le plus ?", [
    ["A", "Quelques heures"],
    ["B", "Une journée complète"],
    ["C", "Un week-end"],
    ["D", "Plusieurs jours"],
    ["E", "Je suis ouvert à tout"]
  ]),
  // Ancien ID : Q6.3
  q("Q8", 8, "Pratique", "Avec quel type d’accompagnement serais-tu le plus à l’aise ?", [
    ["A", "Être accompagné du début à la fin"],
    ["B", "Être accompagné tout en apprenant à faire seul"],
    ["C", "Bénéficier de conseils et d’une préparation, puis être autonome"],
    ["D", "Partager une expérience avec un petit groupe"],
    ["E", "Je ne sais pas encore"]
  ]),
  // Ancien ID : Q6.4
  q("Q9", 9, "Pratique", "De quel équipement disposes-tu déjà ?", [
    ["A", "Je n’ai quasiment aucun équipement"],
    ["B", "J’ai quelques équipements de base"],
    ["C", "Je suis déjà équipé pour certaines activités"],
    ["D", "Je possède tout le matériel nécessaire"]
  ]),
  // Ancien ID : Q6.5
  q("Q10", 10, "Pratique", "Quel budget envisages-tu pour une expérience ?", [
    ["A", "Moins de 50 €"],
    ["B", "50 à 150 €"],
    ["C", "150 à 350 €"],
    ["D", "350 à 700 €"],
    ["E", "Plus de 700 €"],
    ["F", "Je préfère en discuter"]
  ])
];
