-- Italian curriculum pack: a CEFR-aligned track for dialect 'it'.
-- Three courses (A1 Foundations, A2 Everyday life, B1 Confident conversations),
-- 10 lessons each. Fixed UUIDs make re-runs idempotent: courses use
-- `on conflict (id) do nothing`, lessons are guarded by a `where not exists`
-- on (course_id, position).

-- ============ Italian A1 — Foundations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0003-0000-4000-8000-000000000001',
  'it', 'it',
  'Italian A1 — Foundations',
  'Introduce yourself, handle numbers and prices, order at the bar and the trattoria, and talk about your day.',
  'A1', 'daily_life', 10, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0003-0000-4000-8000-000000000001', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Introducing yourself', 'vocab',
   '{"items":[
      {"term":"Come ti chiami?","translation":"What''s your name? (informal)","ipa":"ˈko.me ti ˈkja.mi","example":"Ciao! Come ti chiami?"},
      {"term":"Mi chiamo Luca","translation":"My name is Luca","ipa":"mi ˈkja.mo","example":"Mi chiamo Luca, e tu?"},
      {"term":"Sono di Napoli","translation":"I''m from Naples","example":"Sono di Napoli, ma vivo a Milano."},
      {"term":"Ho trent''anni","translation":"I''m thirty years old","example":"Ho trent''anni e faccio l''insegnante."},
      {"term":"Piacere di conoscerti","translation":"Nice to meet you (informal)","ipa":"pjaˈtʃe.re","example":"Piacere di conoscerti, Anna!"}
   ]}',
   'Age uses *avere*, not *essere*: *ho trent''anni* is literally "I have thirty years".', 8),
  (2, 'Numbers & prices', 'vocab',
   '{"items":[
      {"term":"Quanto costa?","translation":"How much does it cost?","ipa":"ˈkwan.to ˈkɔ.sta","example":"Scusi, quanto costa questo formaggio?"},
      {"term":"trenta, quaranta, cinquanta","translation":"thirty, forty, fifty","example":"La giacca costa cinquanta euro."},
      {"term":"cento","translation":"one hundred","ipa":"ˈtʃɛn.to","example":"Cento grammi di parmigiano, per favore."},
      {"term":"due euro e cinquanta","translation":"two euros fifty","example":"Un cappuccino? Due euro e cinquanta."},
      {"term":"il resto","translation":"the change","ipa":"il ˈrɛ.sto","example":"Ecco il resto: cinque euro."}
   ]}',
   'Prices are read with *e* between euros and cents: *due euro e cinquanta* = 2.50.', 8),
  (3, 'At the bar', 'roleplay',
   '{"scenario":"A busy bar in Milan at 8am. Order an espresso and a cornetto at the counter, ask how much it is, and pay at the cassa like a local.","persona":"Fast-talking Milanese barista who appreciates customers who know the routine","goal":"Order, ask the price, and pay entirely in Italian"}',
   null, 10),
  (4, 'Essere, avere, andare', 'grammar',
   '{"sections":[
      {"heading":"Essere — to be","text":"*Essere* is irregular: *sono, sei, è, siamo, siete, sono*. Use it for identity, origin, and description: *Sono italiano*, *Sei di Roma?*, *Marta è simpatica*. Note that *sono* is both \"I am\" and \"they are\" — context tells you which."},
      {"heading":"Avere — to have","text":"*Avere* runs *ho, hai, ha, abbiamo, avete, hanno*. The h is silent: *ho* sounds like \"o\". Beyond possession, Italian uses *avere* where English uses \"to be\": *ho fame* (I''m hungry), *ho sete* (I''m thirsty), *ho vent''anni* (I''m twenty)."},
      {"heading":"Andare — to go","text":"*Andare* is the most useful irregular verb of motion: *vado, vai, va, andiamo, andate, vanno*. Pair it with *a* for cities and *in* for countries and regions: *vado a Roma*, *andiamo in Sicilia*. *Come va?* — literally \"how does it go?\" — is everyday for \"how are you?\"."}
   ]}',
   null, 12),
  (5, 'Daily routines', 'vocab',
   '{"items":[
      {"term":"mi sveglio","translation":"I wake up","ipa":"mi ˈzveʎ.ʎo","example":"Mi sveglio alle sette ogni giorno."},
      {"term":"faccio colazione","translation":"I have breakfast","example":"Faccio colazione al bar sotto casa."},
      {"term":"vado al lavoro","translation":"I go to work","example":"Vado al lavoro in autobus."},
      {"term":"torno a casa","translation":"I come back home","example":"Torno a casa alle sei di sera."},
      {"term":"vado a letto","translation":"I go to bed","example":"Vado a letto a mezzanotte, troppo tardi!"}
   ]}',
   'Reflexive verbs like *svegliarsi* need the pronoun: *mi sveglio*, *ti svegli*, *si sveglia*.', 8),
  (6, 'At the trattoria', 'vocab',
   '{"items":[
      {"term":"il menù","translation":"the menu","ipa":"il meˈnu","example":"Possiamo vedere il menù, per favore?"},
      {"term":"un primo, un secondo","translation":"a first course, a main course","example":"Come primo prendo gli spaghetti alle vongole."},
      {"term":"l''acqua naturale","translation":"still water","example":"Una bottiglia d''acqua naturale, grazie."},
      {"term":"il conto, per favore","translation":"the bill, please","ipa":"il ˈkon.to","example":"Scusi, il conto, per favore."},
      {"term":"il coperto","translation":"the cover charge","example":"Il coperto è due euro a persona."}
   ]}',
   'An Italian menu runs *antipasto → primo → secondo → dolce*; the *coperto* on the bill is normal, not a mistake.', 8),
  (7, 'Dinner at the trattoria', 'roleplay',
   '{"scenario":"A family-run trattoria in Bologna. Ask what the waiter recommends, order a primo and a drink, then ask for the bill and check whether the coperto is included.","persona":"Warm Bolognese waiter, very proud of the handmade tagliatelle","goal":"Get through the whole meal — recommendation, order, bill — without English"}',
   null, 10),
  (8, 'Shopping essentials', 'vocab',
   '{"items":[
      {"term":"vorrei","translation":"I would like","ipa":"vorˈrɛi","example":"Vorrei un chilo di pomodori, per favore."},
      {"term":"un etto","translation":"100 grams","ipa":"un ˈɛt.to","example":"Un etto di prosciutto crudo, grazie."},
      {"term":"Che taglia porta?","translation":"What size do you wear?","example":"Che taglia porta? La media?"},
      {"term":"Posso provarlo?","translation":"Can I try it on?","example":"Mi piace questa giacca: posso provarla?"},
      {"term":"Lo prendo","translation":"I''ll take it","example":"Perfetto, lo prendo. Quanto costa?"}
   ]}',
   '*Vorrei* is the polite conditional of *volere* — always softer than *voglio* when asking for things.', 8),
  (9, 'Reading: una giornata di Marta', 'reading',
   '{"sections":[
      {"heading":"Il testo","text":"*Marta si sveglia alle sette e fa colazione al bar: un cappuccino e un cornetto. Alle otto va al lavoro in bicicletta. A pranzo mangia un panino con una collega. La sera torna a casa, cucina la pasta e guarda un film. A mezzanotte va a letto.* Read it twice: first for the general picture, then sentence by sentence."},
      {"heading":"Key phrases","text":"*Si sveglia* — she wakes up (reflexive, third person). *Fa colazione* — she has breakfast; Italian uses *fare*, literally \"to do breakfast\". *Va al lavoro in bicicletta* — note *in* + vehicle: *in bicicletta, in autobus, in treno*."},
      {"heading":"Check yourself","text":"Without looking back, answer in Italian: at what time does Marta wake up? How does she get to work? What does she do in the evening? If you can answer *alle sette*, *in bicicletta*, and *cucina la pasta e guarda un film*, you have the whole story."}
   ]}',
   null, 9),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"How do you ask someone''s name informally?","options":["Quanto costa?","Come ti chiami?","Dove vai?","Che ore sono?"],"answer":1,"explanation":"Come ti chiami? = what''s your name (informal); the formal version is Come si chiama?"},
      {"prompt":"Complete: Io ___ trent''anni.","options":["sono","ho","vado","sei"],"answer":1,"explanation":"Age takes avere: ho trent''anni, literally \"I have thirty years\"."},
      {"prompt":"\"Il conto, per favore\" means…","options":["The menu, please","The bill, please","The change, please","The water, please"],"answer":1,"explanation":"Il conto = the bill; the menu is il menù, the change is il resto."},
      {"prompt":"Which is the present of *andare* for \"noi\"?","options":["vado","vanno","andiamo","andate"],"answer":2,"explanation":"Andare: vado, vai, va, andiamo, andate, vanno."},
      {"prompt":"At the market, \"un etto\" is…","options":["one kilo","100 grams","a dozen","one slice"],"answer":1,"explanation":"Un etto = un ettogrammo = 100 g, the standard unit for cold cuts and cheese."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0003-0000-4000-8000-000000000001' and l.position = v.pos
);

