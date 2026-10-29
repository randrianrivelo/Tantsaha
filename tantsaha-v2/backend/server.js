const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// 🔑 CLÉ API OPENWEATHERMAP
const WEATHER_API_KEY = "cfba931ba0c60ea60c7e7c2b8a5549b8";

// 6 Provinces de Madagascar
const PROVINCES = {
    antananarivo: { lat: -18.8792, lon: 47.5079, nom: "Antananarivo", type: "interieur", description: "Renivohitra, Hauts Plateaux" },
    toamasina: { lat: -18.1443, lon: 49.3958, nom: "Toamasina", type: "cotier", description: "Côte Est, Seranan-tsambo lehibe" },
    mahajanga: { lat: -15.7167, lon: 46.3167, nom: "Mahajanga", type: "cotier", description: "Côte Ouest, Canal du Mozambique" },
    fianarantsoa: { lat: -21.4333, lon: 47.0833, nom: "Fianarantsoa", type: "interieur", description: "Hautes Terres du Sud" },
    toliara: { lat: -23.35, lon: 43.6667, nom: "Toliara", type: "cotier", description: "Faritra Atsimo, maina" },
    antsiranana: { lat: -12.2765, lon: 49.2913, nom: "Antsiranana", type: "cotier", description: "Faritra Avaratra, Diego Suarez" }
};

// --- DONNÉES ---
let journal = [];
let culturesActives = []; // Cultures en cours (avec dates)
let culturesPersonnalisees = [];
let notesCalendrier = [];

// Alertes avec compteur
let alertes = [
    { id: 1, type: 'info', titre: '🌱 Tongasoa!', message: 'Tongasoa eto amin\'ny Tantsaha Connect. Ity application ity dia hanampy anao amin\'ny asa fambolena.', date: new Date().toISOString(), lu: false },
    { id: 2, type: 'semis', titre: '🌾 Fotoana famafazana vary', message: 'Efa tonga ny fotoana famafazana vary. Novambra - Desambra no tsara indrindra.', date: new Date().toISOString(), lu: false },
    { id: 3, type: 'cyclone', titre: '🌀 Fampitandremana rivodoza', message: 'Mety hisy rivodoza amin\'ny volana Janoary - Martsa. Miomàna tsara!', date: new Date().toISOString(), lu: false }
];

