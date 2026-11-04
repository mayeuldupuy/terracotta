import { calculateProfile } from './scoring.js';
import { questions } from '../data/questions.js';

function addText(parent, tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

export function renderResults(answers) {
  const container = document.getElementById('results-container');
  if (!container) {
    console.error('Terracotta : élément #results-container introuvable.');
    return null;
  }

  const result = calculateProfile(answers);
  container.replaceChildren();

  addText(container, 'p', 'TON PROFIL TERRACOTTA', 'eyebrow');

  if (result.primary) {
    addText(container, 'h1', result.primary.name);
    addText(container, 'p', result.primary.description, 'intro');
    if (result.secondary) {
      addText(container, 'h2', `Une autre facette : ${result.secondary.name}`);
      addText(container, 'p', result.secondary.description);
    }
  } else {
    addText(container, 'h1', 'Plusieurs facettes de ton aventure');
    addText(container, 'p', 'Tes réponses correspondent à plusieurs profils, sans dominante unique.', 'intro');
    addText(container, 'p', result.tiedProfiles.map(p => p.name).join(' · '));
  }

  addText(container, 'h2', 'Tes affinités');
  const selected = result.preferences.activities;
  if (selected.length) {
    const activityQuestion = questions.find(q => q.id === 'Q4.1');
    const labels = selected.map(id => activityQuestion.options.find(o => o.id === id)?.label || id);
    addText(container, 'p', labels.join(' · '));
  } else {
    addText(container, 'p', 'À explorer ensemble.');
  }

  addText(container, 'p',
    'Les propositions d’aventures seront personnalisées lors de la prochaine étape, en tenant compte de tes envies et des critères de faisabilité.',
    'intro'
  );

  console.log('Terracotta — résultat de segmentation', result);
  return result;
}
