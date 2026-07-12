-- French curriculum pack: a CEFR-aligned track for French (dialect 'fr').
-- Three courses — A1 Foundations, A2 Everyday life, B1 Confident conversations —
-- with 10 lessons each (30 total). Fixed UUIDs keep re-runs idempotent:
-- courses use `on conflict (id) do nothing`, lessons are guarded by a
-- `where not exists` check on (course_id, position).

-- ============ French A1 — Foundations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0002-0000-4000-8000-000000000001',
  'fr', 'fr',
  'French A1 — Foundations',
  'Introduce yourself, handle numbers and prices, survive the café and the bakery, and talk about your day.',
  'A1', 'daily_life', 10, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0002-0000-4000-8000-000000000001', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Introducing yourself', 'vocab',
   '{"items":[
      {"term":"Je m''appelle…","translation":"My name is…","ipa":"ʒə ma.pɛl","example":"Bonjour, je m''appelle Claire, et vous ?"},
      {"term":"Enchanté / Enchantée","translation":"Nice to meet you (m/f)","ipa":"ɑ̃.ʃɑ̃.te","example":"Enchantée, moi c''est Léa."},
      {"term":"J''habite à…","translation":"I live in…","ipa":"ʒa.bit a","example":"J''habite à Lyon depuis un an."},
      {"term":"Je viens de…","translation":"I come from…","ipa":"ʒə vjɛ̃ də","example":"Je viens du Canada, et toi ?"},
      {"term":"Comment vous appelez-vous ?","translation":"What is your name? (formal)","ipa":"kɔ.mɑ̃ vu za.ple vu","example":"Comment vous appelez-vous, madame ?"}
   ]}',
   '*Enchanté* agrees with the speaker: men write *enchanté*, women *enchantée* — it sounds identical.', 8),
  (2, 'Numbers & prices', 'vocab',
   '{"items":[
      {"term":"trente, quarante, cinquante","translation":"thirty, forty, fifty","ipa":"tʁɑ̃t, ka.ʁɑ̃t, sɛ̃.kɑ̃t","example":"Ça coûte cinquante euros."},
      {"term":"soixante-dix","translation":"seventy","ipa":"swa.sɑ̃t.dis","example":"Ma grand-mère a soixante-dix ans."},
      {"term":"quatre-vingts","translation":"eighty","ipa":"ka.tʁə.vɛ̃","example":"Le billet coûte quatre-vingts euros."},
      {"term":"Combien ça coûte ?","translation":"How much does it cost?","ipa":"kɔ̃.bjɛ̃ sa kut","example":"Excusez-moi, combien ça coûte ?"},
      {"term":"C''est trop cher","translation":"It''s too expensive","ipa":"sɛ tʁo ʃɛʁ","example":"Dix euros le café ? C''est trop cher !"}
   ]}',
   'French counts 70 as 60+10 (*soixante-dix*) and 80 as 4×20 (*quatre-vingts*). Belgians and Swiss say *septante* and *huitante/octante* instead.', 8),
  (3, 'At the bakery', 'roleplay',
   '{"scenario":"A busy boulangerie in Paris at 8am. Greet the baker, order a baguette and two croissants, ask how much it is, and pay in cash.","persona":"Efficient Parisian baker who appreciates good manners but has a queue behind you","goal":"Complete the purchase in French, starting with bonjour and ending with the correct total"}',
   null, 10),
  (4, 'Être, avoir, aller — the big three', 'grammar',
   '{"sections":[
      {"heading":"Être — to be","text":"The most used verb in French: *je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont*. Use it for identity, nationality, and description: *Je suis canadienne. Nous sommes fatigués.* Note that *vous* covers both formal singular and plural."},
      {"heading":"Avoir — to have","text":"*J''ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont*. French uses *avoir* where English uses *to be* for age, hunger, and temperature: *J''ai trente ans* (I am thirty), *J''ai faim* (I am hungry), *J''ai froid* (I am cold)."},
      {"heading":"Aller — to go","text":"*Je vais, tu vas, il/elle va, nous allons, vous allez, ils/elles vont*. Beyond movement (*Je vais au travail*), it powers the standard greeting *Comment ça va ? — Ça va bien, merci*, and the near future: *Je vais manger* means I am going to eat."}
   ]}',
   null, 10),
  (5, 'At the café', 'vocab',
   '{"items":[
      {"term":"un café crème","translation":"a coffee with milk","ipa":"œ̃ ka.fe kʁɛm","example":"Un café crème et un croissant, s''il vous plaît."},
      {"term":"une carafe d''eau","translation":"a jug of tap water","ipa":"yn ka.ʁaf do","example":"Une carafe d''eau, s''il vous plaît."},
      {"term":"l''addition","translation":"the bill","ipa":"la.di.sjɔ̃","example":"L''addition, s''il vous plaît !"},
      {"term":"sur place ou à emporter ?","translation":"eat in or take away?","ipa":"syʁ plas u a ɑ̃.pɔʁ.te","example":"Un sandwich à emporter, s''il vous plaît."},
      {"term":"la terrasse","translation":"the outdoor seating","ipa":"la te.ʁas","example":"On s''installe en terrasse ?"}
   ]}',
   'Tap water is free by law in French cafés — ask for *une carafe d''eau* instead of paying for bottled water.', 8),
  (6, 'My daily routine', 'vocab',
   '{"items":[
      {"term":"je me réveille","translation":"I wake up","ipa":"ʒə mə ʁe.vɛj","example":"Je me réveille à sept heures."},
      {"term":"je me lève","translation":"I get up","ipa":"ʒə mə lɛv","example":"Je me lève tout de suite après."},
      {"term":"le petit déjeuner","translation":"breakfast","ipa":"lə pə.ti de.ʒœ.ne","example":"Je prends le petit déjeuner à huit heures."},
      {"term":"je vais au travail","translation":"I go to work","ipa":"ʒə vɛ o tʁa.vaj","example":"Je vais au travail en métro."},
      {"term":"je me couche","translation":"I go to bed","ipa":"ʒə mə kuʃ","example":"Je me couche vers minuit."}
   ]}',
   'Reflexive verbs need the pronoun: *je me lève*, *tu te lèves*, *il se lève*. Dropping the *me/te/se* changes the meaning.', 8),
  (7, 'Reading: une journée à Paris', 'reading',
   '{"sections":[
      {"heading":"Le matin","text":"*Le matin, Camille se réveille à sept heures. Elle prend un café et une tartine, puis elle va au travail en métro. Le trajet dure vingt minutes.* Notice the routine verbs from lesson 6: *se réveille*, *prend*, *va* — all in the present tense."},
      {"heading":"Le midi","text":"*À midi, Camille déjeune avec une collègue dans un petit café. Elle commande une salade et une carafe d''eau. L''addition ? Douze euros.* Spot the café vocabulary and the price — French speakers say *douze euros*, never the currency symbol first."},
      {"heading":"Le soir","text":"*Le soir, elle achète une baguette à la boulangerie et rentre à la maison. Elle dîne à vingt heures et se couche vers vingt-trois heures.* French timetables use the 24-hour clock: *vingt heures* is 8pm, *vingt-trois heures* is 11pm."}
   ]}',
   null, 9),
  (8, 'Shopping basics', 'vocab',
   '{"items":[
      {"term":"un magasin","translation":"a shop","ipa":"œ̃ ma.ɡa.zɛ̃","example":"Le magasin ouvre à dix heures."},
      {"term":"les soldes","translation":"the sales","ipa":"le sɔld","example":"Les soldes commencent en janvier."},
      {"term":"Je peux essayer ?","translation":"Can I try it on?","ipa":"ʒə pø e.se.je","example":"Je peux essayer cette veste ?"},
      {"term":"la taille","translation":"the size (clothes)","ipa":"la taj","example":"Vous avez la taille en dessous ?"},
      {"term":"Je cherche…","translation":"I''m looking for…","ipa":"ʒə ʃɛʁʃ","example":"Je cherche un cadeau pour ma sœur."}
   ]}',
   '*Chercher* already means to look FOR — no preposition needed: *je cherche un pull*, not ~je cherche pour~.', 8),
  (9, 'Clothes shopping', 'roleplay',
   '{"scenario":"A clothes shop in Paris during the January sales. Tell the assistant what you are looking for, ask to try something on, ask for a different size, and decide whether to buy it.","persona":"Attentive shop assistant who compliments your French and speaks quickly","goal":"Try on an item, ask about the price and size, and politely buy it or decline"}',
   null, 10),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Complete: « Nous ___ français. »","options":["sommes","avons","allons","êtes"],"answer":0,"explanation":"Être: nous sommes. « Nous sommes français » = we are French."},
      {"prompt":"How do you ask the price of something?","options":["Où est… ?","Combien ça coûte ?","Quelle heure est-il ?","Comment allez-vous ?"],"answer":1,"explanation":"Combien ça coûte ? = how much does it cost?"},
      {"prompt":"« Quatre-vingts » means…","options":["forty","sixty","eighty","ninety"],"answer":2,"explanation":"Literally four twenties: 4 × 20 = 80."},
      {"prompt":"Pick the correct form: « J''___ trente ans. »","options":["suis","ai","vais","es"],"answer":1,"explanation":"Age uses avoir, not être: j''ai trente ans — literally, I have thirty years."},
      {"prompt":"« Je me couche » means…","options":["I wake up","I go to bed","I have lunch","I get dressed"],"answer":1,"explanation":"Se coucher = to go to bed; se réveiller = to wake up."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0002-0000-4000-8000-000000000001' and l.position = v.pos
);