// Cultures malagasy complètes
const culturesDefaut = [
    {
        id: 1,
        nom: "Riz",
        nomMalagasy: "Vary",
        image: "🌾",
        description: "Voly lehibe indrindra eto Madagasikara. Sakafo fototra ho an'ny Malagasy.",
        saisonSemis: ["Novambra", "Desambra"],
        saisonRecolte: ["Aprily", "Mey"],
        duree: 120,
        conseils: [
            "Safidio ny masomboly tsara kalitao",
            "Asio rano 5-10 cm ny tanimbary",
            "Mandena isan'andro mandritra ny 3 herinandro voalohany",
            "Arovy amin'ny valala sy bibikely hafa",
            "Esory ny ahitra ratsy matetika",
            "Ampiasao zezika voajanahary (tain'omby, tain'akoho)",
            "Jereo raha misy aretin-javamaniry",
            "Jinjao rehefa mavo ny salohim-bary"
        ],
        fahasalamana: "Misy glucide be, tsara ho an'ny hery",
        tpikarakara: "Mila fikarakarana matetika, indrindra ny fandena"
    },
    {
        id: 2,
        nom: "Manioc",
        nomMalagasy: "Mangahazo",
        image: "🥔",
        description: "Voly mora sy mahatanty haintany. Fakany no ihinanana.",
        saisonSemis: ["Septambra", "Oktobra", "Novambra"],
        saisonRecolte: ["Jona", "Jolay", "Aogositra"],
        duree: 240,
        conseils: [
            "Safidio tahon-kazo matanjaka",
            "Tapaho 20-30 cm ny halavany",
            "Atsatoko amin'ny tany malemy",
            "Elanelano 1 metatra ny tsirairay",
            "Tsy mila rano be loatra",
            "Esory ny ravina ambany rehefa maniry",
            "Arovy amin'ny mosarilefy",
            "Jinjao rehefa misy tsipika eo amin'ny tany"
        ],
        fahasalamana: "Misy glucide sy vitamina C",
        tpikarakara: "Mora karakaraina, tsy mila fikarakarana be"
    },
    {
        id: 3,
        nom: "Maïs",
        nomMalagasy: "Katsaka",
        image: "🌽",
        description: "Voly haingana. Sakafo ho an'ny olona sy biby fiompy.",
        saisonSemis: ["Oktobra", "Novambra"],
        saisonRecolte: ["Febroary", "Martsa"],
        duree: 90,
        conseils: [
            "Amboary ny tany aloha",
            "Atsatoko 3-4 cm ny halaliny",
            "Elanelano 30 cm ny tsirairay",
            "Mandena isan'andro raha tsy misy orana",
            "Asio zezika rehefa 30 cm ny haavony",
            "Arovy amin'ny vorona sy totozy",
            "Jinjao rehefa maina ny volony"
        ],
        fahasalamana: "Misy glucide, proteinina, vitamina A",
        tpikarakara: "Mila masoandro be sy rano antonony"
    },
    {
        id: 4,
        nom: "Arachide",
        nomMalagasy: "Voanjo",
        image: "🥜",
        description: "Voly manan-karena proteinina. Ny voany dia ao anaty tany.",
        saisonSemis: ["Novambra", "Desambra"],
        saisonRecolte: ["Martsa", "Aprily"],
        duree: 100,
        conseils: [
            "Mila tany fasika malemy",
            "Atsatoko 5 cm ny halaliny",
            "Elanelano 20 cm ny tsirairay",
            "Tsy tia rano be loatra",
            "Ampirimio ny tany manodidina ny faka",
            "Aza asiany zezika azota be loatra",
            "Jinjao rehefa mavo ny ravina"
        ],
        fahasalamana: "Misy proteinina be, menaka tsara, vitamina E",
        tpikarakara: "Mora volena, tsara ho an'ny tany"
    },
    {
        id: 5,
        nom: "Haricot",
        nomMalagasy: "Tsaramaso",
        image: "🫘",
        description: "Voly haingana sy mora. Misy proteinina be.",
        saisonSemis: ["Martsa", "Aprily", "Mey"],
        saisonRecolte: ["Jona", "Jolay"],
        duree: 60,
        conseils: [
            "Safidio masomboly tsara",
            "Atsatoko 3 cm ny halaliny",
            "Elanelano 15 cm ny tsirairay",
            "Mandena isan'andro fa tsy be loatra",
            "Asio hazo hiakaran'ny tahony",
            "Arovy amin'ny sompanga",
            "Jinjao rehefa maina ny tahony"
        ],
        fahasalamana: "Misy proteinina, fibre, vy",
        tpikarakara: "Haingana, 60 andro monja"
    },
    {
        id: 6,
        nom: "Patate douce",
        nomMalagasy: "Vomanga",
        image: "🍠",
        description: "Voly mora sy masaka haingana. Ny fakany no ihinanana.",
        saisonSemis: ["Aogositra", "Septambra", "Oktobra"],
        saisonRecolte: ["Desambra", "Janoary", "Febroary"],
        duree: 120,
        conseils: [
            "Ampiasao tahony matanjaka",
            "Atsatoko amin'ny tany misondrotra",
            "Elanelano 30 cm ny tsirairay",
            "Tsy mila rano be loatra",
            "Esory ny ahitra ratsy",
            "Jinjao rehefa misy tsipika eo amin'ny tany"
        ],
        fahasalamana: "Misy vitamina A be, glucide",
        tpikarakara: "Mora, tsy mila fikarakarana be"
    },
    {
        id: 7,
        nom: "Tomate",
        nomMalagasy: "Voatabia",
        image: "🍅",
        description: "Legioma fampiasa be amin'ny laoka malagasy.",
        saisonSemis: ["Aprily", "Mey", "Jona"],
        saisonRecolte: ["Jolay", "Aogositra", "Septambra"],
        duree: 75,
        conseils: [
            "Atombohy ao anaty pepiniera",
            "Afindrao rehefa 15 cm ny haavony",
            "Asio hazo tohana",
            "Mandena isan'andro",
            "Esory ny sampana ambany",
            "Arovy amin'ny aretin-javamaniry",
            "Jinjao rehefa mena tanteraka"
        ],
        fahasalamana: "Misy vitamina C, lycopène",
        tpikarakara: "Mila fikarakarana be sy masoandro"
    },
    {
        id: 8,
        nom: "Oignon",
        nomMalagasy: "Tongolo",
        image: "🧅",
        description: "Zava-manitra fampiasa amin'ny laoka.",
        saisonSemis: ["Aprily", "Mey"],
        saisonRecolte: ["Aogositra", "Septambra"],
        duree: 120,
        conseils: [
            "Atombohy ao anaty pepiniera",
            "Afindrao rehefa 10 cm ny haavony",
            "Elanelano 10 cm ny tsirairay",
            "Mandena antonony",
            "Esory ny ahitra ratsy matetika",
            "Jinjao rehefa miankina ny ravina"
        ],
        fahasalamana: "Misy vitamina C, antibiotika voajanahary",
        tpikarakara: "Mila tany tsara sy fikarakarana matetika"
    },
    {
        id: 9,
        nom: "Banane",
        nomMalagasy: "Akondro",
        image: "🍌",
        description: "Voankazo be mpitia. Misy karazany maro.",
        saisonSemis: ["Oktobra", "Novambra"],
        saisonRecolte: ["Mandavan-taona"],
        duree: 365,
        conseils: [
            "Safidio zanak'akondro matanjaka",
            "Lavaka 50x50x50 cm",
            "Asio zezika ao anaty lavaka",
            "Mandena matetika indrindra rehefa maina",
            "Esory ny ravina maina",
            "Tohàny raha mavesatra ny voany",
            "Jinjao rehefa mavo ny voany"
        ],
        fahasalamana: "Misy potasioma, vitamina B6",
        tpikarakara: "Mila fikarakarana mandavan-taona"
    },
    {
        id: 10,
        nom: "Canne à sucre",
        nomMalagasy: "Fary",
        image: "🎋",
        description: "Voly fanaovana siramamy sy toaka gasy.",
        saisonSemis: ["Septambra", "Oktobra"],
        saisonRecolte: ["Jolay", "Aogositra"],
        duree: 300,
        conseils: [
            "Safidio tahon-kary matanjaka",
            "Atsatoko 10 cm ny halaliny",
            "Elanelano 1.5 metatra ny andalana",
            "Mandena matetika",
            "Ampirimio ny tany",
            "Esory ny ravina maina",
            "Jinjao rehefa 10-12 volana"
        ],
        fahasalamana: "Misy siramamy voajanahary",
        tpikarakara: "Mila rano be sy masoandro"
    }
];