-- ============ Italian A2 — Everyday life ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0003-0000-4000-8000-000000000002',
  'it', 'it',
  'Italian A2 — Everyday life',
  'Talk about the past, make plans, handle the pharmacy and the train station, and hold your own in work small talk.',
  'A2', 'daily_life', 11, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0003-0000-4000-8000-000000000002', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'The passato prossimo', 'grammar',
   '{"sections":[
      {"heading":"Building the tense","text":"The *passato prossimo* is Italian''s everyday past: an auxiliary (*avere* or *essere*) plus a past participle. Regular participles end in *-ato, -uto, -ito*: *parlare → parlato*, *vendere → venduto*, *dormire → dormito*. So: *ho parlato con Marco* — I spoke with Marco."},
      {"heading":"Avere or essere?","text":"Most verbs take *avere*: *ho mangiato*, *hai visto*, *abbiamo comprato*. Verbs of movement and change of state take *essere*: *sono andato*, *è arrivata*, *siamo partiti*. With *essere*, the participle agrees with the subject: *Maria è andata*, *i ragazzi sono andati*."},
      {"heading":"Irregular participles to memorize","text":"The most common verbs are irregular: *fare → fatto*, *dire → detto*, *leggere → letto*, *scrivere → scritto*, *vedere → visto*, *prendere → preso*, *essere/stare → stato*. *Cosa hai fatto ieri?* — what did you do yesterday? — is the question you will hear most."}
   ]}',
   null, 12),
  (2, 'Making plans', 'vocab',
   '{"items":[
      {"term":"Che fai stasera?","translation":"What are you doing tonight?","ipa":"ke ˈfai staˈse.ra","example":"Che fai stasera? C''è un concerto in piazza."},
      {"term":"Ti va di…?","translation":"Do you feel like…?","example":"Ti va di andare al cinema sabato?"},
      {"term":"Ci vediamo alle otto","translation":"See you at eight","example":"Perfetto, ci vediamo alle otto davanti al bar."},
      {"term":"Mi dispiace, non posso","translation":"I''m sorry, I can''t","example":"Mi dispiace, non posso: lavoro fino a tardi."},
      {"term":"Facciamo domani?","translation":"Shall we say tomorrow?","example":"Stasera è difficile… facciamo domani?"}
   ]}',
   '*Ti va di* + infinitive is the natural way to propose something: *ti va di uscire?*', 8),
  (3, 'Weekend plans with a friend', 'roleplay',
   '{"scenario":"Your Italian friend calls to plan the weekend. Propose something to do, negotiate day and time, and agree on where to meet. One of your first two proposals will not work for them.","persona":"Chatty friend from Verona with a busy schedule and strong opinions about aperitivo spots","goal":"Agree on an activity, a time, and a meeting point"}',
   null, 10),
  (4, 'Pharmacy & doctor', 'vocab',
   '{"items":[
      {"term":"Mi fa male la testa","translation":"My head hurts","ipa":"mi fa ˈma.le la ˈtɛ.sta","example":"Mi fa male la testa da stamattina."},
      {"term":"Ho la febbre","translation":"I have a fever","ipa":"ˈfɛb.bre","example":"Ho la febbre: trentotto e mezzo."},
      {"term":"qualcosa per il raffreddore","translation":"something for a cold","example":"Avete qualcosa per il raffreddore?"},
      {"term":"la ricetta","translation":"the prescription","ipa":"riˈtʃɛt.ta","example":"Per questo farmaco serve la ricetta."},
      {"term":"due volte al giorno","translation":"twice a day","example":"Prenda una compressa due volte al giorno, dopo i pasti."}
   ]}',
   'Body aches use *fare male*: *mi fa male la testa*, *mi fanno male le gambe* (plural verb for plural body parts).', 8),
  (5, 'At the pharmacy', 'roleplay',
   '{"scenario":"A pharmacy in Turin. You have had a sore throat and a cough for two days. Describe the symptoms, answer the pharmacist''s questions, and make sure you understand the dosage before leaving.","persona":"Thorough, kind pharmacist who asks follow-up questions and speaks no English","goal":"Get a suitable remedy and repeat the dosage instructions correctly"}',
   null, 10),
  (6, 'Imperfetto vs passato prossimo', 'grammar',
   '{"sections":[
      {"heading":"The imperfetto","text":"The *imperfetto* is regular and friendly: *parlavo, parlavi, parlava, parlavamo, parlavate, parlavano*. Only *essere* misbehaves: *ero, eri, era…* Use it for habits, descriptions, and background: *da bambino andavo al mare ogni estate* — as a child I used to go to the seaside every summer."},
      {"heading":"Two pasts, two jobs","text":"The *passato prossimo* reports completed events: *ieri ho visto Paolo*. The *imperfetto* paints the scene around them: *pioveva, ero stanco, non avevo voglia di uscire*. English hides the difference; Italian insists on it."},
      {"heading":"Putting them together","text":"A natural sentence often uses both: *Mentre facevo la spesa, ho incontrato Giulia* — while I was doing the shopping (background, imperfetto), I ran into Giulia (event, passato prossimo). If you can ask \"what was going on?\" it''s imperfetto; if you can ask \"what happened next?\" it''s passato prossimo."}
   ]}',
   null, 12),
  (7, 'Work small talk', 'vocab',
   '{"items":[
      {"term":"Di cosa ti occupi?","translation":"What do you do for work?","example":"Di cosa ti occupi? Io lavoro nel marketing."},
      {"term":"Com''è andato il weekend?","translation":"How was your weekend?","example":"Ciao Sara! Com''è andato il weekend?"},
      {"term":"una riunione","translation":"a meeting","ipa":"riuˈnjo.ne","example":"Ho una riunione alle dieci, ci sentiamo dopo."},
      {"term":"Facciamo una pausa caffè?","translation":"Shall we take a coffee break?","example":"Sono le undici… facciamo una pausa caffè?"},
      {"term":"Buon lavoro!","translation":"Have a good workday!","example":"Io vado. Buon lavoro a tutti!"}
   ]}',
   '*Buon lavoro!* has no real English equivalent — it wishes someone a good work session and is used constantly.', 8),
  (8, 'Trains & transport', 'vocab',
   '{"items":[
      {"term":"un biglietto per Firenze","translation":"a ticket to Florence","example":"Un biglietto per Firenze, solo andata, per favore."},
      {"term":"il binario","translation":"the platform / track","ipa":"biˈna.rjo","example":"Il treno per Roma parte dal binario tre."},
      {"term":"la coincidenza","translation":"the connection","example":"Ho perso la coincidenza a Bologna."},
      {"term":"convalidare il biglietto","translation":"to validate the ticket","example":"Devi convalidare il biglietto prima di salire sul regionale."},
      {"term":"in ritardo","translation":"late / delayed","example":"Il regionale è in ritardo di dieci minuti."}
   ]}',
   'On regional trains a paper ticket must be validated (*convalidato*) before boarding — skipping it means a fine.', 8),
  (9, 'Writing: il mio weekend', 'writing',
   '{"sections":[
      {"heading":"The task","text":"Write 8–10 sentences about last weekend, real or invented. Mix the two past tenses on purpose: use the *imperfetto* for the weather, your mood, and the setting, and the *passato prossimo* for what actually happened."},
      {"heading":"Building blocks","text":"Openers that help: *Sabato mattina…*, *Nel pomeriggio…*, *La sera…*, *Domenica invece…* Useful verbs: *sono uscito/a*, *ho incontrato*, *abbiamo mangiato*, *faceva caldo*, *ero stanco/a*, *c''era molta gente*."},
      {"heading":"Check before you finish","text":"Read your text and ask three questions: does every *essere* participle agree with the subject (*Maria è tornata*)? Did you use at least three imperfetto forms for background? Did you connect sentences with *poi*, *dopo*, *mentre*, *invece* rather than starting each one from zero?"}
   ]}',
   null, 12),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Passato prossimo of \"andare\" for \"lei\" (she):","options":["ha andato","è andata","andava","è andato"],"answer":1,"explanation":"Andare takes essere, and the participle agrees: lei è andata."},
      {"prompt":"Which tense paints the background of a story?","options":["passato prossimo","imperfetto","futuro","condizionale"],"answer":1,"explanation":"The imperfetto describes scene, habits, and states; events use the passato prossimo."},
      {"prompt":"\"Ti va di venire?\" means…","options":["Are you leaving?","Do you feel like coming?","Can you drive?","Did you come?"],"answer":1,"explanation":"Ti va di + infinitive = do you feel like doing something."},
      {"prompt":"At the pharmacy, \"la ricetta\" is…","options":["the receipt","the recipe","the prescription","the refund"],"answer":2,"explanation":"False friend: at the pharmacy la ricetta is the doctor''s prescription (in the kitchen it does mean recipe)."},
      {"prompt":"Complete: Da bambino ___ al mare ogni estate.","options":["sono andato","andavo","vado","sarò andato"],"answer":1,"explanation":"A repeated childhood habit takes the imperfetto: andavo."},
      {"prompt":"\"Il treno parte dal binario tre\" — \"binario\" means…","options":["ticket","platform / track","carriage","timetable"],"answer":1,"explanation":"Il binario is the track/platform; the ticket is il biglietto."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0003-0000-4000-8000-000000000002' and l.position = v.pos
);

