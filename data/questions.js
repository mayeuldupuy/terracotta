// TERRACOTTA — Questionnaire définitif V1.0
// Identifiants de réponses inchangés par rapport à la matrice source.
const q = (id, page, category, title, entries, extra = {}) => ({
  id, page, category, title, type: extra.type || 'single',
  optional: extra.optional || false,
  maxSelections: extra.maxSelections,
  description: extra.description || (extra.type === 'multiple' ? 'Plusieurs réponses possibles.' : 'Choisissez une réponse.'),
  options: entries.map(([code, label]) => ({ id: `${id}-${code}`, label }))
});

export const questions = [
  q('Q1.1',1,'Émotionnel',"Qu'est-ce qui te donne envie de vivre une expérience en pleine nature aujourd'hui ?",[
    ['A','Découvrir quelque chose de nouveau'],['B','Prendre l’air et déconnecter'],['C','Vivre une aventure et explorer'],['D','Me dépasser physiquement'],['E','Retrouver un lien avec la nature'],['F','Partager une expérience humaine'],['G','Je ne sais pas encore']
  ]),
  q('Q1.2',1,'Émotionnel',"Qu'est-ce qui te pousse à franchir le pas maintenant ?",[
    ['A','J’ai envie de sortir de ma routine'],['B','J’ai besoin d’un nouveau départ'],['C','J’ai envie de relever un défi personnel'],['D','J’aimerais découvrir un univers que je connais peu'],['E','J’ai envie de rencontrer et partager']
  ],{optional:true,description:'Question facultative : vous pouvez passer à la suite.'}),
  q('Q2.1',2,'Émotionnel','À quoi ressemblerait une expérience qui te ferait vraiment du bien ?',[
    ['A','Découvrir des paysages insolites'],['B','Ressentir la satisfaction d’un effort'],['C','Apprendre de nouvelles choses'],['D','Vivre une aventure que je n’oserais pas seul'],['E','Partager un moment avec d’autres personnes'],['F','Être seul avec la nature'],['G','Profiter sans objectif particulier']
  ]),
  q('Q3.1',3,'Émotionnel',"Jusqu'où as-tu envie d'aller ?",[
    ['A','Commencer doucement'],['B','Sortir un peu de ma zone de confort'],['C','Vivre un vrai challenge'],['D','Repousser mes limites'],['E','Rester ouvert à ce qui me correspond']
  ]),
  q('Q4.1',4,'Affinité','Parmi ces activités, lesquelles t’attirent le plus en ce moment ?',[
    ['A','Randonnée'],['B','Trail / Running'],['C','Vélo / VTT'],['D','Kayak'],['E','Escalade'],['F','Bivouac'],['G','Trekking / itinérance'],['H','Orientation / survie douce'],['I','Découverte de la faune et de la flore'],['J','Je ne sais pas encore']
  ],{type:'multiple',description:'Plusieurs réponses possibles.'}),
  q('Q4.2',4,'Affinité','Y a-t-il une activité que tu aimerais particulièrement découvrir ?',[
    ['A','Une activité que je n’ai jamais pratiquée'],['B','Une activité que je connais déjà et que je souhaite approfondir'],['C','Plusieurs activités combinées'],['D','Je suis ouvert à toutes les propositions']
  ]),
  q('Q5.1',5,'Expérience',"Comment décrirais-tu ton rapport au sport aujourd'hui ?",[
    ['A','Je découvre complètement le sport'],['B','Je pratique très occasionnellement'],['C','Je reprends progressivement une activité'],['D','Je pratique régulièrement'],['E','Je suis très sportif et entraîné']
  ]),
  q('Q5.2',5,'Expérience','Quelle est ton expérience des activités en pleine nature ?',[
    ['A','Je découvre complètement cet univers'],['B','J’ai déjà fait quelques sorties'],['C','Je pratique régulièrement des activités outdoor'],['D','J’ai déjà réalisé des aventures itinérantes ou engagées'],['E','Je suis autonome dans la plupart de mes activités']
  ]),
  q('Q5.3',5,'Expérience','Comment évalues-tu actuellement ta condition physique ?',[
    ['A','Je suis peu en forme actuellement'],['B','J’ai une condition physique moyenne'],['C','J’ai une bonne condition physique'],['D','J’ai une excellente condition physique']
  ]),
  q('Q5.4',5,'Expérience','As-tu déjà pratiqué certaines activités outdoor ?',[
    ['A','Randonnée'],['B','Trail / Running'],['C','Vélo / VTT'],['D','Kayak'],['E','Escalade'],['F','Bivouac'],['G','Trekking / itinérance'],['H','Aucune de ces activités']
  ],{type:'multiple'}),
  q('Q6.1',6,'Pratique','Qu’aimerais-tu retirer de cette expérience ?',[
    ['A','Découvrir et apprendre les bases'],['B','Être plus autonome dans la nature'],['C','Améliorer ma condition physique'],['D','Préparer un défi personnel'],['E','Apprendre à pratiquer une activité outdoor'],['F','Découvrir de nouveaux territoires'],['G','Vivre un moment de partage'],['H','Prendre du temps pour moi']
  ]),
  q('Q6.2',6,'Pratique','Quel format d’expérience t’attirerait le plus ?',[
    ['A','Quelques heures'],['B','Une journée complète'],['C','Un week-end'],['D','Plusieurs jours'],['E','Je suis ouvert à tout']
  ]),
  q('Q6.3',6,'Pratique','Avec quel type d’accompagnement serais-tu le plus à l’aise ?',[
    ['A','Être accompagné du début à la fin'],['B','Être accompagné tout en apprenant à faire seul'],['C','Bénéficier de conseils et d’une préparation, puis être autonome'],['D','Partager une expérience avec un petit groupe'],['E','Je ne sais pas encore']
  ]),
  q('Q6.4',6,'Pratique','De quel équipement disposes-tu déjà ?',[
    ['A','Je n’ai quasiment aucun équipement'],['B','J’ai quelques équipements de base'],['C','Je suis déjà équipé pour certaines activités'],['D','Je possède tout le matériel nécessaire']
  ]),
  q('Q6.5',6,'Pratique','Quel budget envisages-tu pour une expérience ?',[
    ['A','Moins de 50 €'],['B','50 à 150 €'],['C','150 à 350 €'],['D','350 à 700 €'],['E','Plus de 700 €'],['F','Je préfère en discuter']
  ])
];