const conseilsGeneraux = [
    { 
        id: 1, 
        categorie: "formation", // Nouvelle catégorie
        titre: "🎓 Fianarana: Teknika Vary (SRI/SRA)", 
        contenu: `Ity ny povokan'ny paikady nasionaly (NRDS) hampitomboana ny voka-bary:

1️⃣ FIFIDIANANA MASOMBOLY (Semences)
• Mampiasà masomboly voafantina (G4, X265, na hibrida) fa tsy vary vidiana eny an-tsena.
• Aloubo rano 24 ora ny vary, dia avela hitsimoka 24-48 ora alohan'ny hamafazana.

2️⃣ KETSA (Pépinière)
• Manaova tanin-ketsa amin'ny toerana maina sy masoandro.
• Aza atao matevina loatra ny famafazana (tokony ho 1kg isaky ny 1 are).
• Zezika: Asio taim-bakona na zezika organika ny tanin-ketsa.

3️⃣ FAMINDRANA (Repiquage)
• SRI (Vary Maro Anaka): Afindrao rehefa kely ny ketsa (8-15 andro, ravina 2).
• SRA (Varyhatsara): Afindrao rehefa 20-25 andro.
• Tira-ketsa: 1 isaky ny tœ (SRI) na 2-3 (SRA).
• Elanelana: Ataovy milahatra (Liro) 25cm x 25cm mba hazahoana rivotra.

4️⃣ RANO SY ZEZIKA
• Rano: Tsy voatery ho dibo-drano foana. Aleo atao "Maina-Lena" (Gestion de l'eau) mba hiasa ny faka.
• Zezika: Asio NPK (11-22-16) rehefa mamindra, ary Urea rehefa maniry sy miteraka ny vary.
• Sarclo: Ilaina ny manaisotra ahitra amin'ny sarclo mba hifoka rivotra ny tany.

5️⃣ FIJINJANA
• Jinjao rehefa mavo 85% ny salohy. Aza avela ho maina loatra eny an-tsaha fa hihintsana.
• Amainina tsara alohan'ny hitahirizana.`,
        audioKey: "guide_vary" // Tu pourras enregistrer cet audio plus tard
    },
    { id: 2, categorie: "parasite", titre: "🐛 Fiadiana amin'ny bibikely", contenu: "Ampiasao menaka neem na savony rano. Azonao atao koa ny manisy lavenona manodidina ny zavamaniry." },
    { id: 3, categorie: "engrais", titre: "💩 Zezika voajanahary", contenu: "Ny tain'omby, tain'akoho, tain'ondry dia zezika tsara indrindra. Avelao ho lo 2-3 volana aloha vao ampiasaina." },
    { id: 4, categorie: "arrosage", titre: "💧 Fandena", contenu: "Mandena maraina (6-8 ora) na hariva (17-18 ora). Aza mandena amin'ny mitataovovonana fa may ny ravina." },
    { id: 5, categorie: "tany", titre: "🌍 Fikarakarana ny tany", contenu: "Asiho zezika isan-taona. Avadibadio ny voly (rotation) mba tsy ho lany hery ny tany." },
    { id: 6, categorie: "volana", titre: "🌙 Famafazana araka ny volana", contenu: "Ny fotoana tsara indrindra famafazana dia rehefa mitombo ny volana. Ny fijinjana kosa tsara amin'ny volana mihena." }
];