-- ============ French A2 — Everyday life ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0002-0000-4000-8000-000000000002',
  'fr', 'fr',
  'French A2 — Everyday life',
  'Tell stories in the past, make plans, handle the pharmacy and the doctor, chat at work, and take the train.',
  'A2', 'daily_life', 11, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0002-0000-4000-8000-000000000002', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Passé composé — what happened', 'grammar',
   '{"sections":[
      {"heading":"Formation with avoir","text":"Most verbs build the passé composé with the present of *avoir* plus a past participle: *J''ai mangé* (I ate), *Tu as fini* (you finished), *Elle a vendu* (she sold). Regular participles follow three patterns: -er verbs give *-é* (mangé), -ir verbs give *-i* (fini), -re verbs give *-u* (vendu)."},
      {"heading":"The être club","text":"About fifteen verbs of movement and change use *être* instead: *Je suis allé au marché* (I went to the market), *Elle est arrivée en retard* (she arrived late), *Nous sommes partis tôt* (we left early). With *être*, the participle agrees with the subject: *allé / allée / allés / allées*."},
      {"heading":"Irregular participles worth memorizing","text":"The most frequent verbs are irregular: *avoir → eu* (j''ai eu), *être → été* (j''ai été), *faire → fait* (j''ai fait), *prendre → pris* (j''ai pris), *voir → vu* (j''ai vu). Learn these five first — they cover a huge share of everyday speech."}
   ]}',
   null, 11),
  (2, 'Making plans', 'vocab',
   '{"items":[
      {"term":"Tu es libre samedi ?","translation":"Are you free on Saturday?","ipa":"ty ɛ libʁ sam.di","example":"Tu es libre samedi soir ?"},
      {"term":"Ça te dit ?","translation":"Do you fancy it?","ipa":"sa tə di","example":"Un ciné ce soir, ça te dit ?"},
      {"term":"On se retrouve où ?","translation":"Where shall we meet?","ipa":"ɔ̃ sə ʁə.tʁuv u","example":"On se retrouve où, devant la gare ?"},
      {"term":"d''accord","translation":"okay / agreed","ipa":"da.kɔʁ","example":"D''accord, à samedi alors !"},
      {"term":"Je ne peux pas","translation":"I can''t","ipa":"ʒə nə pø pa","example":"Désolée, je ne peux pas vendredi."}
   ]}',
   'Spoken French uses *on* for we: *On se retrouve à huit heures* = we''re meeting at eight. *Nous* sounds formal in casual plans.', 8),
  (3, 'Planning the weekend', 'roleplay',
   '{"scenario":"A phone call with a French friend to plan Saturday. Suggest an activity, react to their counter-proposal, and agree on a time and a meeting point.","persona":"Enthusiastic friend from Toulouse who keeps suggesting alternatives","goal":"Agree on one activity, a time, and an exact meeting point, all in French"}',
   null, 10),
  (4, 'Pharmacy & health', 'vocab',
   '{"items":[
      {"term":"J''ai mal à la tête","translation":"I have a headache","ipa":"ʒe mal a la tɛt","example":"J''ai mal à la tête depuis ce matin."},
      {"term":"une ordonnance","translation":"a prescription","ipa":"yn ɔʁ.dɔ.nɑ̃s","example":"Il faut une ordonnance pour ce médicament."},
      {"term":"un rhume","translation":"a cold","ipa":"œ̃ ʁym","example":"J''ai un rhume depuis lundi."},
      {"term":"la fièvre","translation":"fever","ipa":"la fjɛvʁ","example":"Il a de la fièvre ce matin."},
      {"term":"un médicament","translation":"a medicine","ipa":"œ̃ me.di.ka.mɑ̃","example":"Prenez ce médicament deux fois par jour."}
   ]}',
   'Pain uses *avoir mal à* + body part: *j''ai mal à la gorge* (throat), *au dos* (back), *aux dents* (teeth). The article contracts with à.', 8),
  (5, 'At the pharmacy', 'roleplay',
   '{"scenario":"A pharmacy in Lille. You have had a sore throat and a slight fever for two days. Describe your symptoms, answer the pharmacist''s questions, and ask how often to take what they recommend.","persona":"Thorough pharmacist who asks follow-up questions before recommending anything","goal":"Get a suitable remedy and correctly repeat back the dosage instructions"}',
   null, 10),
  (6, 'Imparfait vs passé composé', 'grammar',
   '{"sections":[
      {"heading":"Forming the imparfait","text":"Take the *nous* form of the present, drop *-ons*, and add the endings *-ais, -ais, -ait, -ions, -iez, -aient*: *nous faisons → je faisais*, *nous avons → j''avais*. The only irregular stem is *être → ét-*: *j''étais, tu étais, c''était*."},
      {"heading":"Background vs event","text":"The imparfait paints the scenery and habits: *Il pleuvait, j''étais fatigué, on regardait la télé.* The passé composé reports what happened: *Soudain, le téléphone a sonné.* A useful image: the imparfait is the photo, the passé composé is what moves in the film."},
      {"heading":"Side by side","text":"*Quand j''étais petit, j''habitais à Marseille* (habit — imparfait). *Hier, j''ai visité Marseille* (one completed event — passé composé). *Je dormais quand tu as appelé* — the sleeping was in progress (imparfait) when the call interrupted it (passé composé)."}
   ]}',
   null, 11),
  (7, 'Small talk at work', 'vocab',
   '{"items":[
      {"term":"une réunion","translation":"a meeting","ipa":"yn ʁe.y.njɔ̃","example":"J''ai une réunion à quatorze heures."},
      {"term":"Ça s''est bien passé ?","translation":"Did it go well?","ipa":"sa sɛ bjɛ̃ pa.se","example":"Ta présentation, ça s''est bien passé ?"},
      {"term":"la pause café","translation":"the coffee break","ipa":"la poz ka.fe","example":"On en parle à la pause café ?"},
      {"term":"Ça marche","translation":"OK, that works","ipa":"sa maʁʃ","example":"Midi à la cantine ? Ça marche."},
      {"term":"Bon week-end !","translation":"Have a good weekend!","ipa":"bɔ̃ wi.kɛnd","example":"À lundi, bon week-end !"}
   ]}',
   'At work, default to *vous* with colleagues you don''t know; many French teams switch to *tu* quickly, but wait to be invited (*On se tutoie ?*).', 8),
  (8, 'Taking the train (SNCF)', 'vocab',
   '{"items":[
      {"term":"un aller-retour","translation":"a return ticket","ipa":"œ̃ na.le ʁə.tuʁ","example":"Un aller-retour pour Bordeaux, s''il vous plaît."},
      {"term":"la voie","translation":"the platform / track","ipa":"la vwa","example":"Le train pour Lille part voie sept."},
      {"term":"une correspondance","translation":"a connection / transfer","ipa":"yn kɔ.ʁɛs.pɔ̃.dɑ̃s","example":"Vous avez une correspondance à Lyon Part-Dieu."},
      {"term":"en retard","translation":"late / delayed","ipa":"ɑ̃ ʁə.taʁ","example":"Le TGV est en retard de vingt minutes."},
      {"term":"le guichet","translation":"the ticket counter","ipa":"lə ɡi.ʃɛ","example":"Demandez au guichet ou sur l''application SNCF."}
   ]}',
   'One-way is *un aller simple*, round trip *un aller-retour*. Station announcements say *le train à destination de…* — listen for your city after that phrase.', 8),
  (9, 'Writing: racontez votre week-end', 'writing',
   '{"sections":[
      {"heading":"The task","text":"Write 8–10 sentences about last weekend for a French friend. Mix the two past tenses you have learned: use the imparfait for the setting (*il faisait beau*, *j''étais chez mes parents*) and the passé composé for what you did (*on a fait une randonnée*, *j''ai vu un film*)."},
      {"heading":"Useful frames","text":"Open with *Le week-end dernier…* and connect events with *d''abord*, *ensuite*, *après*, *finalement*. React to your own story: *C''était génial !*, *C''était nul.*, *On a passé une super soirée.* Close by asking your friend a question: *Et toi, qu''est-ce que tu as fait ?*"},
      {"heading":"Self-check","text":"Before submitting, verify three things: every passé composé verb has its auxiliary (*j''ai mangé*, not ~je mangé~); verbs of movement use *être* (*je suis allé(e)*); and descriptions of weather and feelings are in the imparfait (*il pleuvait*, *j''étais content(e)*)."}
   ]}',
   null, 12),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Which auxiliary does « aller » take in the passé composé?","options":["avoir","être","faire","aller"],"answer":1,"explanation":"Verbs of movement like aller use être: je suis allé(e) au marché."},
      {"prompt":"Which sentence sets the scene in the past?","options":["Il a plu.","Il pleuvait.","Il va pleuvoir.","Il pleut."],"answer":1,"explanation":"The imparfait (pleuvait) paints the background; the passé composé (a plu) reports an event."},
      {"prompt":"« J''ai mal à la gorge » means…","options":["I have a headache","My throat hurts","I have a fever","I feel fine"],"answer":1,"explanation":"Avoir mal à + body part: la gorge = the throat."},
      {"prompt":"« Un aller-retour » is…","options":["a one-way ticket","a return ticket","a platform","a delay"],"answer":1,"explanation":"Aller-retour = go and come back; one-way is un aller simple."},
      {"prompt":"Your colleague answers « Ça marche ». They mean…","options":["It''s broken","They are going for a walk","OK, that works","It''s too far"],"answer":2,"explanation":"Ça marche is informal agreement — deal, that works."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0002-0000-4000-8000-000000000002' and l.position = v.pos
);

