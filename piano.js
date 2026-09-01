/* ===========================================================
   PIANO — dati estratti dai documenti della Dott.ssa Asia Viti
   Piano Nutrizionale, Consigli Nutrizionali, Idea piano settimanale
   Generato una volta sola. Modificabile a mano se il piano cambia.
   =========================================================== */

const PIANO = {

  /* --- obiettivi giornalieri spuntabili --- */
  obiettivi: [
    { id: "allenamento", label: "Allenamento",   nota: "150 min a settimana, più forza 2 volte", emoji: "🏃", colore: "#5B4FC7", tipo: "bool",  target: 1, attivo: true },
    { id: "frutta",      label: "Frutta",        nota: "2-3 porzioni da 150 g",                  emoji: "🍑", colore: "#D9452F", tipo: "count", target: 3, attivo: true },
    { id: "acqua",       label: "Acqua",         nota: "8 bicchieri ≈ 2 litri",                  emoji: "💧", colore: "#1E7FA8", tipo: "count", target: 8, attivo: true },
    { id: "verdura",     label: "Verdura",       nota: "a pranzo e a cena, ~200 g cruda",        emoji: "🥬", colore: "#4A8B3A", tipo: "count", target: 2, attivo: true },
    { id: "camminata",   label: "Camminata dopo i pasti", nota: "10-30 min, aiuta il reflusso",  emoji: "🚶", colore: "#B0782A", tipo: "bool",  target: 1, attivo: false },
    { id: "omega3",      label: "Omega-3",       nota: "10 g lino o chia macinati, o 4-5 noci",  emoji: "🌰", colore: "#7A5C3E", tipo: "bool",  target: 1, attivo: false },
    { id: "cena3h",      label: "Cena entro le 3 ore", nota: "prima di andare a dormire",        emoji: "🌙", colore: "#4A5568", tipo: "bool",  target: 1, attivo: false },
    { id: "b12",         label: "Vitamina B12",  nota: "secondo indicazione medica",             emoji: "💊", colore: "#8E44AD", tipo: "bool",  target: 1, attivo: false }
  ],

  /* --- fonti proteiche: il vero budget settimanale del piano --- */
  fonti: [
    { id: "legumi",     label: "Legumi cotti",        grammi: "130-150 g",  secchi: "40-50 g o pasta di legumi", min: 4, max: 7, colore: "#2F7D6E", visiva: "confezione standard da 150 g, lavare bene" },
    { id: "soia",       label: "Tofu, tempeh, seitan", grammi: "75-125 g",  min: 2, max: 3, colore: "#4A8B3A", visiva: "una monoporzione confezionata" },
    { id: "uova",       label: "Uova",                grammi: "2",          min: 1, max: 3, colore: "#E0A82E", visiva: "due uova intere" },
    { id: "formaggi",   label: "Formaggi",            grammi: "ricotta 100 g, freschi grassi 50-60 g, stagionati 30-40 g, mozzarella 100 g, fiocchi di latte 150 g", min: 0, max: 2, colore: "#C9576B", visiva: "monoporzione o mezza confezione" },
    { id: "burger",     label: "Burger vegetali",     grammi: "~100 g",     min: 0, max: 1, colore: "#8A6FBF", visiva: "una porzione della confezione" },
    { id: "affettati",  label: "Affettati vegani",    grammi: "50-60 g",    min: 0, max: 1, colore: "#B0782A", visiva: "circa metà confezione" }
  ],

  /* --- sostituzioni, tutte equivalenti tra loro --- */
  sostituzioni: {
    "primo piatto (pranzo)": [
      "pasta 100-120 g", "riso, farro, couscous, quinoa, miglio, grano saraceno 100-120 g",
      "farina di mais 100-120 g", "pasta fresca o secca all'uovo", "udon o noodles secchi 100-120 g",
      "due patate medie o grandi (~500 g)", "mezza confezione di gnocchi (250 g)",
      "una piadina con olio EVO (~100 g)", "pane 120-150 g", "pasta di legumi 100% 120-130 g"
    ],
    "pane (cena)": [
      "pane 80-100 g: un panino medio, 3-4 fette", "2 patate medie (350 g)", "una piadina con olio EVO (75 g)"
    ],
    "colazione, quota cereali": [
      "pane 50-60 g", "4 fette biscottate", "cereali 30-40 g", "biscotti 30-40 g",
      "fiocchi d'avena 30-40 g", "farina d'avena ~40 g (per pancake)", "dolce fatto in casa 40-50 g"
    ],
    "colazione, quota proteica": [
      "yogurt bianco 150 g", "yogurt vegetale o greco 0%", "skyr", "Trublend",
      "un bicchiere di latte o latte di soia", "ricotta 60-80 g", "1-2 uova"
    ],
    "colazione, quota grassi o dolce": [
      "frutta secca 10-15 g", "crema di frutta secca 100% 1-2 cucchiaini",
      "cioccolato 10-20 g", "marmellata ~20 g", "crema nocciola 15 g", "miele 10-15 g", "olio EVO 10 g se salata"
    ]
  },

  /* --- riferimenti quantitativi --- */
  riferimenti: [
    { titolo: "Verdura", testo: "Circa 200 g cruda a pasto: 1 peperone piccolo, 2-3 pomodori medi, 3-4 carote, mezza melanzana, 1 finocchio piccolo, 2-3 carciofi, 2-3 zucchine, 7-10 ravanelli, 1-2 cipolle. Per insalata e rucola una ciotola da 80 g, meglio se abbinata a un'altra verdura.", icona: "🥕" },
    { titolo: "Frutta", testo: "2-3 porzioni al giorno da 150 g: un frutto grande, oppure due piccoli, oppure una manciata di frutti rossi. Insieme alla verdura si arriva alle 4-5 porzioni giornaliere raccomandate.", icona: "🍎" },
    { titolo: "Frutta secca", testo: "Almeno 30 g due o tre volte a settimana, che equivalgono a 4-5 noci, 20-25 mandorle, 15 anacardi, 40-45 pistacchi o 3 cucchiaini di crema 100%. Meglio distribuirne 10-20 g al giorno.", icona: "🌰" },
    { titolo: "Omega-3", testo: "Ogni giorno almeno una tra: 10 g di semi di lino o chia macinati, 30 g di noci, un cucchiaio di olio di lino o chia spremuto a freddo, crudo e tenuto in frigo. I semi vanno macinati e crudi, altrimenti servono solo alla regolarità intestinale.", icona: "🐟" },
    { titolo: "Condimenti", testo: "Olio EVO, circa 2 cucchiai al giorno (5-6 cucchiaini), compresi quelli di cottura. Meglio a crudo. Alternative occasionali: una noce di burro, un cucchiaio di maionese, un quarto di avocado.", icona: "🫒" },
    { titolo: "Cereali", testo: "Preferire gli integrali durante la settimana, alternandoli con raffinati, semintegrali o in chicco. Cereali più legumi insieme migliorano la qualità proteica del pasto: pasta e ceci, riso e lenticchie, pane e hummus.", icona: "🌾" },
    { titolo: "Prodotti confezionati", testo: "Burger vegetali, affettati vegetali e piatti pronti restano un'alternativa da una o due volte a settimana, non la base dell'alimentazione.", icona: "📦" },
    { titolo: "Idratazione", testo: "Almeno 2 litri al giorno. Nei mesi freddi vanno bene tisane non zuccherate, in quelli caldi acqua aromatizzata.", icona: "💧" },
    { titolo: "Caffè", testo: "Massimo 2-3 tazzine di espresso al giorno, oppure 4 di moka. Da ridurre in caso di reflusso.", icona: "☕" },
    { titolo: "Alcol", testo: "Nessuna quantità è considerata sicura: la dose sicura è zero. Se consumato, limitarlo a occasioni sporadiche.", icona: "🚫" },
    { titolo: "Attività fisica", testo: "Almeno 150 minuti a settimana di attività aerobica moderata, oppure 75 di intensa, più rinforzo muscolare due volte a settimana. Conta più la regolarità della quantità.", icona: "🏃" },
    { titolo: "Vitamina B12", testo: "Integrazione fortemente consigliata quando carente, con dosaggio da valutare previo esami ematochimici.", icona: "💊" }
  ],

  /* --- indicazioni specifiche per il reflusso --- */
  reflusso: [
    { titolo: "Masticazione", testo: "Masticare bene e con calma è il primo aiuto alla digestione.", icona: "🍽️" },
    { titolo: "Temperatura", testo: "Evitare cibi troppo freddi o troppo caldi. Lo yogurt, quando possibile, fuori dal frigo 30 minuti prima.", icona: "🌡️" },
    { titolo: "Cottura", testo: "Metodi semplici: forno, griglia, umido, lessato, cartoccio, vapore, microonde. Evitare fritture, soffritti e piatti pronti.", icona: "🍳" },
    { titolo: "Verdure più tollerate", testo: "Carote, zucchine, finocchi, cuore di carciofo, melanzane, cavolfiori, broccoli, erbetta cotta, asparagi.", icona: "✅" },
    { titolo: "Verdure da moderare", testo: "Pomodoro, cipolla, aglio, scalogno, porri, crauti, lattuga.", icona: "⚠️" },
    { titolo: "Frutta più tollerata", testo: "Mela, pera, banana, melone, pesca. Meglio come spuntino che dopo i pasti.", icona: "🍐" },
    { titolo: "Acqua ai pasti", testo: "Un litro e mezzo o due al giorno, ma durante i pasti massimo 1-2 bicchieri.", icona: "🥛" },
    { titolo: "Movimento", testo: "Camminata di 10-30 minuti dopo i pasti principali. Sconsigliata invece l'attività intensa, corsa e pesi, che può favorire il reflusso.", icona: "🚶" },
    { titolo: "Sonno", testo: "Dormire con un rialzo di 10-15 gradi dietro la testa, o sul lato sinistro. Andare a letto almeno 3 ore dopo il pasto.", icona: "🌙" },
    { titolo: "Da limitare", testo: "Cibi grassi e fritti, insaccati, formaggi grassi, panna, burro, cioccolato, menta, caffè, tè, alcolici, bevande gassate, agrumi, pomodoro e spezie piccanti.", icona: "🚫" },
    { titolo: "Abitudini", testo: "Non far passare troppe ore tra un pasto e l'altro, tenere in borsa dei cracker secchi. Abbassarsi in squat invece di chinarsi a testa in giù. Evitare vestiti stretti in vita.", icona: "💡" }
  ],

  /* --- le ricette delle note --- */
  ricette: [
    { nome: "Cecina fatta in casa", testo: "Mescolare 50 g di farina di ceci con 150 ml di acqua, l'acqua deve essere il triplo della farina, e un pizzico di sale. Lasciare riposare 2-3 ore. Aggiungere la verdura preferita e cuocere in forno o in padella." },
    { nome: "Pancake alla banana", testo: "Schiacciare una banana fino a renderla cremosa, aggiungere uno o due uova, oppure due o tre cucchiai di yogurt bianco medio denso, e un cucchiaio colmo di farina. Cuocere in padella antiaderente e guarnire con un cucchiaino di crema di frutta secca o un quadratino di cioccolato." },
    { nome: "Cremina di yogurt di soia", testo: "Un vasetto di yogurt di soia da 250 g con un cucchiaino di olio e un po' di sale. Insaporire con erbe aromatiche, per esempio erba cipollina. Accompagna polpette e burger di legumi. Se ne usa metà." },
    { nome: "Tempeh alla mediterranea", testo: "Tagliare 75 g di tempeh a cubetti e sbollentarlo qualche minuto per attenuare l'amarognolo, poi scolarlo bene. In padella scaldare un cucchiaino di olio EVO con poca cipolla tritata, unire tempeh e pomodorini tagliati, sfumare con un cucchiaio di salsa di soia. Cuocere 10-15 minuti finché è dorato. A fine cottura capperi, olive, origano, timo e prezzemolo fresco." },
    { nome: "Seitan alla cacciatora", testo: "Tagliare il seitan a strisce o bocconcini. Scaldare un cucchiaino di olio EVO con poca cipolla tritata, rosolare il seitan qualche minuto. Unire pomodorini o passata, qualche oliva e se graditi i capperi. Profumare con rosmarino e salvia, cuocere a fuoco dolce 10-15 minuti finché il sughetto si restringe." }
  ],

  /* --- la settimana di esempio, usata per i suggerimenti --- */
  settimana: [
    { giorno: "Lunedì",    colazione: "Yogurt greco bianco con un cucchiaino di miele o una porzione di frutta e 2-3 noci", pranzo: { fonte: "soia", piatto: "Noodles 100 g con quadretti di tofu e mix di verdure, zucchine e carote" }, cena: { fonte: "legumi", piatto: "Cecina fatta in casa con verdura, porri o zucchine, e pane" }, spuntini: ["Porzione di frutta", "Frullato con yogurt bianco e frutta"] },
    { giorno: "Martedì",   colazione: "Pane integrale tostato con 2 cucchiai di ricotta, un cucchiaino di miele e 2-3 noci", pranzo: { fonte: "legumi", piatto: "Piadina integrale all'olio EVO 75-100 g con hummus di ceci 150 g fatto in casa e verdure grigliate" }, cena: { fonte: "soia", piatto: "Riso con tempeh alla mediterranea e insalatina mista" }, spuntini: ["Porzione di frutta", "Triangolini di legumi 20-30 g con 2 cucchiaini di hummus"] },
    { giorno: "Mercoledì", colazione: "Un bicchiere di latte con 3-4 biscotti (30-40 g)", pranzo: { fonte: "legumi", piatto: "Pasta 100-120 g con un cucchiaio di pesto e fagioli, più sedano crudo da sgranocchiare mentre cuoce" }, cena: { fonte: "uova", piatto: "Frittata con zucchine e pane, oppure insalata mista con uova sode e pane tostato" }, spuntini: ["Porzione di frutta", "Yogurt Trublend con frutta"] },
    { giorno: "Giovedì",   colazione: "Yogurt bianco con 2-3 biscotti e un cucchiaio di frutta secca (~10 g)", pranzo: { fonte: "formaggi", piatto: "Pasta integrale con sugo di ricotta e verdure, spinaci o zucchine, più un cucchiaino di parmigiano" }, cena: { fonte: "burger", piatto: "Burger vegetale con mix di verdura e patate al forno, con cremina di yogurt di soia" }, spuntini: ["Porzione di frutta, es. melone", "Panino 40 g con hummus"] },
    { giorno: "Venerdì",   colazione: "4 fette biscottate con due cucchiai di ricotta e scaglie di cioccolato", pranzo: { fonte: "legumi", piatto: "Couscous con un cucchiaio di pesto e ceci, più un cucchiaino di parmigiano" }, cena: { fonte: "soia", piatto: "Seitan alla cacciatora con pane e insalatina di finocchio, oppure panino con straccetti di seitan e verdure" }, spuntini: ["Porzione di frutta", "Sorbetto di frutta fatto in casa"] },
    { giorno: "Sabato",    colazione: "Pancake alla banana con un cucchiaino di crema di frutta secca 100%", pranzo: { fonte: "legumi", piatto: "Pasta di farro con crema di piselli e zucchine, più un cucchiaino di parmigiano" }, cena: { fonte: "uova", piatto: "2 uova strapazzate con pane integrale e insalata mista con carote o finocchio" }, spuntini: ["Porzione di frutta", "Uno o due cucchiai di frutta secca (10-20 g)"] },
    { giorno: "Domenica",  colazione: "Yogurt bianco con due o tre biscotti e 2-3 noci", pranzo: { fonte: "formaggi", piatto: "Feta al forno con carote e pane arrostito, oppure gnocchi alla sorrentina gratinati" }, cena: { fonte: "legumi", piatto: "Hummus di fagioli o ceci con verdure a pinzimonio, carote e sedano, e pane" }, spuntini: ["Porzione di frutta", "Crackers"] }
  ],

  /* --- stima di partenza dei target, da far confermare alla nutrizionista --- */
  macro: { proteine: 85, grassi: 80, carboidrati: 265 }
};