// --- ROUTES ---

app.get('/', (req, res) => res.send('🌿 Tantsaha Backend v4.0 - Complète'));

// 📍 PROVINCES
app.get('/meteo/provinces', (req, res) => {
    res.json(Object.entries(PROVINCES).map(([id, data]) => ({
        id, nom: data.nom, type: data.type, description: data.description
    })));
});

// 🌤️ MÉTÉO
app.get('/meteo', async (req, res) => {
    const provinceId = req.query.province || 'antananarivo';
    const province = PROVINCES[provinceId.toLowerCase()] || PROVINCES.antananarivo;
    
    try {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${province.lat}&lon=${province.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`;
        const currentResponse = await axios.get(currentUrl);
        const current = currentResponse.data;

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${province.lat}&lon=${province.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`;
        const forecastResponse = await axios.get(forecastUrl);
        
        const joursVus = new Set();
        const joursMalagasy = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Sabotsy'];
        const previsions = [];
        
        forecastResponse.data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const jourKey = date.toDateString();
            const heure = date.getHours();
            
            if (!joursVus.has(jourKey) && heure >= 11 && heure <= 14 && previsions.length < 5) {
                joursVus.add(jourKey);
                previsions.push({
                    jour: joursMalagasy[date.getDay()],
                    date: date.toLocaleDateString('fr-FR'),
                    temperature: Math.round(item.main.temp),
                    icon: getWeatherIcon(item.weather[0].main),
                    description: item.weather[0].description,
                    pluie: item.weather[0].main === 'Rain' || item.weather[0].main === 'Thunderstorm'
                });
            }
        });

        const meteoData = {
            province: province.nom,
            type: province.type,
            description: province.description,
            date: new Date().toISOString(),
            temperature: Math.round(current.main.temp),
            tempMin: Math.round(current.main.temp_min),
            tempMax: Math.round(current.main.temp_max),
            humidite: current.main.humidity,
            vent: Math.round(current.wind.speed * 3.6),
            directionVent: getWindDirection(current.wind.deg),
            descriptionMeteo: current.weather[0].description,
            icon: getWeatherIcon(current.weather[0].main),
            pluie: current.weather[0].main === 'Rain' || current.weather[0].main === 'Thunderstorm',
            previsions: previsions,
            conseilAgricole: getConseilAgricole(current.weather[0].main, current.main.temp)
        };

        if (province.type === 'cotier') {
            meteoData.maritime = {
                hauteurVagues: Math.round((current.wind.speed * 0.3) * 10) / 10 + " m",
                maree: getMareeEstimee(),
                temperatureEau: Math.round(current.main.temp + 2),
                conseil: getConseilMaritime(current.wind.speed)
            };
        }

        res.json(meteoData);
    } catch (error) {
        console.log('Erreur API météo:', error.message);
        res.json({
            province: province.nom, type: province.type, description: province.description,
            date: new Date().toISOString(), temperature: 25, tempMin: 18, tempMax: 30,
            humidite: 70, vent: 15, descriptionMeteo: "Tsy afaka naka vaovao",
            icon: "❓", pluie: false, previsions: [], erreur: true,
            messageErreur: "Hamarino ny clé API na ny connexion internet"
        });
    }
});

