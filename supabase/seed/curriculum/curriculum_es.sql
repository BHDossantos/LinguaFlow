-- Spanish curriculum pack (Latin-American Spanish, dialect 'latam').
-- Three CEFR-aligned courses — A1 Foundations, A2 Everyday life, B1 Confident
-- conversations — with 10 lessons each. Fixed UUIDs and guarded inserts make
-- the whole file idempotent: safe to re-run at any time.

-- ============ Spanish A1 — Foundations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0001-0000-4000-8000-000000000001',
  'es', 'latam',
  'Spanish A1 — Foundations',
  'Introduce yourself, handle numbers and prices, order food, and talk about your day with ser, estar, and tener.',
  'A1', 'daily_life', 10, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0001-0000-4000-8000-000000000001', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Greetings & introducing yourself', 'vocab',
   '{"items":[
      {"term":"hola","translation":"hello","ipa":"ˈo.la","example":"Hola, ¿cómo estás?"},
      {"term":"me llamo…","translation":"my name is…","ipa":"me ˈʝa.mo","example":"Hola, me llamo Andrés."},
      {"term":"mucho gusto","translation":"nice to meet you","ipa":"ˈmu.tʃo ˈɡus.to","example":"Mucho gusto, Laura."},
      {"term":"¿de dónde eres?","translation":"where are you from?","ipa":"de ˈðon.de ˈe.ɾes","example":"¿De dónde eres? — Soy de Colombia."},
      {"term":"¿a qué te dedicas?","translation":"what do you do (for a living)?","example":"¿A qué te dedicas? — Soy enfermera."},
      {"term":"nos vemos","translation":"see you later","ipa":"nos ˈbe.mos","example":"Nos vemos mañana, ¡que descanses!"}
   ]}',
   'In Latin America *¿cómo estás?* is the everyday informal greeting; with strangers or elders, switch to *¿cómo está?* (usted form).', 8),
  (2, 'Numbers & prices', 'vocab',
   '{"items":[
      {"term":"uno, dos, tres, cuatro, cinco","translation":"one, two, three, four, five","example":"Dos cafés y tres jugos, por favor."},
      {"term":"diez, veinte, treinta","translation":"ten, twenty, thirty","example":"El taxi cuesta treinta pesos."},
      {"term":"cien / quinientos / mil","translation":"one hundred / five hundred / one thousand","example":"Son quinientos pesos en total."},
      {"term":"¿cuánto cuesta?","translation":"how much does it cost?","ipa":"ˈkwan.to ˈkwes.ta","example":"¿Cuánto cuesta esta camiseta?"},
      {"term":"es muy caro / barato","translation":"it''s very expensive / cheap","example":"Cien dólares... es muy caro para mí."}
   ]}',
   '*Cien* is exactly 100; from 101 on it becomes *ciento* (ciento dos). Prices use *cuesta* for one item and *cuestan* for several.', 8),
  (3, 'Ser, estar, and tener', 'grammar',
   '{"sections":[
      {"heading":"Ser — who you are","text":"Use *ser* for identity, origin, and profession: *soy Ana*, *soy de México*, *soy ingeniera*. Present tense: *soy, eres, es, somos, son*. Think of ser as the permanent passport facts about a person or thing."},
      {"heading":"Estar — how and where you are","text":"Use *estar* for location and temporary states: *estoy en casa*, *estoy cansado*, *la sopa está fría*. Present tense: *estoy, estás, está, estamos, están*. The classic contrast: *soy aburrido* (I am boring) vs *estoy aburrido* (I am bored)."},
      {"heading":"Tener — what you have (and more)","text":"*Tener* means to have: *tengo dos hermanos*. Present tense: *tengo, tienes, tiene, tenemos, tienen*. Spanish also uses tener where English uses to be: *tengo 25 años* (I am 25), *tengo hambre* (I am hungry), *tengo frío* (I am cold)."}
   ]}',
   'Quick test: passport fact → *ser*; state or location → *estar*; possession, age, hunger, thirst → *tener*.', 12),
  (4, 'Ordering food & drinks', 'vocab',
   '{"items":[
      {"term":"quisiera…","translation":"I would like… (polite)","ipa":"kiˈsje.ɾa","example":"Quisiera unos tacos de pollo, por favor."},
      {"term":"para tomar","translation":"to drink","example":"¿Y para tomar? — Un jugo de mango, por favor."},
      {"term":"la cuenta, por favor","translation":"the check, please","ipa":"la ˈkwen.ta","example":"Disculpe, la cuenta, por favor."},
      {"term":"¿qué me recomienda?","translation":"what do you recommend?","example":"Todo se ve rico... ¿qué me recomienda?"},
      {"term":"sin picante","translation":"not spicy / without chili","example":"Para mí sin picante, por favor."},
      {"term":"¡buen provecho!","translation":"enjoy your meal!","ipa":"bwen pɾoˈβe.tʃo","example":"Aquí tienen, ¡buen provecho!"}
   ]}',
   '*Quisiera* is the safest polite order opener; *me da…* and *me trae…* are also very common and perfectly polite in Latin America.', 8),
  (5, 'Lunch at a fonda', 'roleplay',
   '{"scenario":"A small family-run fonda in Mexico City at lunchtime. Ask what today''s menú del día includes, order a main dish and a drink, ask for it not too spicy, and get the check.","persona":"Warm, chatty cook-owner who recommends her specialties and speaks no English","goal":"Order a full lunch and ask for the check entirely in Spanish"}',
   null, 10),
  (6, 'Daily routines', 'vocab',
   '{"items":[
      {"term":"me despierto","translation":"I wake up","ipa":"me ðesˈpjeɾ.to","example":"Me despierto a las seis y media."},
      {"term":"me baño","translation":"I shower / bathe","ipa":"me ˈβa.ɲo","example":"Me baño antes de desayunar."},
      {"term":"desayuno","translation":"I have breakfast","ipa":"de.saˈʝu.no","example":"Desayuno café con pan."},
      {"term":"trabajo de… a…","translation":"I work from… to…","example":"Trabajo de nueve a seis."},
      {"term":"me acuesto","translation":"I go to bed","ipa":"me aˈkwes.to","example":"Me acuesto a las once de la noche."}
   ]}',
   'Routine verbs are often reflexive: *me despierto*, *te bañas*, *se acuesta*. The pronoun changes with the person, the verb ending too.', 8),
  (7, 'Reading: un día con Camila', 'reading',
   '{"sections":[
      {"heading":"Por la mañana","text":"Camila vive en Medellín. Se despierta a las seis, se baña y desayuna *arepas con queso* y café. A las siete sale de casa y toma el metro al trabajo. Trabaja en una oficina en el centro."},
      {"heading":"Por la tarde","text":"A la una almuerza con sus compañeros en un restaurante cerca de la oficina. Su plato favorito es la *bandeja paisa*, pero dice que es mucha comida para un martes. Por la tarde tiene reuniones y responde correos."},
      {"heading":"Por la noche","text":"Camila llega a casa a las siete. Cena algo ligero, ve una serie y habla con su mamá por teléfono. Se acuesta a las diez y media porque mañana tiene un día largo."}
   ]}',
   'Notice the time-of-day markers that organize any routine: *por la mañana*, *por la tarde*, *por la noche*, and clock times with *a las…*.', 9),
  (8, 'Shopping basics', 'vocab',
   '{"items":[
      {"term":"¿tiene…?","translation":"do you have…?","example":"¿Tiene esta camisa en talla mediana?"},
      {"term":"estoy buscando…","translation":"I''m looking for…","example":"Estoy buscando un regalo para mi hermana."},
      {"term":"¿me lo puedo probar?","translation":"can I try it on?","example":"Me gusta este vestido, ¿me lo puedo probar?"},
      {"term":"¿aceptan tarjeta?","translation":"do you take cards?","ipa":"aˈsep.tan taɾˈxe.ta","example":"¿Aceptan tarjeta o solo efectivo?"},
      {"term":"me lo llevo","translation":"I''ll take it","ipa":"me lo ˈʝe.βo","example":"Está perfecto, me lo llevo."}
   ]}',
   '*Me lo llevo* literally means "I take it with me" — the standard way to say you''ll buy something. Cash is *efectivo*.', 8),
  (9, 'Bargaining at the artisan market', 'roleplay',
   '{"scenario":"An artisan market in Oaxaca. You want a hand-woven blanket and a small gift. Ask prices, compare two items, bargain politely for a better total, and pay in cash.","persona":"Good-humored artisan vendor who enjoys friendly haggling","goal":"Agree on a final price for two items and complete the purchase in Spanish"}',
   null, 10),
  (10, 'A1 checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Which sentence is correct?","options":["Yo soy cansado","Yo estoy cansado","Yo tengo cansado","Yo estar cansado"],"answer":1,"explanation":"Tiredness is a temporary state, so it takes estar: estoy cansado."},
      {"prompt":"\"¿Cuánto cuesta?\" asks about…","options":["the time","the price","the location","the size"],"answer":1,"explanation":"Cuesta comes from costar (to cost) — you''re asking the price."},
      {"prompt":"You are 25 years old. You say…","options":["Soy veinticinco años","Estoy veinticinco años","Tengo veinticinco años","Hago veinticinco años"],"answer":2,"explanation":"Age uses tener in Spanish: tengo veinticinco años."},
      {"prompt":"Pick the polite way to order food:","options":["Dame tacos","Quisiera unos tacos, por favor","Tacos ahora","Yo tacos"],"answer":1,"explanation":"Quisiera… por favor is the classic polite order opener."},
      {"prompt":"\"Me despierto a las siete\" means…","options":["I go to bed at seven","I wake up at seven","I have dinner at seven","I leave at seven"],"answer":1,"explanation":"Despertarse = to wake up; me acuesto would be going to bed."},
      {"prompt":"At a shop, \"me lo llevo\" means…","options":["I''m returning it","I''ll take it","It''s too expensive","Can I try it on?"],"answer":1,"explanation":"Me lo llevo — literally \"I take it with me\" — means you''re buying it."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0001-0000-4000-8000-000000000001' and l.position = v.pos
);

-- ============ Spanish A2 — Everyday life ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0001-0000-4000-8000-000000000002',
  'es', 'latam',
  'Spanish A2 — Everyday life',
  'Tell stories in the past, make plans, handle the pharmacy and city transport, and hold your own in work small talk.',
  'A2', 'daily_life', 11, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0001-0000-4000-8000-000000000002', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'The pretérito: talking about yesterday', 'grammar',
   '{"sections":[
      {"heading":"Regular endings","text":"The pretérito reports completed past actions. For -ar verbs: *hablé, hablaste, habló, hablamos, hablaron*. For -er/-ir verbs: *comí, comiste, comió, comimos, comieron*. Note the accent marks on *hablé* and *habló* — they carry the tense."},
      {"heading":"The big irregulars","text":"A handful of verbs you cannot avoid: *ser/ir → fui, fuiste, fue* (identical for both verbs, context decides), *hacer → hice, hizo*, *tener → tuve*, *estar → estuve*, *poder → pude*. None of these take accent marks."},
      {"heading":"Time markers","text":"The pretérito loves precise time stamps: *ayer* (yesterday), *anoche* (last night), *la semana pasada* (last week), *el año pasado* (last year). *Ayer fui al cine y después cené con mis amigos.*"}
   ]}',
   'If you can pin the action to a finished moment — ayer, anoche, en 2019 — the pretérito is almost always the right choice.', 12),
  (2, 'Pretérito vs imperfecto', 'grammar',
   '{"sections":[
      {"heading":"Two cameras on the past","text":"The imperfecto is the wide shot: background, habits, descriptions. *Cuando era niño, vivía en Quito y jugaba fútbol todos los días.* Endings: -ar → *jugaba, jugabas, jugaba*; -er/-ir → *vivía, vivías, vivía*. Only three irregulars: *ser (era)*, *ir (iba)*, *ver (veía)*."},
      {"heading":"The action shot","text":"The pretérito is the snapshot: events that happened and finished. Combine them and you get natural storytelling: *Caminaba por el parque (background) cuando empezó a llover (event).* The imperfecto sets the scene; the pretérito interrupts it."},
      {"heading":"Same verb, different meaning","text":"Some verbs shift meaning between tenses: *sabía* (I knew) vs *supe* (I found out); *conocía* (I knew a person) vs *conocí* (I met for the first time); *quería* (I wanted) vs *quise* (I tried to). *Anoche supe que mi vecina era doctora.*"}
   ]}',
   'Rule of thumb: was/used to → imperfecto; happened/did → pretérito. Stories need both, usually in the same sentence.', 12),
  (3, 'Getting around: city transport', 'vocab',
   '{"items":[
      {"term":"la parada","translation":"the (bus) stop","ipa":"la paˈɾa.ða","example":"La parada del bus está en la esquina."},
      {"term":"tomar el metro / el bus","translation":"to take the subway / the bus","example":"Tomo el metro para ir al trabajo."},
      {"term":"¿este bus va a…?","translation":"does this bus go to…?","example":"Disculpe, ¿este bus va al centro?"},
      {"term":"bajarse en…","translation":"to get off at…","example":"Me bajo en la próxima parada."},
      {"term":"hay mucho tráfico","translation":"there''s a lot of traffic","ipa":"ai̯ ˈmu.tʃo ˈtɾa.fi.ko","example":"Sal temprano, hay mucho tráfico a esa hora."},
      {"term":"pedir un taxi","translation":"to call / order a taxi","example":"Mejor pedimos un taxi, es tarde."}
   ]}',
   '*Bajarse* (to get off) and *subirse* (to get on) are reflexive: *me bajo aquí*, *súbete rápido*. Bus names vary by country: camión (MX), colectivo (AR), guagua (Caribbean).', 8),
  (4, 'Making plans & invitations', 'vocab',
   '{"items":[
      {"term":"¿qué te parece si…?","translation":"how about if…?","example":"¿Qué te parece si vamos al cine el sábado?"},
      {"term":"¿estás libre…?","translation":"are you free…?","example":"¿Estás libre el viernes por la noche?"},
      {"term":"me encantaría","translation":"I''d love to","ipa":"me eŋ.kan.taˈɾi.a","example":"¡Me encantaría! ¿A qué hora quedamos?"},
      {"term":"no puedo, tengo un compromiso","translation":"I can''t, I have a commitment","example":"El jueves no puedo, tengo un compromiso familiar."},
      {"term":"quedamos a las…","translation":"let''s meet at… (time)","example":"Quedamos a las ocho en la entrada del teatro."}
   ]}',
   '*Quedar* is the plans verb: *¿a qué hora quedamos?* (what time shall we meet?), *quedamos en la plaza* (we agreed to meet at the square).', 8),
  (5, 'Planning the weekend', 'roleplay',
   '{"scenario":"Your friend in Buenos Aires wants to do something this weekend. Suggest an activity, negotiate the day and time around each other''s commitments, and agree where exactly to meet.","persona":"Enthusiastic porteño friend who is busy on Saturday morning and always counter-proposes","goal":"Lock in an activity, a day, a time, and a meeting point"}',
   null, 10),
  (6, 'Health & pharmacy', 'vocab',
   '{"items":[
      {"term":"me duele la cabeza","translation":"my head hurts","ipa":"me ˈðwe.le la kaˈβe.sa","example":"Me duele la cabeza desde ayer."},
      {"term":"tengo tos / gripa","translation":"I have a cough / the flu","example":"Tengo tos y me siento muy cansado."},
      {"term":"tengo fiebre","translation":"I have a fever","ipa":"ˈtem.ɡo ˈfje.βɾe","example":"Creo que tengo fiebre, estoy muy caliente."},
      {"term":"¿tiene algo para…?","translation":"do you have something for…?","example":"¿Tiene algo para el dolor de garganta?"},
      {"term":"la receta","translation":"the prescription","ipa":"la reˈse.ta","example":"Para ese medicamento necesita receta."},
      {"term":"cada ocho horas","translation":"every eight hours","example":"Tome una pastilla cada ocho horas con comida."}
   ]}',
   '*Doler* works like gustar — the body part is the subject: *me duele la cabeza*, *me duelen los pies* (plural verb for plural pains).', 8),
  (7, 'At the pharmacy', 'roleplay',
   '{"scenario":"A neighborhood pharmacy in Lima. You''ve had a sore throat and a cough for two days. Describe your symptoms, answer the pharmacist''s questions, and find out the dosage and whether you need a prescription.","persona":"Careful, kind pharmacist who asks follow-up questions about symptoms and allergies","goal":"Leave with the right medicine and clear instructions on how to take it"}',
   null, 10),
  (8, 'Work small talk & opinions', 'vocab',
   '{"items":[
      {"term":"¿cómo va todo?","translation":"how''s everything going?","example":"¡Hola, Diego! ¿Cómo va todo con el proyecto?"},
      {"term":"¿qué tal el fin de semana?","translation":"how was your weekend?","example":"¿Qué tal el fin de semana? ¿Hiciste algo divertido?"},
      {"term":"me parece que…","translation":"it seems to me that… / I think…","example":"Me parece que la reunión fue muy útil."},
      {"term":"estoy de acuerdo","translation":"I agree","ipa":"esˈtoi̯ ðe aˈkweɾ.ðo","example":"Estoy de acuerdo contigo, es buena idea."},
      {"term":"la verdad, prefiero…","translation":"honestly, I prefer…","example":"La verdad, prefiero las reuniones por la mañana."}
   ]}',
   'Soften opinions with *me parece que…* or *yo diría que…* — much more natural at work than a blunt *pienso que no*.', 8),
  (9, 'Writing: your last trip', 'writing',
   '{"sections":[
      {"heading":"The task","text":"Write 80–120 words about a trip you took (real or invented). Where did you go, who with, what happened? Use the imperfecto to set the scene — *hacía calor, la ciudad era hermosa* — and the pretérito for what happened: *llegamos, comimos, conocimos*."},
      {"heading":"Useful scaffolding","text":"Openers: *El año pasado fui a…*, *Hace dos veranos visité…*. Sequence: *primero, después, luego, al final*. Reactions: *fue increíble*, *me encantó*, *lo peor fue que…*."},
      {"heading":"Checklist before you submit","text":"At least three pretérito verbs and two imperfecto verbs. One opinion (*me pareció…*). One connector (*después, luego, al final*). Read it aloud once — if a sentence runs out of breath, split it in two."}
   ]}',
   'Aim for scene-setting in the imperfecto and events in the pretérito — that alternation is the heart of A2 storytelling.', 12),
  (10, 'A2 checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Cuando era niño, ___ en Medellín.","options":["viví","vivía","vivo","viviré"],"answer":1,"explanation":"Ongoing background in the past (used to live) takes the imperfecto: vivía."},
      {"prompt":"Ayer ___ al médico.","options":["iba","fui","voy","iré"],"answer":1,"explanation":"A completed event pinned to ayer takes the pretérito: fui."},
      {"prompt":"You want to suggest a movie. You say…","options":["¿Qué te parece si vamos al cine?","Fui al cine mañana","Voy al cine ayer","El cine es una parada"],"answer":0,"explanation":"¿Qué te parece si…? is the go-to structure for suggestions."},
      {"prompt":"At the pharmacy, \"tengo tos\" means…","options":["I have a fever","I have a cough","My head hurts","I''m allergic"],"answer":1,"explanation":"La tos = cough. Fever is fiebre; headache is dolor de cabeza."},
      {"prompt":"\"Me bajo en la próxima parada\" means…","options":["I get on at the next stop","I get off at the next stop","The next stop is closed","I missed my stop"],"answer":1,"explanation":"Bajarse = to get off; la parada = the stop."},
      {"prompt":"Anoche ___ que mi vecina era doctora.","options":["sabía","supe","sé","sabré"],"answer":1,"explanation":"Supe (pretérito of saber) means \"I found out\" — a sudden completed event."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0001-0000-4000-8000-000000000002' and l.position = v.pos
);

-- ============ Spanish B1 — Confident conversations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0001-0000-4000-8000-000000000003',
  'es', 'latam',
  'Spanish B1 — Confident conversations',
  'Tell compelling stories, take a stance in debates, survive a job interview, push back on bad service, and read the news — with a first taste of the subjunctive.',
  'B1', 'work', 12, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0001-0000-4000-8000-000000000003', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Narrative past: telling a story that lands', 'grammar',
   '{"sections":[
      {"heading":"Scene, event, reaction","text":"A good Spanish anecdote has three layers. Scene in the imperfecto: *Era viernes, llovía y yo esperaba el bus.* Events in the pretérito: *De repente llegó un perro enorme y se sentó a mi lado.* Reaction, often imperfecto again: *No sabía qué hacer.*"},
      {"heading":"The pluscuamperfecto","text":"For events before your story''s past, use *había* + participle: *Cuando llegué a casa, mi esposo ya había cocinado.* It keeps timelines straight the way \"had done\" does in English: *Perdí las llaves que había comprado esa misma mañana.*"},
      {"heading":"Keeping the listener hooked","text":"Native storytellers front-load drama: *¿Sabes qué me pasó ayer?* opens almost every anecdote. Stretch tension with *y en eso…* (and just then…) and land the ending with *total, que…* (long story short…)."}
   ]}',
   'Structure every anecdote as scene (imperfecto) → events (pretérito) → punchline (*total, que…*). The pluscuamperfecto handles anything that happened even earlier.', 12),
  (2, 'Storytelling connectors', 'vocab',
   '{"items":[
      {"term":"de repente","translation":"suddenly","ipa":"de reˈpen.te","example":"Estábamos cenando y de repente se fue la luz."},
      {"term":"resulta que…","translation":"it turns out that…","example":"Resulta que el gerente era mi excompañero de universidad."},
      {"term":"mientras tanto","translation":"meanwhile","example":"Yo buscaba las llaves; mientras tanto, el taxi esperaba afuera."},
      {"term":"al final","translation":"in the end","ipa":"al fiˈnal","example":"Al final todo salió bien, por suerte."},
      {"term":"total, que…","translation":"long story short…","example":"Total, que llegamos dos horas tarde a la boda."},
      {"term":"para colmo","translation":"to top it all off","example":"Y para colmo, empezó a llover sin paraguas."}
   ]}',
   'Connectors are the skeleton of a story: *resulta que* opens, *de repente* spikes, *para colmo* piles on, *total, que* wraps up.', 8),
  (3, 'Returning a defective product', 'roleplay',
   '{"scenario":"An electronics store in Santiago. The headphones you bought last week crackle in one ear. Explain the problem, show your receipt, push back when offered only store credit, and negotiate a full refund or a replacement.","persona":"Polite but rule-bound customer service rep who cites store policy and needs convincing","goal":"Walk out with a refund or a new unit, staying firm and courteous in Spanish"}',
   null, 11),
  (4, 'Subjunctive first steps: quiero que…', 'grammar',
   '{"sections":[
      {"heading":"Why a new mood exists","text":"The subjunctive appears when one subject wants, asks, or hopes that ANOTHER subject do something. Compare: *Quiero salir* (I want to leave — one subject, infinitive) vs *Quiero que salgas* (I want YOU to leave — two subjects, subjunctive)."},
      {"heading":"Forming it","text":"Take the yo form, drop the -o, add opposite-vowel endings: *hablar → hable, hables, hable, hablemos, hablen*; *comer → coma, comas…*; *salir → salga*. The yo-form trick covers irregulars too: *tengo → tenga*, *digo → diga*, *hago → haga*."},
      {"heading":"Trigger verbs","text":"Wanting and requesting: *quiero que, necesito que, prefiero que, te pido que*. Emotion and hope: *espero que, ojalá que, me alegra que*. *Espero que tengas un buen día. Ojalá que consigas el trabajo.* If the trigger is there and subjects differ, the que-clause goes subjunctive."}
   ]}',
   'Pattern to memorize: [trigger verb] + *que* + [different subject] + subjunctive. Same subject? Skip que and use the infinitive.', 12),
  (5, 'Opinions & debate language', 'vocab',
   '{"items":[
      {"term":"desde mi punto de vista","translation":"from my point of view","example":"Desde mi punto de vista, el teletrabajo mejora la productividad."},
      {"term":"entiendo tu punto, pero…","translation":"I see your point, but…","example":"Entiendo tu punto, pero los datos dicen otra cosa."},
      {"term":"no estoy de acuerdo en absoluto","translation":"I completely disagree","example":"No estoy de acuerdo en absoluto con esa propuesta."},
      {"term":"por un lado… por otro lado…","translation":"on one hand… on the other hand…","example":"Por un lado ahorras tiempo; por otro lado, pierdes el contacto con el equipo."},
      {"term":"lo que quiero decir es que…","translation":"what I mean is that…","example":"Lo que quiero decir es que necesitamos más pruebas antes de decidir."}
   ]}',
   'Concede before you counter: *entiendo tu punto, pero…* keeps a debate warm. Save *en absoluto* for when you really mean it.', 8),
  (6, 'Debate: remote work vs the office', 'roleplay',
   '{"scenario":"Over coffee, a coworker in Bogotá insists everyone should return to the office five days a week. Defend flexible remote work: concede one fair point, give two solid arguments with examples, and propose a compromise.","persona":"Sharp, friendly coworker who genuinely loves the office and challenges every argument with a counterexample","goal":"Complete the debate conceding once, countering twice, and landing on a compromise"}',
   null, 11),
  (7, 'Job interview vocabulary', 'vocab',
   '{"items":[
      {"term":"la entrevista","translation":"the interview","ipa":"la en.tɾeˈβis.ta","example":"Tengo una entrevista el martes por la mañana."},
      {"term":"fortalezas y debilidades","translation":"strengths and weaknesses","example":"Una de mis fortalezas es la comunicación con clientes."},
      {"term":"tengo experiencia en…","translation":"I have experience in…","example":"Tengo cinco años de experiencia en ventas."},
      {"term":"trabajar bajo presión","translation":"to work under pressure","example":"Estoy acostumbrada a trabajar bajo presión y con plazos cortos."},
      {"term":"la vacante","translation":"the job opening","ipa":"la baˈkan.te","example":"Vi la vacante en el sitio web de la empresa."},
      {"term":"pretensión salarial","translation":"salary expectation","example":"¿Cuál es su pretensión salarial para este puesto?"}
   ]}',
   'Interviews in Latin America default to *usted*: *¿usted qué experiencia tiene?* Mirror the interviewer''s register and keep answers in past-tense examples.', 8),
  (8, 'The job interview', 'roleplay',
   '{"scenario":"A video interview for a project coordinator role at a company in Monterrey. Introduce your background, describe a past project using narrative tenses, name a strength and a genuine weakness, and ask two smart questions about the team.","persona":"Professional, probing hiring manager who uses usted and asks for concrete examples after every claim","goal":"Get through the full interview in Spanish, including one story in the past and your own questions at the end"}',
   null, 12),
  (9, 'Reading the news: strike at the port', 'reading',
   '{"sections":[
      {"heading":"La noticia","text":"VALPARAÍSO — Los trabajadores del puerto iniciaron ayer una *huelga* indefinida para exigir mejores condiciones laborales. Según el sindicato, las negociaciones con la empresa se rompieron el viernes, después de seis meses de conversaciones sin acuerdo."},
      {"heading":"Las reacciones","text":"El gerente del puerto declaró que la empresa espera que los trabajadores *vuelvan* a la mesa de negociación esta semana. Mientras tanto, decenas de camiones esperan en los accesos y los exportadores de fruta calculan pérdidas millonarias si el paro continúa."},
      {"heading":"Cómo leer una noticia","text":"Notice the recipe: headline verbs in pretérito (*iniciaron, se rompieron*), background in imperfecto, and sources marked with *según* (according to). Spot the subjunctive after *espera que… vuelvan* — hopes about others always trigger it. Key vocab: *la huelga / el paro* (strike), *el sindicato* (union), *las pérdidas* (losses)."}
   ]}',
   'News Spanish is formulaic: pretérito for events, *según* for sources, subjunctive after verbs of hope and demand. Learn the formula and headlines open up fast.', 10),
  (10, 'B1 checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Caminaba por el centro cuando de repente ___ a mi ex jefe.","options":["veía","vi","veré","veo"],"answer":1,"explanation":"The imperfecto (caminaba) sets the scene; the interrupting event takes the pretérito: vi."},
      {"prompt":"Quiero que me ___ la verdad.","options":["dices","digas","dice","decir"],"answer":1,"explanation":"Querer que + a different subject triggers the subjunctive: digas."},
      {"prompt":"\"Total, que llegamos tarde\" — \"total, que\" means…","options":["in total","long story short","meanwhile","suddenly"],"answer":1,"explanation":"Total, que… wraps up an anecdote: long story short."},
      {"prompt":"In an interview, your \"fortalezas\" are your…","options":["weaknesses","salaries","strengths","references"],"answer":2,"explanation":"Fortalezas = strengths; debilidades = weaknesses."},
      {"prompt":"Best way to disagree politely in a debate:","options":["Entiendo tu punto, pero no estoy de acuerdo","Eso es mentira","No sabes nada","Qué tontería"],"answer":0,"explanation":"Concede first, then counter — the polite disagreement formula."},
      {"prompt":"You want your money back for a faulty product. You ask for…","options":["una devolución","una propina","una receta","una vacante"],"answer":0,"explanation":"Una devolución = a refund/return. Propina is a tip; receta a prescription; vacante a job opening."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0001-0000-4000-8000-000000000003' and l.position = v.pos
);
