// TERRACOTTA — QUESTIONS DE DÉMONSTRATION

export const questions = [
    {
        id: "EMO_01",
        category: "Émotionnel",
        title: "Qu'est-ce qui vous pousse à partir à l'aventure ?",
        description: "Choisissez la réponse qui vous correspond le mieux.",
        type: "single",
        options: [
            { id: "A", label: "Me déconnecter du quotidien" },
            { id: "B", label: "Me dépasser physiquement" },
            { id: "C", label: "Découvrir de nouveaux horizons" },
            { id: "D", label: "Partager une expérience humaine" }
        ]
    },
    {
        id: "AFF_01",
        category: "Affinité",
        title: "Quels environnements vous attirent ?",
        description: "Sélectionnez jusqu'à trois réponses.",
        type: "multiple",
        maxSelections: 3,
        options: [
            { id: "A", label: "Les montagnes" },
            { id: "B", label: "Les forêts" },
            { id: "C", label: "Les rivières et les lacs" },
            { id: "D", label: "Les grands espaces sauvages" },
            { id: "E", label: "Les littoraux" },
            { id: "F", label: "Les campagnes" }
        ]
    },
    {
        id: "EXP_01",
        category: "Expérience",
        title: "Quelle est votre expérience des aventures en pleine nature ?",
        description: "Choisissez la réponse la plus proche de votre situation.",
        type: "single",
        options: [
            { id: "A", label: "Je débute complètement" },
            { id: "B", label: "J'ai déjà quelques expériences" },
            { id: "C", label: "Je pratique régulièrement" },
            { id: "D", label: "Je suis expérimenté et autonome" }
        ]
    },
    {
        id: "PRA_01",
        category: "Pratique",
        title: "Quelles activités aimeriez-vous pratiquer ?",
        description: "Plusieurs réponses possibles.",
        type: "multiple",
        options: [
            { id: "A", label: "Randonnée et trekking" },
            { id: "B", label: "Trail et course à pied" },
            { id: "C", label: "Vélo et VTT" },
            { id: "D", label: "Kayak et sports nautiques" },
            { id: "E", label: "Escalade" },
            { id: "F", label: "Bivouac" }
        ]
    }
];