// 🌾 CULTURES
app.get('/cultures', (req, res) => {
    res.json([...culturesDefaut, ...culturesPersonnalisees]);
});

app.get('/cultures/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const culture = [...culturesDefaut, ...culturesPersonnalisees].find(c => c.id === id);
    if (!culture) return res.status(404).json({ message: "Tsy hita ny voly" });
    res.json(culture);
});

app.post('/cultures', (req, res) => {
    const { nomMalagasy, description, duree, saisonSemis, saisonRecolte } = req.body;
    const nouvelleCulture = {
        id: Date.now(),
        nom: nomMalagasy,
        nomMalagasy,
        image: "🌿",
        description: description || "Voly nataon'ny mpampiasa",
        saisonSemis: saisonSemis || [],
        saisonRecolte: saisonRecolte || [],
        duree: parseInt(duree) || 90,
        conseils: genererConseils(nomMalagasy),
        personnalise: true
    };
    culturesPersonnalisees.push(nouvelleCulture);
    res.status(201).json(nouvelleCulture);
});

app.delete('/cultures/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = culturesPersonnalisees.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ message: "Tsy azo fafana" });
    culturesPersonnalisees.splice(index, 1);
    res.json({ success: true });
});

// 🌱 CULTURES ACTIVES (en cours de croissance)
app.get('/cultures-actives', (req, res) => {
    const now = new Date();
    const actives = culturesActives.map(ca => {
        const dateDebut = new Date(ca.dateDebut);
        const dateFin = new Date(ca.dateFin);
        const joursEcoules = Math.floor((now - dateDebut) / (1000 * 60 * 60 * 24));
        const joursRestants = Math.max(0, Math.floor((dateFin - now) / (1000 * 60 * 60 * 24)));
        const progression = Math.min(100, Math.round((joursEcoules / ca.dureeTotale) * 100));
        const pret = joursRestants === 0;
        
        return { ...ca, joursEcoules, joursRestants, progression, pret };
    });
    res.json(actives);
});