-- ============ French B1 — Confident conversations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0002-0000-4000-8000-000000000003',
  'fr', 'fr',
  'French B1 — Confident conversations',
  'Tell stories, defend opinions, shine in job interviews, handle complaints, and read the French press.',
  'B1', 'work', 12, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0002-0000-4000-8000-000000000003', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Storytelling connectors', 'vocab',
   '{"items":[
      {"term":"d''abord","translation":"first of all","ipa":"da.bɔʁ","example":"D''abord, on a pris le train de nuit."},
      {"term":"ensuite","translation":"then / next","ipa":"ɑ̃.sɥit","example":"Ensuite, elle a changé d''avis."},
      {"term":"du coup","translation":"so / as a result (spoken)","ipa":"dy ku","example":"Il pleuvait, du coup on est restés à la maison."},
      {"term":"en fait","translation":"actually / in fact","ipa":"ɑ̃ fɛt","example":"En fait, ce n''était pas si grave."},
      {"term":"finalement","translation":"in the end","ipa":"fi.nal.mɑ̃","example":"Finalement, tout s''est bien terminé."}
   ]}',
   '*Du coup* is the glue of spoken French — you will hear it several times per minute. Keep it out of formal writing, where *par conséquent* or *donc* fit better.', 8),
  (2, 'Le subjonctif — il faut que…', 'grammar',
   '{"sections":[
      {"heading":"When it appears","text":"The subjunctive follows expressions of necessity, desire, emotion, and doubt introduced by *que*: *il faut que* (it is necessary that), *je veux que* (I want that), *bien que* (although), *je ne pense pas que* (I don''t think that). *Il faut que je parte* = I have to leave."},
      {"heading":"Building it","text":"Take the *ils* form of the present, drop *-ent*, and add *-e, -es, -e, -ions, -iez, -ent*: *ils finissent → il faut que je finisse*, *ils prennent → que tu prennes*. For most -er verbs the singular forms sound exactly like the present — the change is only visible with irregular verbs."},
      {"heading":"The four you cannot avoid","text":"*Être → que je sois, que tu sois*; *avoir → que j''aie, qu''il ait*; *faire → que je fasse*; *aller → que j''aille*. Drill them inside full sentences: *Il faut que tu sois à l''heure. Il faut que j''aille à la banque avant midi.*"},
      {"heading":"A shortcut while you learn","text":"In conversation, *il faut* + infinitive avoids the subjunctive when the subject is general: *Il faut réserver à l''avance.* Use it as a safety net, but recognize the subjunctive when natives use it — with *il faut que*, they always do."}
   ]}',
   null, 12),
  (3, 'Opinions & debating', 'vocab',
   '{"items":[
      {"term":"à mon avis","translation":"in my opinion","ipa":"a mɔ̃ na.vi","example":"À mon avis, c''est une erreur."},
      {"term":"Je ne suis pas d''accord","translation":"I disagree","ipa":"ʒə nə sɥi pa da.kɔʁ","example":"Je ne suis pas d''accord avec ce point."},
      {"term":"avoir raison / avoir tort","translation":"to be right / to be wrong","ipa":"a.vwaʁ ʁɛ.zɔ̃ / a.vwaʁ tɔʁ","example":"Tu as raison sur ce point, mais…"},
      {"term":"par contre","translation":"on the other hand","ipa":"paʁ kɔ̃tʁ","example":"C''est pratique ; par contre, c''est plus cher."},
      {"term":"Ça dépend","translation":"It depends","ipa":"sa de.pɑ̃","example":"Ça dépend du contexte, non ?"}
   ]}',
   'Soften disagreement to keep the debate friendly: *Je ne suis pas tout à fait d''accord* or *Oui, mais…* land far better than a flat *Non*.', 8),
  (4, 'Friendly debate: remote work', 'roleplay',
   '{"scenario":"Lunch with a French colleague who thinks everyone should return to the office full-time. Defend remote or hybrid work: give at least two arguments, concede one good point of theirs, and propose a compromise.","persona":"Opinionated but good-humoured colleague who enjoys playing devil''s advocate","goal":"Make two structured arguments using connectors (à mon avis, par contre) and end on a compromise"}',
   null, 11),
  (5, 'Job interview vocabulary', 'vocab',
   '{"items":[
      {"term":"un entretien d''embauche","translation":"a job interview","ipa":"œ̃ nɑ̃.tʁə.tjɛ̃ dɑ̃.boʃ","example":"J''ai un entretien d''embauche jeudi matin."},
      {"term":"le CV et la lettre de motivation","translation":"the résumé and cover letter","ipa":"lə se.ve","example":"Envoyez votre CV et votre lettre de motivation avant lundi."},
      {"term":"les compétences","translation":"skills","ipa":"le kɔ̃.pe.tɑ̃s","example":"Quelles sont vos compétences principales ?"},
      {"term":"un point fort / un point faible","translation":"a strength / a weakness","ipa":"œ̃ pwɛ̃ fɔʁ / œ̃ pwɛ̃ fɛbl","example":"Mon point fort, c''est l''organisation."},
      {"term":"embaucher","translation":"to hire","ipa":"ɑ̃.bo.ʃe","example":"L''entreprise embauche trois développeurs cette année."}
   ]}',
   'French interviews stay formal: *vous* throughout, *Madame/Monsieur* without the surname, and let the interviewer offer their hand first.', 8),
  (6, 'The job interview', 'roleplay',
   '{"scenario":"An interview at a Lyon tech company for a role matching your real background. Introduce your experience, describe a strength and a weakness with examples, and ask two questions about the team and the position.","persona":"Professional but warm hiring manager who probes vague answers with follow-up questions","goal":"Present your background in past tenses, name one point fort and one point faible, and ask two relevant questions"}',
   null, 12),
  (7, 'Le conditionnel de politesse', 'grammar',
   '{"sections":[
      {"heading":"Formation","text":"Add the imparfait endings to the future stem: *je voudrais, tu voudrais, il voudrait, nous voudrions, vous voudriez, ils voudraient*. Key stems: *vouloir → voudr-*, *pouvoir → pourr-*, *aimer → aimer-*, *être → ser-*."},
      {"heading":"Polite requests","text":"The conditional turns demands into requests: *Je voudrais un renseignement* (I would like some information), *Pourriez-vous vérifier ?* (could you check?), *J''aimerais changer ma réservation.* Compare *Je veux un remboursement* — grammatical, but abrupt enough to raise eyebrows."},
      {"heading":"Complaints that get results","text":"Effective French complaints pair firmness with the conditional: *Il y a un problème avec ma commande. Je voudrais un remboursement, s''il vous plaît.* State the facts in the passé composé (*J''ai acheté ce téléphone il y a une semaine et il ne fonctionne plus*), then make the conditional request. Escalate only if needed: *Je souhaiterais parler à un responsable.*"}
   ]}',
   null, 11),
  (8, 'Returning a faulty item', 'roleplay',
   '{"scenario":"An electronics store in Paris. The headphones you bought ten days ago crackle constantly. You have the receipt. Explain the problem, insist politely when the clerk offers only a store credit, and negotiate a full refund or an exchange you actually want.","persona":"Skeptical sales clerk who first suggests it might be user error and offers store credit","goal":"Use the conditional (je voudrais, pourriez-vous) to obtain a refund or acceptable exchange without losing your cool"}',
   null, 11),
  (9, 'Reading the French news', 'reading',
   '{"sections":[
      {"heading":"Decoding headlines","text":"French headlines compress hard: articles vanish and nouns do the work. *Grève des transports : le trafic fortement perturbé mardi* — a transport strike, heavy disruption on Tuesday. Learn the recurring nouns: *une grève* (strike), *une manifestation* (protest), *le pouvoir d''achat* (purchasing power), *une canicule* (heat wave), *les impôts* (taxes)."},
      {"heading":"A short news item","text":"*La SNCF annonce que le trafic sera perturbé mardi en raison d''une grève. Environ un train sur trois circulera sur les grandes lignes. La direction et les syndicats doivent se rencontrer mercredi pour éviter que le mouvement se poursuive.* Note *un train sur trois* (one train in three) and *les syndicats* (the unions) — staples of French news."},
      {"heading":"Where to practice","text":"Start with free, short formats: *20 Minutes* writes for commuters, RFI''s *Journal en français facile* delivers the day''s news in slowed French with transcripts, and *1jour1actu* explains one story a day in simple language. Read the same story in English first if you need scaffolding — knowing the facts frees you to focus on the words."}
   ]}',
   null, 10),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Complete: « Il faut que tu ___ à l''heure. »","options":["es","sois","être","seras"],"answer":1,"explanation":"Il faut que triggers the subjunctive: que tu sois. The indicative es is wrong here."},
      {"prompt":"« Du coup » roughly means…","options":["suddenly","so / as a result","by the way","on the other hand"],"answer":1,"explanation":"Du coup links a cause to its consequence in spoken French; par contre is the contrast word."},
      {"prompt":"The most polite way to ask for a refund:","options":["Remboursez-moi !","Je veux un remboursement.","Je voudrais un remboursement, s''il vous plaît.","Donnez-moi l''argent."],"answer":2,"explanation":"The conditional je voudrais plus s''il vous plaît is the polite standard."},
      {"prompt":"« Un entretien d''embauche » is…","options":["a maintenance contract","a job interview","a pay slip","a resignation letter"],"answer":1,"explanation":"Embaucher = to hire, so an entretien d''embauche is a hiring interview."},
      {"prompt":"In a headline, « une grève » means…","options":["a strike","a flood","an election","a heat wave"],"answer":0,"explanation":"Une grève = a strike; a heat wave is une canicule."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0002-0000-4000-8000-000000000003' and l.position = v.pos
);
