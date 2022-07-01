const json = {
  paymentOptions: {
    stripe_klarna_paynow: {
      name: "Sofort",
    },
    invoice: {
      name: "Rechnung",
    },
    stripe: {
      name: "Karte",
    },
    klarna_pay_later: {
      name: "Rechnung",
    },
    klarna_pay_now: {
      name: "Sofort",
    },
    paypal: {
      name: "Paypal",
    },
  },
  order_status: {
    processing: "In bearbeitung",
    completed: "Abgeschlossen",
    cancelled: "Abgebrochen",
    payment_pending: "Zahlung offen",
  },
  errors: {
    error: {
      message: "Fehler",
    },
    account_already_exists: {
      message: "Diese E-Mail Adresse ist bereits bei uns registriert",
    },
    email_is_already_taken: {
      message: "Diese E-Mail Adresse ist bereits bei uns registriert",
    },
    passwords_does_not_match: {
      message: "Die Passwörter stimmen nicht über ein",
    },
    field_min_2_letters: {
      message: "Min. 2 Buchstaben",
    },
    field_check_value: {
      message: "Bitte prüfen Sie Ihre Angabe",
    },
    field_invalid_email_format: {
      message: "Format prüfen",
    },
    field_change_country: {
      message: "Sie befinden sich nicht im Shop des gewählten Landes",
    },
    login: {
      email_or_password_invalid: {
        message: "E-Mail oder Passwort falsch",
      },
    },
    no_payment_option_selected: {
      message: "Bitte wählen Sie eine Zahlungsmethode aus.",
    },
    payment_failed: {
      message:
        "Zahlung fehlgeschlagen, bitte wählen Sie eine andere Zahlungsart aus.",
    },
    payment_stripe_incomplete_number: {
      message: "Bitte geben Sie Ihre Kartennummer ein.",
    },
    payment_stripe_payment_intent_authentication_failure: {
      message: "Es gab einen Fehler. Bitte wählen Sie eine andere Zahlungsart.",
    },
    payment_stripe_invalid_number: {
      message: "Ihre Kartennummer ist ungültig.",
    },
    payment_stripe_incomplete_zip: {
      message: "Bitte prüfen Sie Ihre Postleitzahl.",
    },
    payment_stripe_incomplete_cvc: {
      message: "Die eingegebene PIN ist nicht vollständig.",
    },
    payment_stripe_incomplete_expiry: {
      message: "Bitte prüfen Sie das Ablaufdatum.",
    },
    checkout_general: {
      message: "Bitte überprüfen Sie Ihre Angaben.",
    },
    no_message: {
      message: "",
    },
    does_not_match_shop_locale: {
      message: "Bitte prüfen Sie Ihre Angabe",
    },
  },
  views: {
    product: {
      description: "Beschreibung",
      addToCart_button: "In den Warenkorb",
    },
    checkout_confirmation: {
      digital_download_text:
        "Bitte stellen sie sicher, Ihre Dateien nicht nur online einzusehen, sondern auch herunterzuladen, um auch offline dauerhaft auf sie zugreifen zu können. Ihre Download-Links stehen Ihnen hierfür 30 Tage zur Verfügung.",
      digital_download_headline: "Ihre Downloads:",
      your_order_id: "Ihre Bestellnummer:",
      text: "Zur Bestätigung Ihrer Bestellung erhalten Sie in Kürze eine E-Mail.",
      headline: "Vielen Dank für Ihren Einkauf.",
      back_button_text: "Zurück zum Shop",
      order_not_found: "Die Bestellung konnte nicht gefunden werden",
    },
  },
  "views.product.addToCart.button": "In den Warenkorb",
  "views.category.addToCart.button": "In den Warenkorb",
  "views.checkout.footer.content":
    '<a href="/impressum">Impressum</a> — Shop by Purdia',
  "views.checkout.footer.info":
    'Hinweis zum <a href="/impressum#widerruf">Widerrufsrecht:</a>\nVerbraucher haben ein 14-tägiges Widerrufsrecht.\nIch stimme der Ausführung des Vertrages vor Ablauf der Widerrufsfrist ausdrücklich zu. Ich habe zur Kenntnis genommen, dass das Widerrufsrecht mit Beginn der Ausführung des Vertrages erlischt.\n<br>Es gelten unsere <a href="/impressum#agb">Allgemeinen Geschäftsbedingungen</a>',
  forms: {
    shipping_address: {
      firstname: "Vorname",
      lastname: "Nachname",
      street: "Straße",
      zipCode: "PLZ",
      city: "Stadt",
      country: "Land",
    },
    guest: {
      email: "E-Mail",
    },
  },
  navigation: {
    item: {
      user: {
        customer_account: "Mein Account",
        customer_orders: "Meine Bestellungen",
        sign_out: "Abmelden",
      },
    },
  },
  checkout: {
    component: {
      address: {
        title: "Adresse",
      },
      billingAddress: {
        title: "Rechnungsadresse",
      },
      shippingMethod: {
        title: "Lieferart",
      },
      payment: {
        title: "Zahlung",
      },
      products: {
        title: "Ihre Artikel",
      },
      summary: {
        total: "Gesamt",
        inc_vat: "inkl. MwSt.",
        confirm_order_button_text: "Kostenpflichtig bestellen",
      },
    },
  },
  components: {
    switch_shop: "Shop wechseln",
  },
  mails: {
    order_confirmation: {
      headline: "Vielen Dank für Ihren Einkauf.",
      subline:
        "Sollten Sie Ihre digitalen Produkte nicht bereits auf unserer Website heruntergeladen haben, finden Sie hier noch einmal den Link zu Ihren entsprechenden Download-Links.",
      download_button_text: "Download Links",
      download_info:
        "Unsere Download-Links sind 30 Tage gültig. Bitte stellen Sie sicher, Ihre digitalen Produkte innerhalb dieser Zeit herunterzuladen.",
      order_details: "Bestelldetails",
      order_number: "Bestellnummer:",
      order_date: "Bestelldatum:",
      payment_method: "Zahlungsmethode:",
      billing_address: "Rechnungsadresse:",
      sub_total: "Zwischensumme:",
      vat: "MwSt.:",
      total: "Gesamtsumme:",
    },
  },
  "view.product.addToCart": "In den Warenkorb",
  "component.login.login": "Login",
  "component.navItem.cart.incVat": "inkl. MwSt",
  "component.navItem.cart.total": "Gesamt",
  "component.navItem.cart.emptyCart": "Dein Warenkorb ist leer",
  "component.navItem.cart.checkoutCTA": "Zur Kasse",
  "form.options.sort.priceHigh": "Höchster Preis",
  "form.options.sort.priceLow": "Niedrigster Preis",
  "form.options.sort.new": "Neu",
  "form.options.sort.auto": "Auto",
  "form.field.selectCountry": "Land wählen",
  "form.field.email": "E-Mail",
  "form.field.repeatPassword": "Passwort wiederholen",
  "form.field.password": "Passwort",
  "form.field.phone": "Telefon",
  "form.field.country": "Land",
  "form.field.zipCode": "PLZ",
  "form.field.city": "Stadt",
  "form.field.street": "Straße",
  "form.field.lastname": "Nachname",
  "form.field.firstname": "Vorname",
  "view.product.incVat": "inkl. MwSt",
  "view.account.account.logout": "Abmelden",
  "view.account.account.headline": "Account",
  "view.account.nav.account": "Account",
  "view.account.nav.orders": "Bestellungen",
  "view.account.orders.headline": "Bestellungen",
  "view.404.cta": "Zur Startseite",
  "view.404.headline": "Seite nicht gefunden",
  "view.passwordResetConfirmation.cta": "Jetzt anmelden",
  "view.passwordResetConfirmation.headline":
    "Passwort erfolgreich zurückgesetzt",
  "view.passwordUpdate.submit": "Passwort setzen",
  "view.passwordUpdate.headline": "Neues Passwort setzen",
  "view.passwordResetRequest.info":
    "Wir haben dir einen Link via Mail gesendet.",
  "view.passwordResetRequest.headline": "Du erhälst in Kürze eine Mail",
  "view.passwordReset.submit": "Passwort zurücksetzen",
  "view.passwordReset.info": "Wir senden dir einen Link.",
  "view.passwordReset.headline": "Passwort zurücksetzen",
  "view.login.loginToViewOrders":
    "Bitte melde dich an um deine Bestellungen zu sehen",
  "view.login.notRegistered": "Noch nicht registriert?",
  "view.login.forgotPassword": "Passwort vergessen?",
  "view.login.headline": "Login",
  "view.category.nav.sort": "Sortieren",
  "view.basket.title": "Bestellen",
  "view.basket.button": "Zur Kasse",
  "view.checkout.auth.newCustomer": "Ich bin Neukunde",
  "view.checkout.shipping.headline": "Lieferadresse",
  "view.checkout.address.separateBillingAddress": "Rechnungsadresse hinzufügen",
  "view.checkout.address.createCustomer": "Account erstellen",
  "view.checkout.address.headline": "Adresse",
  "view.checkout.payment.headline": "Zahlungsart",
  "view.checkout.shippingOption.headline": "Lieferung",
  "view.checkout.basket.headline": "Deine Artikel",
  "view.checkout.order.shippingCosts": "Lieferkosten",
  "view.checkout.order.incVat": "inkl. MwSt",
  "view.checkout.order.total": "Gesamt",
  "view.checkout.submitOrder.button": "Kostenpfichtig Bestellen",
  "view.checkout.submitOrder.proccessingPayment": "Zahlung in Bearbeitung",
  "view.checkout.submitOrder.savingData": "Daten werden gespeichert",
  "view.checkout.title": "Kasse",
  "view.checkout.orderAsGuest": "Als Gast bestellen",
  "component.payment.stripe_klarna_paynow.name": "Sofort",
  "component.payment.stripe.name": "Karte",
  "component.payment.paypal.name": "Paypal",
  "component.payment.invoice.name": "Rechnung",
  "component.basket.item.remove": "Entfernen",
  "error.payment_not_selected": "Bitte wähle eine Zahlungsmethode aus",
  "error.field_required": "Dies ist ein Pflichtfeld",
  "error.tooShort": "Min. 2 Buchstaben",
  "error.tooShort": "Min. 2 Buchstaben",
  "error.fieldCheckValue": "Bitte prüfe deine Angabe",
  "error.field_invalid_email_format": "Diese E-Mail ist nicht gültig",
  "error.account_already_exists":
    "Diese E-Mail Adresse ist bereits bei uns registriert",
  "error.payment.stripeCard.card_declined": "Deine Karte wurde abgelehnt",
  "error.payment.stripeCard.incorrect_cvc": "Der Sicherheitscode ist falsch",
};

const lang = JSON.parse(JSON.stringify(json));