app.post('/cultures-actives/hamafy', (req, res) => {
    const { cultureId, cultureName, duree } = req.body;
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + duree);
    
    const nouvelleActive = {
        id: Date.now(),
        cultureId,
        cultureName,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        dureeTotale: duree,
        status: 'en_cours'
    };
    
    culturesActives.push(nouvelleActive);
    
    // Créer une alerte de rappel
    alertes.unshift({
        id: Date.now() + 1,
        type: 'semis',
        titre: `🌱 ${cultureName} - Voafafy!`,
        message: `Efa voafafy ny ${cultureName}. Ho masaka afaka ${duree} andro.`,
        date: new Date().toISOString(),
        lu: false
    });
    
    res.status(201).json(nouvelleActive);
});

app.post('/cultures-actives/mampiakatra/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = culturesActives.findIndex(ca => ca.id === id);
    if (index === -1) return res.status(404).json({ message: "Tsy hita" });
    
    const culture = culturesActives[index];
    culturesActives.splice(index, 1);
    
    // Ajouter au journal
    journal.unshift({
        id: Date.now(),
        type: 'recolte',
        icon: '🌾',
        titre: `Vokatra ${culture.cultureName}`,
        description: `Nahavita nijinja ny ${culture.cultureName}`,
        date: new Date().toISOString()
    });
    
    // Créer une alerte
    alertes.unshift({
        id: Date.now() + 1,
        type: 'recolte',
        titre: `🌾 ${culture.cultureName} - Voajinja!`,
        message: `Tonga soa ny vokatra ${culture.cultureName}! Arahabaina!`,
        date: new Date().toISOString(),
        lu: false
    });
    
    res.json({ success: true, message: `${culture.cultureName} voajinja` });
});

// 📖 JOURNAL (Tati-boly) amélioré
app.get('/journal', (req, res) => res.json(journal));

app.post('/journal', (req, res) => {
    const { type, icon, titre, description, voly, quantite } = req.body;
    const entry = {
        id: Date.now(),
        type: type || 'note',
        icon: icon || '📝',
        titre: titre || 'Fanamarihana',
        description: description || '',
        voly: voly || null,
        quantite: quantite || null,
        date: new Date().toISOString(),
        dateMalagasy: getDateMalagasy(new Date())
    };
    journal.unshift(entry);
    res.status(201).json(entry);
});

app.delete('/journal/:id', (req, res) => {
    journal = journal.filter(j => j.id !== parseInt(req.params.id));
    res.json({ success: true });
});

// ⚠️ ALERTES avec compteur
app.get('/alerts', (req, res) => res.json(alertes));

app.get('/alerts/count', (req, res) => {
    const nonLues = alertes.filter(a => !a.lu).length;
    res.json({ count: nonLues });
});

app.patch('/alerts/:id/lu', (req, res) => {
    const id = parseInt(req.params.id);
    const alerte = alertes.find(a => a.id === id);
    if (alerte) alerte.lu = true;
    res.json({ success: true });
});

app.patch('/alerts/tout-lu', (req, res) => {
    alertes.forEach(a => a.lu = true);
    res.json({ success: true });
});

// 💡 CONSEILS
app.get('/conseils', (req, res) => res.json(conseilsGeneraux));

// 📅 CALENDRIER
app.get('/calendrier', (req, res) => {
    res.json([
        { saison: "Lohataona (Printemps)", mois: ["Septambra", "Oktobra", "Novambra"], icon: "🌱", color: "#43E97B", activites: ["Fanomanana ny tany", "Famafazana mangahazo sy katsaka", "Fanadiovana ny tanimbary"] },
        { saison: "Fahavaratra (Été - Orana)", mois: ["Desambra", "Janoary", "Febroary"], icon: "🌧️", color: "#4FACFE", activites: ["Famafazana vary", "Fikarakarana ny voly", "Fiarovana amin'ny rivodoza"] },
        { saison: "Fararano (Automne)", mois: ["Martsa", "Aprily", "Mey"], icon: "🌾", color: "#F5AF19", activites: ["Fijinjana vary", "Fijinjana katsaka", "Fitahirizana vokatra"] },
        { saison: "Ririnina (Hiver - Maina)", mois: ["Jona", "Jolay", "Aogositra"], icon: "☀️", color: "#FA709A", activites: ["Fijinjana mangahazo", "Fivarotana vokatra", "Fanomanana ho an'ny taom-pambolena manaraka"] }
    ]);
});

