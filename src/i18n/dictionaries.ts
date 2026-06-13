import type { Locale } from "./config";

// Centralised UI copy. Content tone: premium, warm, human, never robotic.
// French is primary, English secondary.

export const dictionaries = {
  fr: {
    nav: {
      home: "Accueil",
      riad: "Le Riad",
      stay: "Réserver",
      experiences: "Expériences",
      gallery: "Galerie",
      contact: "Contact",
      book: "Demander un séjour",
    },
    common: {
      whatsapp: "Contacter sur WhatsApp",
      openingSoon: "Ouverture prochaine",
      estimatedTotal: "Total estimé",
      finalConfirmation:
        "La confirmation finale vous sera envoyée par le riad.",
      perNight: "par nuit",
      guests: "voyageurs",
      night: "nuit",
      nights: "nuits",
      from: "À partir de",
      learnMore: "En savoir plus",
      backHome: "Retour à l'accueil",
    },
    home: {
      heroKicker: "Riad traditionnel · Médina de Marrakech",
      heroTitle: "Riad Dar Kader",
      heroSubtitle:
        "Un riad marocain authentique à deux pas du Musée Mouassine, au cœur de la Médina de Marrakech.",
      heroCta: "Demander un séjour",
      heroSecondary: "Découvrir le riad",
      openingNote: "Ouverture prévue début octobre — réservations ouvertes.",
      sellingTitle: "Pourquoi choisir Dar Kader",
      selling: [
        {
          title: "Atmosphère marocaine traditionnelle",
          text: "Patio, zellige et sérénité : l'esprit d'un véritable riad de la Médina.",
        },
        {
          title: "À deux pas du Musée Mouassine",
          text: "Une situation calme au cœur de la Médina, proche des lieux essentiels.",
        },
        {
          title: "Réservation directe",
          text: "Envoyez votre demande directement au riad, sans intermédiaire.",
        },
      ],
      roomsTitle: "Les chambres & espaces",
      roomsText:
        "Sept chambres pensées comme des refuges, autour d'un patio baigné de lumière.",
      roomsCta: "Vérifier les disponibilités",
      extrasTitle: "Expériences & extras",
      extrasText:
        "Petit-déjeuner marocain, dîner sur la terrasse, hammam, visites guidées…",
      extrasCta: "Voir les expériences",
      whatsappTitle: "Une question avant de réserver ?",
      whatsappText:
        "Écrivez-nous directement sur WhatsApp, nous vous répondrons avec plaisir.",
    },
    riad: {
      title: "Le Riad",
      kicker: "Notre histoire",
      storyTitle: "Un riad de la Médina, restauré avec soin",
      story:
        "Dar Kader est une maison traditionnelle marocaine nichée dans la Médina de Marrakech. Derrière une porte discrète se cache un patio paisible, des chambres fraîches et une terrasse ouverte sur le ciel. Nous l'avons imaginé comme un refuge calme, loin de l'agitation, tout en restant au cœur de la vieille ville.",
      styleTitle: "Style marocain traditionnel",
      styleText:
        "Zellige, tadelakt, bois sculpté et lanternes de cuivre : chaque détail rend hommage à l'artisanat marrakchi, sans surcharge.",
      locationTitle: "Au cœur de la Médina",
      locationText:
        "À quelques minutes à pied du Musée Mouassine, des souks et des places animées, le riad reste un havre de tranquillité.",
      architectureTitle: "Architecture & atmosphère",
      architectureText:
        "Le patio central organise la vie du riad : on s'y retrouve au calme, à l'ombre, autour d'un thé à la menthe.",
      walkingTitle: "À distance de marche",
      walking: [
        { place: "Musée Mouassine", time: "2 min à pied" },
        { place: "Souks de la Médina", time: "5 min à pied" },
        { place: "Place Jemaa el-Fna", time: "12 min à pied" },
        { place: "Palais de la Bahia", time: "20 min à pied" },
      ],
      futureTitle: "Une maison d'hôtes en devenir",
      futureText:
        "Dar Kader ouvre bientôt ses portes. Nous accueillerons nos premiers voyageurs dès le début octobre, avec l'envie de partager un Marrakech authentique et chaleureux.",
    },
    stay: {
      title: "Réserver votre séjour",
      subtitle:
        "Choisissez vos dates, nous vous proposons les meilleures options disponibles.",
      step1: "Vos dates",
      step2: "Disponibilités",
      step3: "Extras",
      step4: "Vos coordonnées",
      step5: "Confirmation",
      checkIn: "Arrivée",
      checkOut: "Départ",
      guests: "Voyageurs",
      search: "Vérifier les disponibilités",
      searching: "Recherche en cours…",
      availableTitle: "Options disponibles",
      noAvailability:
        "Aucune disponibilité pour ces dates. Essayez d'autres dates ou contactez-nous directement.",
      selectOption: "Choisir cette option",
      selected: "Sélectionné",
      continue: "Continuer",
      back: "Retour",
      extrasTitle: "Ajoutez des extras à votre séjour",
      extrasSubtitle: "Optionnel — vous pourrez en discuter avec le riad.",
      detailsTitle: "Vos coordonnées",
      fullName: "Nom complet",
      email: "Email",
      phone: "Téléphone WhatsApp",
      country: "Pays",
      specialRequests: "Demandes particulières",
      submit: "Envoyer ma demande",
      submitting: "Envoi en cours…",
      summary: "Récapitulatif",
      confirmTitle: "Votre demande a bien été envoyée",
      confirmText:
        "Merci ! Le riad va vérifier la disponibilité et vous confirmera votre séjour très rapidement.",
      confirmReference: "Référence de votre demande",
      confirmWhatsapp: "Contacter le riad sur WhatsApp",
      newSearch: "Nouvelle recherche",
      errors: {
        invalid_dates: "Veuillez saisir des dates valides.",
        past_date: "La date d'arrivée ne peut pas être dans le passé.",
        checkout_before_checkin:
          "La date de départ doit être après la date d'arrivée.",
        no_capacity:
          "Nous n'avons pas assez de place pour ce nombre de voyageurs à ces dates.",
        blocked: "Le riad n'est pas disponible à ces dates.",
        no_rooms: "Aucune chambre n'est disponible pour le moment.",
        no_option: "Aucune option ne correspond à votre demande.",
        invalid_guests: "Veuillez indiquer le nombre de voyageurs.",
        generic: "Une erreur est survenue. Merci de réessayer.",
      },
    },
    experiences: {
      title: "Expériences & extras",
      subtitle:
        "Complétez votre séjour avec des expériences pensées pour vous faire vivre Marrakech autrement.",
      addAtBooking: "À ajouter lors de votre demande de séjour.",
    },
    gallery: {
      title: "Galerie",
      subtitle:
        "Les vraies photos arrivent bientôt. En attendant, voici l'esprit du riad.",
      placeholderNote: "Visuels provisoires — photos réelles à venir.",
    },
    contact: {
      title: "Contact",
      subtitle: "Une question ? Écrivez-nous, nous serons ravis de vous aider.",
      whatsappTitle: "WhatsApp",
      whatsappText: "La façon la plus rapide de nous joindre.",
      emailTitle: "Email",
      locationTitle: "Adresse",
      locationText: "Médina, près du Musée Mouassine, Marrakech, Maroc",
      formName: "Nom",
      formEmail: "Email",
      formMessage: "Message",
      formSubmit: "Envoyer",
    },
    footer: {
      tagline: "Riad traditionnel au cœur de la Médina de Marrakech.",
      explore: "Explorer",
      contact: "Contact",
      rights: "Tous droits réservés.",
      directBooking: "Réservation directe acceptée.",
    },
  },

  en: {
    nav: {
      home: "Home",
      riad: "The Riad",
      stay: "Book",
      experiences: "Experiences",
      gallery: "Gallery",
      contact: "Contact",
      book: "Request a stay",
    },
    common: {
      whatsapp: "Contact on WhatsApp",
      openingSoon: "Opening soon",
      estimatedTotal: "Estimated total",
      finalConfirmation: "Final confirmation will be sent by the riad.",
      perNight: "per night",
      guests: "guests",
      night: "night",
      nights: "nights",
      from: "From",
      learnMore: "Learn more",
      backHome: "Back to home",
    },
    home: {
      heroKicker: "Traditional riad · Marrakech Medina",
      heroTitle: "Riad Dar Kader",
      heroSubtitle:
        "An authentic Moroccan riad steps from Musée Mouassine, in the heart of the Marrakech Medina.",
      heroCta: "Request a stay",
      heroSecondary: "Discover the riad",
      openingNote: "Opening early October — reservations now open.",
      sellingTitle: "Why choose Dar Kader",
      selling: [
        {
          title: "Traditional Moroccan atmosphere",
          text: "Patio, zellige and calm: the spirit of a true Medina riad.",
        },
        {
          title: "Steps from Musée Mouassine",
          text: "A quiet setting in the heart of the Medina, close to the essentials.",
        },
        {
          title: "Direct reservation",
          text: "Send your request straight to the riad, with no middleman.",
        },
      ],
      roomsTitle: "Rooms & spaces",
      roomsText:
        "Seven rooms imagined as quiet retreats around a light-filled patio.",
      roomsCta: "Check availability",
      extrasTitle: "Experiences & extras",
      extrasText:
        "Moroccan breakfast, dinner on the terrace, hammam, guided tours…",
      extrasCta: "See experiences",
      whatsappTitle: "A question before booking?",
      whatsappText: "Message us directly on WhatsApp — we'll be glad to help.",
    },
    riad: {
      title: "The Riad",
      kicker: "Our story",
      storyTitle: "A Medina riad, lovingly restored",
      story:
        "Dar Kader is a traditional Moroccan house tucked into the Marrakech Medina. Behind a discreet door lies a peaceful patio, cool rooms and a terrace open to the sky. We imagined it as a calm retreat, away from the bustle yet still in the heart of the old city.",
      styleTitle: "Traditional Moroccan style",
      styleText:
        "Zellige, tadelakt, carved wood and copper lanterns: every detail honours Marrakech craftsmanship, never overdone.",
      locationTitle: "In the heart of the Medina",
      locationText:
        "A few minutes' walk from Musée Mouassine, the souks and the lively squares, the riad remains a haven of calm.",
      architectureTitle: "Architecture & atmosphere",
      architectureText:
        "The central patio shapes life at the riad: a shaded, quiet place to gather over mint tea.",
      walkingTitle: "Within walking distance",
      walking: [
        { place: "Musée Mouassine", time: "2 min walk" },
        { place: "Medina souks", time: "5 min walk" },
        { place: "Jemaa el-Fnaa", time: "12 min walk" },
        { place: "Bahia Palace", time: "20 min walk" },
      ],
      futureTitle: "A guesthouse in the making",
      futureText:
        "Dar Kader opens its doors soon. We'll welcome our first travellers from early October, eager to share a warm, authentic Marrakech.",
    },
    stay: {
      title: "Book your stay",
      subtitle:
        "Choose your dates and we'll show you the best available options.",
      step1: "Your dates",
      step2: "Availability",
      step3: "Extras",
      step4: "Your details",
      step5: "Confirmation",
      checkIn: "Check-in",
      checkOut: "Check-out",
      guests: "Guests",
      search: "Check availability",
      searching: "Searching…",
      availableTitle: "Available options",
      noAvailability:
        "No availability for these dates. Try other dates or contact us directly.",
      selectOption: "Select this option",
      selected: "Selected",
      continue: "Continue",
      back: "Back",
      extrasTitle: "Add extras to your stay",
      extrasSubtitle: "Optional — you can discuss these with the riad.",
      detailsTitle: "Your details",
      fullName: "Full name",
      email: "Email",
      phone: "WhatsApp phone",
      country: "Country",
      specialRequests: "Special requests",
      submit: "Send my request",
      submitting: "Sending…",
      summary: "Summary",
      confirmTitle: "Your request has been sent",
      confirmText:
        "Thank you! The riad will check availability and confirm your stay very soon.",
      confirmReference: "Your request reference",
      confirmWhatsapp: "Contact the riad on WhatsApp",
      newSearch: "New search",
      errors: {
        invalid_dates: "Please enter valid dates.",
        past_date: "The check-in date cannot be in the past.",
        checkout_before_checkin:
          "The check-out date must be after the check-in date.",
        no_capacity:
          "We don't have enough space for that many guests on these dates.",
        blocked: "The riad is not available on these dates.",
        no_rooms: "No rooms are available at the moment.",
        no_option: "No option matches your request.",
        invalid_guests: "Please enter the number of guests.",
        generic: "Something went wrong. Please try again.",
      },
    },
    experiences: {
      title: "Experiences & extras",
      subtitle:
        "Round out your stay with experiences designed to let you live Marrakech differently.",
      addAtBooking: "Add these when you request your stay.",
    },
    gallery: {
      title: "Gallery",
      subtitle:
        "Real photos are coming soon. In the meantime, here's the spirit of the riad.",
      placeholderNote: "Placeholder visuals — real photos coming soon.",
    },
    contact: {
      title: "Contact",
      subtitle: "A question? Write to us — we'll be glad to help.",
      whatsappTitle: "WhatsApp",
      whatsappText: "The fastest way to reach us.",
      emailTitle: "Email",
      locationTitle: "Address",
      locationText: "Medina, near Musée Mouassine, Marrakech, Morocco",
      formName: "Name",
      formEmail: "Email",
      formMessage: "Message",
      formSubmit: "Send",
    },
    footer: {
      tagline: "A traditional riad in the heart of the Marrakech Medina.",
      explore: "Explore",
      contact: "Contact",
      rights: "All rights reserved.",
      directBooking: "Direct booking accepted.",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)["fr"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}