-- ============ Italian B1 — Confident conversations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0003-0000-4000-8000-000000000003',
  'it', 'it',
  'Italian B1 — Confident conversations',
  'Tell stories, give opinions with the congiuntivo, handle a job interview, push back on a faulty purchase, and read the news.',
  'B1', 'work', 12, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0003-0000-4000-8000-000000000003', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Storytelling connectors', 'vocab',
   '{"items":[
      {"term":"all''improvviso","translation":"suddenly","ipa":"al.lim.provˈvi.zo","example":"All''improvviso è andata via la luce."},
      {"term":"a un certo punto","translation":"at a certain point","example":"A un certo punto ho capito che era uno scherzo."},
      {"term":"insomma","translation":"in short / anyway","ipa":"inˈsom.ma","example":"Insomma, alla fine siamo rimasti a casa."},
      {"term":"alla fine","translation":"in the end","example":"Alla fine è andato tutto bene."},
      {"term":"Non ci crederai…","translation":"You won''t believe it…","example":"Non ci crederai: ho incontrato il mio attore preferito!"}
   ]}',
   'Connectors are what make a story sound Italian — drop *all''improvviso* or *insomma* in and listeners lean in.', 8),
  (2, 'Telling a story in the past', 'grammar',
   '{"sections":[
      {"heading":"Scene first, action second","text":"Italian stories open with the *imperfetto* to set the scene — *era una sera d''estate, faceva caldo, non c''era nessuno in giro* — and then switch to the *passato prossimo* when things start happening: *a un certo punto ho sentito un rumore*."},
      {"heading":"One step further back","text":"When one past event happened before another, use the *trapassato prossimo*: imperfetto of the auxiliary + participle. *Quando sono arrivato, il treno era già partito* — when I arrived, the train had already left. At B1 you mainly need to recognize it and use it with *già*."},
      {"heading":"Keeping the listener hooked","text":"Real narrators manage rhythm: short passato prossimo bursts for action, then a slower imperfetto aside — *e io, che non capivo niente, continuavo a sorridere*. Rhetorical checks like *capito?* or *e sai cosa ha detto?* keep the other person inside the story."}
   ]}',
   null, 12),
  (3, 'The job interview', 'roleplay',
   '{"scenario":"A job interview at a design company in Milan for a role you actually want. Introduce your background, describe your current job and one project you are proud of, and ask two smart questions about the team.","persona":"Direct but fair hiring manager who probes vague answers with \"per esempio?\"","goal":"Present your experience convincingly and ask two relevant questions"}',
   null, 12),
  (4, 'Job interview vocabulary', 'vocab',
   '{"items":[
      {"term":"il colloquio di lavoro","translation":"the job interview","ipa":"kolˈlɔ.kwjo","example":"Domani ho un colloquio di lavoro a Milano."},
      {"term":"assumere","translation":"to hire","ipa":"asˈsu.me.re","example":"L''azienda vuole assumere due sviluppatori."},
      {"term":"i punti di forza","translation":"strengths","example":"Quali sono i suoi punti di forza?"},
      {"term":"le competenze","translation":"skills","example":"Ho competenze di project management e di analisi dati."},
      {"term":"lo stipendio","translation":"the salary","ipa":"stiˈpɛn.djo","example":"Possiamo parlare dello stipendio e dei benefit?"}
   ]}',
   'False friend alert: *assumere* means to hire, not to assume — "to assume" is *supporre* or *presumere*.', 8),
  (5, 'Congiuntivo: penso che…', 'grammar',
   '{"sections":[
      {"heading":"Why Italian needs it","text":"After verbs of opinion, doubt, and emotion, Italian switches from stating facts to framing them as personal: that is the *congiuntivo*. Compare *so che Marco è a casa* (fact, indicative) with *penso che Marco sia a casa* (my take, subjunctive)."},
      {"heading":"Present congiuntivo forms","text":"*Essere*: *sia, sia, sia, siamo, siate, siano*. *Avere*: *abbia, abbia, abbia, abbiamo, abbiate, abbiano*. Regular *-are* verbs take *-i* endings (*parli*), *-ere/-ire* take *-a* endings (*prenda, parta*). Since singular forms are identical, add the pronoun when it''s unclear: *penso che tu abbia ragione*."},
      {"heading":"Triggers and one escape hatch","text":"Learn the triggers as chunks: *penso che…, credo che…, è importante che…, è possibile che…, spero che…* The escape hatch: *secondo me* takes the plain indicative — *secondo me ha ragione* — so you can voice opinions while the congiuntivo is still settling in."}
   ]}',
   null, 12),
  (6, 'Opinions & debate phrases', 'vocab',
   '{"items":[
      {"term":"secondo me","translation":"in my opinion","ipa":"seˈkon.do me","example":"Secondo me il progetto è troppo ambizioso."},
      {"term":"sono d''accordo","translation":"I agree","example":"Sono d''accordo con te al cento per cento."},
      {"term":"non sono affatto d''accordo","translation":"I completely disagree","example":"Non sono affatto d''accordo: i dati dicono altro."},
      {"term":"da un lato… dall''altro","translation":"on the one hand… on the other","example":"Da un lato risparmiamo, dall''altro perdiamo qualità."},
      {"term":"Hai ragione, però…","translation":"You''re right, but…","example":"Hai ragione, però non è così semplice."}
   ]}',
   'Softening before disagreeing — *hai ragione, però…* — is standard Italian debate etiquette.', 8),
  (7, 'The friendly debate', 'roleplay',
   '{"scenario":"Aperitivo with an Italian colleague who claims remote work is killing team culture and everyone should be back in the office. You disagree, at least in part. Argue your case with examples, concede one point, and try to find a middle ground.","persona":"Sharp, good-humored colleague from Rome who loves playing devil''s advocate","goal":"Defend your position using at least three opinion phrases and one \"penso che\" + congiuntivo"}',
   null, 12),
  (8, 'Returning a faulty purchase', 'roleplay',
   '{"scenario":"You bought a jacket last week and the zip broke on day two. Return to the shop with the receipt: explain the problem, stay polite but firm when offered only a store credit, and negotiate the outcome you want.","persona":"Defensive shop assistant who first suggests a store credit and calls the manager only if pressed","goal":"Get a refund (\"vorrei il rimborso\") or an acceptable replacement, keeping the tone courteous"}',
   null, 12),
  (9, 'Reading the news', 'reading',
   '{"sections":[
      {"heading":"How Italian headlines work","text":"Headlines compress ruthlessly: articles and verbs vanish. *Sciopero dei treni, disagi in tutta Italia* — train strike, disruption across Italy — has no verb at all. Expect nominal style (*aumento dei prezzi*, *calo dei consumi*) and learn recurring headline nouns: *lo sciopero* (strike), *l''indagine* (investigation), *il calo* (drop), *la crescita* (growth)."},
      {"heading":"A sample brief","text":"*Da lunedì aumenta il prezzo dei biglietti dell''autobus in molte città italiane. Secondo i sindaci, l''aumento è necessario per migliorare il servizio; i pendolari, però, protestano e chiedono più corse e meno ritardi.* Notice the classic structure: the fact, one side''s position (*secondo i sindaci*), then the opposing reaction (*però*)."},
      {"heading":"Reading strategy","text":"Do not translate word by word. First pass: identify who, what, where from the headline and opening line. Second pass: hunt the positions — *secondo X*, *X sostiene che*, *X chiede*. Reported claims are exactly where you will start meeting the congiuntivo in the wild: *i sindaci pensano che l''aumento sia necessario*."}
   ]}',
   null, 10),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Complete: Penso che Marco ___ ragione.","options":["ha","abbia","aveva","avrà"],"answer":1,"explanation":"Penso che triggers the congiuntivo: abbia, not ha."},
      {"prompt":"Which opener does NOT require the congiuntivo?","options":["Penso che…","Credo che…","Secondo me…","È importante che…"],"answer":2,"explanation":"Secondo me takes the plain indicative: secondo me ha ragione."},
      {"prompt":"\"All''improvviso\" means…","options":["in the end","suddenly","in short","luckily"],"answer":1,"explanation":"All''improvviso = suddenly; alla fine = in the end; insomma = in short."},
      {"prompt":"In a job context, \"assumere\" means…","options":["to assume","to hire","to resign","to apply"],"answer":1,"explanation":"False friend: assumere = to hire. \"To assume\" is supporre."},
      {"prompt":"Returning a faulty jacket, \"Vorrei il rimborso\" asks for…","options":["an exchange","a discount","a refund","a receipt"],"answer":2,"explanation":"Il rimborso = the refund; the receipt is lo scontrino."},
      {"prompt":"For the background of a story (\"it was hot, nobody was around\") you use…","options":["imperfetto","passato prossimo","congiuntivo","trapassato prossimo"],"answer":0,"explanation":"Scene-setting and description take the imperfetto: faceva caldo, non c''era nessuno."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0003-0000-4000-8000-000000000003' and l.position = v.pos
);