// 📅 NOTES CALENDRIER
app.get('/calendrier/notes', (req, res) => {
    const { mois, taona } = req.query;
    let notes = notesCalendrier;
    if (mois && taona) {
        notes = notes.filter(n => {
            const d = new Date(n.date);
            return d.getMonth() + 1 === parseInt(mois) && d.getFullYear() === parseInt(taona);
        });
    }
    res.json(notes);
});

app.post('/calendrier/notes', (req, res) => {
    const { date, titre, contenu } = req.body;
    const note = {
        id: Date.now(),
        date,
        titre: titre || 'Fanamarihana',
        contenu: contenu || '',
        createdAt: new Date().toISOString()
    };
    notesCalendrier.push(note);
    res.status(201).json(note);
});

app.delete('/calendrier/notes/:id', (req, res) => {
    notesCalendrier = notesCalendrier.filter(n => n.id !== parseInt(req.params.id));
    res.json({ success: true });
});

// --- FONCTIONS UTILITAIRES ---
function getWeatherIcon(weatherMain) {
    const icons = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Fog': '🌫️' };
    return icons[weatherMain] || '🌤️';
}

function getWindDirection(deg) {
    const directions = ['Avaratra', 'Avaratra-Atsinanana', 'Atsinanana', 'Atsimo-Atsinanana', 'Atsimo', 'Atsimo-Andrefana', 'Andrefana', 'Avaratra-Andrefana'];
    return directions[Math.round(deg / 45) % 8];
}

function getMareeEstimee() {
    const heure = new Date().getHours();
    if (heure >= 6 && heure < 12) return "Miakatra";
    if (heure >= 12 && heure < 18) return "Ambony";
    if (heure >= 18 && heure < 24) return "Midina";
    return "Ambany";
}

function getConseilMaritime(windSpeed) {
    if (windSpeed > 15) return "⚠️ Aza mandeha an-dranomasina - Rivotra mahery!";
    if (windSpeed > 10) return "⚠️ Mitandrema - Mety hisy onja be";
    return "✅ Azo andehanana ny ranomasina";
}

function getConseilAgricole(weather, temp) {
    if (weather === 'Rain' || weather === 'Thunderstorm') return "🌧️ Hisy orana! Aza manadino ny mitahiry ny vokatra ao anaty trano. Fotoana tsara hanomezana zezika.";
    if (temp > 35) return "🔥 Mafana be! Mandena ny voly maraina (5-7 ora) na hariva (17-18 ora). Saronana ny zanak'anana.";
    if (temp < 15) return "❄️ Mangatsiaka! Saronana ny voly raha ilaina. Aza mandena be loatra.";
    return "☀️ Tsara ny andro! Fotoana mety tsara hiasana eny an-tsaha sy hanadio ny ahitra.";
}

function genererConseils(nomCulture) {
    return [
        `Safidio masomboly tsara kalitao ho an'ny ${nomCulture}`,
        `Mandena ny ${nomCulture} isan'andro raha maina ny tany`,
        `Arovy ny ${nomCulture} amin'ny bibikely sy aretin-javamaniry`,
        `Asio zezika voajanahary (tain'omby na tain'akoho)`,
        `Esory ny ahitra ratsy matetika`,
        `Jereo matetika ny fahasalaman'ny ravina`
    ];
}

function getDateMalagasy(date) {
    const joursMalagasy = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Sabotsy'];
    const volana = ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'];
    return `${joursMalagasy[date.getDay()]}, ${date.getDate()} ${volana[date.getMonth()]} ${date.getFullYear()}`;
}

// Démarrage
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 Tantsaha Backend v4.0 - Complète`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌤️ API Météo: ${WEATHER_API_KEY !== "METS_TA_CLE_API_ICI" ? '✅' : '⚠️ CLÉ MANQUANTE'}`);
});