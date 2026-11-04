
import { calculateProfile } from "./scoring.js";
import { questions } from "../data/questions.js";

const FORMSPREE_URL = "https://formspree.io/f/maeevjry";

const DEMO_ADVENTURES = [
    "Trek dans le Vercors",
    "Bivouac sur les hauts plateaux",
    "Trail sous les sapins"
];

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function formatAnswers(answers) {
    return questions.map((question) => {
        const selected = answers[question.id] || [];

        const labels = selected.map((answerId) => {
            const option = question.options.find(
                (item) => item.id === answerId
            );

            return option ? option.label : answerId;
        });

        return [
            `${question.id} — ${question.title}`,
            labels.length ? labels.join(" ; ") : "Non renseigné"
        ].join("\n");
    }).join("\n\n");
}

function createField(labelText, name, type, required = false) {
    const wrapper = createElement("div", "contact-field");

    const label = createElement("label", "contact-label", labelText);
    label.htmlFor = `contact-${name}`;

    const input = document.createElement("input");
    input.id = `contact-${name}`;
    input.name = name;
    input.type = type;
    input.className = "contact-input";
    input.required = required;

    if (name === "name") {
        input.autocomplete = "given-name";
        input.maxLength = 100;
    }

    if (name === "email") {
        input.autocomplete = "email";
        input.maxLength = 254;
    }

    if (name === "phone") {
        input.autocomplete = "tel";
        input.maxLength = 30;
    }

    wrapper.append(label, input);
    return wrapper;
}

function createContactForm(answers, result) {
    const form = createElement("form", "contact-form");
    form.id = "terracotta-contact-form";
    form.hidden = true;

    const title = createElement(
        "h2",
        "contact-title",
        "Parlons de ton aventure."
    );

    const intro = createElement(
        "p",
        "contact-intro",
        "Laisse-moi tes coordonnées pour échanger sur les expériences qui t'intéressent."
    );

    const nameField = createField("Ton prénom", "name", "text", true);
    const emailField = createField(
        "Ton adresse email",
        "email",
        "email",
        true
    );
    const phoneField = createField(
        "Ton téléphone (facultatif)",
        "phone",
        "tel"
    );

    const messageWrapper = createElement("div", "contact-field");
    const messageLabel = createElement(
        "label",
        "contact-label",
        "Un message à ajouter ? (facultatif)"
    );
    messageLabel.htmlFor = "contact-message";

    const messageInput = document.createElement("textarea");
    messageInput.id = "contact-message";
    messageInput.name = "message";
    messageInput.className = "contact-input contact-textarea";
    messageInput.rows = 3;
    messageInput.maxLength = 2000;

    messageWrapper.append(messageLabel, messageInput);

    // Champ anti-spam invisible
    const honeypot = document.createElement("input");
    honeypot.type = "text";
    honeypot.name = "_gotcha";
    honeypot.tabIndex = -1;
    honeypot.autocomplete = "off";
    honeypot.className = "contact-honeypot";
    honeypot.setAttribute("aria-hidden", "true");

    const consentWrapper = createElement(
        "label",
        "contact-consent"
    );

    const consentInput = document.createElement("input");
    consentInput.type = "checkbox";
    consentInput.name = "consent";
    consentInput.required = true;

    const consentText = createElement(
        "span",
        "",
        "J'accepte que mes coordonnées et mes réponses au questionnaire soient transmises pour être recontacté au sujet de mon projet d'aventure."
    );

    consentWrapper.append(consentInput, consentText);

    const submitButton = createElement(
        "button",
        "contact-submit",
        "Envoyer ma demande"
    );
    submitButton.type = "submit";

    const status = createElement("p", "contact-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    form.append(
        title,
        intro,
        nameField,
        emailField,
        phoneField,
        messageWrapper,
        honeypot,
        consentWrapper,
        submitButton,
        status
    );

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const profileName = result.primary
            ? result.primary.name
            : result.tiedProfiles.map(p => p.name).join(" / ");

        const formData = new FormData(form);

        formData.set(
            "subject",
            `Terracotta — Nouvelle demande — ${profileName}`
        );

        formData.set("profil", profileName);

        formData.set(
            "profil_secondaire",
            result.secondary?.name || "Aucun"
        );

        formData.set(
            "aventures_proposees",
            DEMO_ADVENTURES.join("\n")
        );

        formData.set(
            "reponses_questionnaire",
            formatAnswers(answers)
        );

        formData.set(
            "date_demande",
            new Date().toISOString()
        );

        formData.set(
            "consentement_contact",
            "Oui — confirmé avant envoi"
        );

        submitButton.disabled = true;
        submitButton.textContent = "Envoi en cours…";
        status.textContent = "";

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                console.error("Formspree — erreur HTTP :", response.status);
                console.error("Formspree — détails :", errorData);

                throw new Error(
                    errorData.errors?.map(e => e.message).join(", ") ||
                    errorData.error ||
                    `Erreur HTTP ${response.status}`
                );
            }

            form.replaceChildren(
                createElement(
                    "h2",
                    "contact-title",
                    "Merci pour ton message !"
                ),
                createElement(
                    "p",
                    "contact-intro",
                    "Ta demande a bien été transmise. Je reviendrai vers toi prochainement."
                )
            );

        } catch (error) {
            console.error("Terracotta — Formspree :", error);

            status.textContent =
                `L'envoi a échoué : ${error.message}`;

            submitButton.disabled = false;
            submitButton.textContent = "Envoyer ma demande";
        }
    });

    return form;
}

export function renderResults(answers) {
    const container = document.getElementById(
        "results-container"
    );

    if (!container) {
        console.error("Terracotta : résultats introuvables.");
        return null;
    }

    const result = calculateProfile(answers);
    container.replaceChildren();

    // PROFIL

    const profileCard = createElement(
        "div",
        "result-profile-card"
    );

    const eyebrow = createElement(
        "p",
        "result-profile-eyebrow",
        "VOTRE NATURE D'AVENTURIER"
    );

    const profileName = result.primary
        ? result.primary.name
        : "Un aventurier aux multiples facettes";

    const profileDescription = result.primary
        ? result.primary.description
        : "Tes réponses révèlent plusieurs façons complémentaires de vivre l'aventure.";

    const title = createElement(
        "h2",
        "result-profile-name",
        profileName
    );

    const description = createElement(
        "p",
        "result-profile-description",
        profileDescription
    );

    profileCard.append(eyebrow, title, description);

    // AVENTURES

    const recommendations = createElement(
        "section",
        "result-adventures"
    );

    const recommendationsTitle = createElement(
        "h2",
        "result-adventures-title",
        "Les aventures faites pour toi"
    );

    const cards = createElement(
        "div",
        "result-adventure-grid"
    );

    DEMO_ADVENTURES.forEach((adventure) => {
        const card = createElement(
            "div",
            "result-adventure-card"
        );

        const inner = createElement(
            "div",
            "result-adventure-inner"
        );

        const adventureTitle = createElement(
            "h3",
            "result-adventure-name",
            adventure
        );

        inner.appendChild(adventureTitle);
        card.appendChild(inner);
        cards.appendChild(card);
    });

    recommendations.append(recommendationsTitle, cards);

    // CONTACT

    const contactSection = createElement(
        "section",
        "result-contact-section"
    );

    const contactButton = createElement(
        "button",
        "result-contact-button",
        "On en discute ?"
    );
    contactButton.type = "button";
    contactButton.setAttribute(
        "aria-controls",
        "terracotta-contact-form"
    );
    contactButton.setAttribute("aria-expanded", "false");

    const contactForm = createContactForm(answers, result);

    contactButton.addEventListener("click", () => {
        contactForm.hidden = false;
        contactButton.hidden = true;
        contactButton.setAttribute("aria-expanded", "true");

        contactForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        const firstInput = contactForm.querySelector(
            'input[name="name"]'
        );

        if (firstInput) {
            firstInput.focus({ preventScroll: true });
        }
    });

    contactSection.append(contactButton, contactForm);

    container.append(
        profileCard,
        recommendations,
        contactSection
    );

    return result;
}
