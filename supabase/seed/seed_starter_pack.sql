-- Starter content pack: expands the catalog from 1 language course to a
-- usable library — Spanish A1 continuation + French/Italian/Portuguese A1
-- starters. Fixed UUIDs make re-runs idempotent (insert … on conflict).

-- ============ Spanish: essentials course (A1, part 2) ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  '11111111-1111-1111-1111-111111111112',
  'es', 'latam',
  'Spanish essentials — daily life',
  'Family, time, weather, and getting around. Builds on the travel course.',
  'A1', 'daily_life', 2, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select '11111111-1111-1111-1111-111111111112', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Family words', 'vocab',
   '{"items":[
      {"term":"la madre","translation":"the mother","ipa":"la ˈma.ðɾe","example":"Mi madre se llama Rosa."},
      {"term":"el padre","translation":"the father","ipa":"el ˈpa.ðɾe","example":"Mi padre trabaja mucho."},
      {"term":"el hermano","translation":"the brother","ipa":"el eɾˈma.no","example":"Tengo un hermano menor."},
      {"term":"la hermana","translation":"the sister","ipa":"la eɾˈma.na","example":"Mi hermana vive en Lima."},
      {"term":"los abuelos","translation":"the grandparents","ipa":"los aˈβwe.los","example":"Visito a mis abuelos los domingos."}
   ]}',
   'Family nouns take the article: *la madre*, *el padre*. Plural of mixed groups uses the masculine: *los abuelos* = grandparents.', 8),
  (2, 'Telling time', 'vocab',
   '{"items":[
      {"term":"¿Qué hora es?","translation":"What time is it?","ipa":"ke ˈo.ɾa es","example":"Perdón, ¿qué hora es?"},
      {"term":"Es la una","translation":"It''s one o''clock","example":"Es la una de la tarde."},
      {"term":"Son las dos","translation":"It''s two o''clock","example":"Son las dos y media."},
      {"term":"y media","translation":"half past","example":"Son las tres y media."},
      {"term":"menos cuarto","translation":"quarter to","example":"Son las cinco menos cuarto."}
   ]}',
   'Use *es la* only with one o''clock; *son las* for all other hours.', 8),
  (3, 'At the market', 'roleplay',
   '{"scenario":"You are at a street market in Bogotá. Buy fruit for the week, ask prices, and haggle politely.","persona":"Friendly market vendor who speaks no English","goal":"Buy three items and get the total price"}',
   null, 10),
  (4, 'Weather small talk', 'vocab',
   '{"items":[
      {"term":"Hace calor","translation":"It''s hot","ipa":"ˈa.se kaˈloɾ","example":"Hoy hace mucho calor."},
      {"term":"Hace frío","translation":"It''s cold","example":"En invierno hace frío."},
      {"term":"Está lloviendo","translation":"It''s raining","example":"Lleva paraguas, está lloviendo."},
      {"term":"Hace sol","translation":"It''s sunny","example":"Vamos a la playa, hace sol."}
   ]}',
   'Weather uses *hacer* (hace calor/frío/sol) or *estar* + gerund (está lloviendo).', 7),
  (5, 'Asking for directions', 'roleplay',
   '{"scenario":"You are lost in Mexico City and need to reach the metro station. Stop a passer-by, ask for directions, and confirm you understood.","persona":"Helpful local in a hurry","goal":"Repeat the directions back correctly before saying goodbye"}',
   null, 10)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = '11111111-1111-1111-1111-111111111112' and l.position = v.pos
);

-- ============ French A1 starter ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  '44444444-4444-4444-4444-444444444441',
  'fr', 'fr',
  'French for travel — first steps',
  'Greetings, cafés, directions, and polite essentials for your first trip.',
  'A1', 'travel', 1, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select '44444444-4444-4444-4444-444444444441', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Greetings & politeness', 'vocab',
   '{"items":[
      {"term":"bonjour","translation":"hello / good day","ipa":"bɔ̃.ʒuʁ","example":"Bonjour, comment allez-vous ?"},
      {"term":"merci beaucoup","translation":"thank you very much","ipa":"mɛʁ.si bo.ku","example":"Merci beaucoup, madame."},
      {"term":"s''il vous plaît","translation":"please (formal)","ipa":"sil vu plɛ","example":"Un café, s''il vous plaît."},
      {"term":"excusez-moi","translation":"excuse me","ipa":"ɛk.sky.ze mwa","example":"Excusez-moi, où est le métro ?"},
      {"term":"au revoir","translation":"goodbye","ipa":"o ʁə.vwaʁ","example":"Au revoir, à demain !"}
   ]}',
   'French politeness is non-negotiable: open every interaction with *bonjour* before anything else.', 8),
  (2, 'Numbers 1–20', 'vocab',
   '{"items":[
      {"term":"un, deux, trois","translation":"one, two, three","example":"Un, deux, trois, partez !"},
      {"term":"quatre, cinq, six","translation":"four, five, six","example":"Il y a cinq personnes."},
      {"term":"sept, huit, neuf, dix","translation":"seven, eight, nine, ten","example":"Le train part à dix heures."},
      {"term":"quinze","translation":"fifteen","example":"J''ai quinze euros."},
      {"term":"vingt","translation":"twenty","example":"Vingt minutes, s''il vous plaît."}
   ]}',
   'Final consonants are usually silent: *vingt* sounds like "van".', 7),
  (3, 'At the café', 'roleplay',
   '{"scenario":"A Paris café at 9am. Order a coffee and a croissant, ask for the wifi password, and pay by card.","persona":"Brisk Parisian waiter","goal":"Complete the order without switching to English"}',
   null, 10),
  (4, 'Finding your way', 'vocab',
   '{"items":[
      {"term":"où est… ?","translation":"where is…?","ipa":"u ɛ","example":"Où est la gare ?"},
      {"term":"à gauche","translation":"to the left","ipa":"a ɡoʃ","example":"Tournez à gauche."},
      {"term":"à droite","translation":"to the right","ipa":"a dʁwat","example":"C''est à droite."},
      {"term":"tout droit","translation":"straight ahead","ipa":"tu dʁwa","example":"Continuez tout droit."}
   ]}',
   'Careful: *à droite* (right) vs *tout droit* (straight ahead) — classic mix-up.', 7),
  (5, 'Hotel check-in', 'roleplay',
   '{"scenario":"You arrive at a small hotel in Lyon with a reservation. Check in, ask about breakfast times, and request a quiet room.","persona":"Polite hotel receptionist","goal":"Get your key and confirm breakfast time"}',
   null, 10)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = '44444444-4444-4444-4444-444444444441' and l.position = v.pos
);

-- ============ Italian A1 starter ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  '55555555-5555-5555-5555-555555555551',
  'it', 'it',
  'Italian for travel — first steps',
  'Greetings, ordering, and getting around for your first Italian trip.',
  'A1', 'travel', 1, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select '55555555-5555-5555-5555-555555555551', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Greetings & introductions', 'vocab',
   '{"items":[
      {"term":"ciao","translation":"hi / bye (informal)","ipa":"ˈtʃa.o","example":"Ciao, come stai?"},
      {"term":"buongiorno","translation":"good morning","ipa":"bwonˈdʒor.no","example":"Buongiorno, signora!"},
      {"term":"mi chiamo","translation":"my name is","ipa":"mi ˈkja.mo","example":"Mi chiamo Marco."},
      {"term":"piacere","translation":"nice to meet you","ipa":"pjaˈtʃe.re","example":"Piacere, sono Anna."},
      {"term":"grazie mille","translation":"thanks a lot","ipa":"ˈɡrat.tsje ˈmil.le","example":"Grazie mille per tutto!"}
   ]}',
   '*Ciao* is informal only — use *buongiorno/buonasera* with strangers.', 8),
  (2, 'Numbers 1–20', 'vocab',
   '{"items":[
      {"term":"uno, due, tre","translation":"one, two, three","example":"Tre gelati, per favore."},
      {"term":"quattro, cinque, sei","translation":"four, five, six","example":"Siamo in cinque."},
      {"term":"dieci","translation":"ten","example":"Dieci euro, grazie."},
      {"term":"venti","translation":"twenty","example":"Il treno parte alle venti."}
   ]}',
   'Double consonants matter: *sette* (seven) needs both t''s.', 7),
  (3, 'At the gelateria', 'roleplay',
   '{"scenario":"A gelateria in Florence. Ask what flavors they recommend, order two scoops in a cone, and pay.","persona":"Enthusiastic gelato maker","goal":"Order using only Italian, including flavors"}',
   null, 10),
  (4, 'Getting around', 'vocab',
   '{"items":[
      {"term":"dov''è… ?","translation":"where is…?","ipa":"doˈvɛ","example":"Dov''è la stazione?"},
      {"term":"a sinistra","translation":"to the left","example":"Giri a sinistra."},
      {"term":"a destra","translation":"to the right","example":"Il duomo è a destra."},
      {"term":"dritto","translation":"straight ahead","example":"Vada sempre dritto."}
   ]}',
   null, 7),
  (5, 'Ordering dinner', 'roleplay',
   '{"scenario":"A trattoria in Rome. Ask for the menu, order a primo and a drink, and ask for the bill.","persona":"Warm Roman waiter proud of the house pasta","goal":"Complete dinner from menu to bill in Italian"}',
   null, 10)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = '55555555-5555-5555-5555-555555555551' and l.position = v.pos
);

-- ============ Portuguese A1 starter ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  '66666666-6666-6666-6666-666666666661',
  'pt', 'br',
  'Portuguese for travel — first steps',
  'Brazilian Portuguese essentials: greetings, food, and getting around.',
  'A1', 'travel', 1, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select '66666666-6666-6666-6666-666666666661', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Greetings & introductions', 'vocab',
   '{"items":[
      {"term":"oi","translation":"hi","ipa":"oj","example":"Oi, tudo bem?"},
      {"term":"tudo bem?","translation":"how are you? / all good?","ipa":"ˈtu.du bẽj","example":"Oi Maria, tudo bem?"},
      {"term":"me chamo","translation":"my name is","ipa":"mi ˈʃɐ.mu","example":"Me chamo Pedro."},
      {"term":"prazer","translation":"nice to meet you","ipa":"pɾaˈzeʁ","example":"Prazer, sou a Ana."},
      {"term":"obrigado / obrigada","translation":"thank you (m/f)","ipa":"o.bɾiˈɡa.du","example":"Obrigada pela ajuda!"}
   ]}',
   '*Obrigado* agrees with the SPEAKER: men say obrigado, women say obrigada.', 8),
  (2, 'Numbers 1–20', 'vocab',
   '{"items":[
      {"term":"um, dois, três","translation":"one, two, three","example":"Dois cafés, por favor."},
      {"term":"quatro, cinco, seis","translation":"four, five, six","example":"São seis reais."},
      {"term":"dez","translation":"ten","example":"Dez minutos de espera."},
      {"term":"vinte","translation":"twenty","example":"Custa vinte reais."}
   ]}',
   null, 7),
  (3, 'At the juice bar', 'roleplay',
   '{"scenario":"A juice bar in Rio. Ask what fruits are fresh today, order a juice and a snack, and pay.","persona":"Cheerful carioca vendor","goal":"Order and pay entirely in Portuguese"}',
   null, 10),
  (4, 'Getting around', 'vocab',
   '{"items":[
      {"term":"onde fica… ?","translation":"where is…?","ipa":"ˈõ.dʒi ˈfi.kɐ","example":"Onde fica a praia?"},
      {"term":"à esquerda","translation":"to the left","example":"Vire à esquerda."},
      {"term":"à direita","translation":"to the right","example":"O banco é à direita."},
      {"term":"em frente","translation":"straight ahead","example":"Siga em frente."}
   ]}',
   null, 7),
  (5, 'Beach day plans', 'roleplay',
   '{"scenario":"Making plans with a new Brazilian friend to meet at Ipanema tomorrow. Agree on a time, what to bring, and where exactly to meet.","persona":"Laid-back local friend","goal":"Confirm time and meeting point"}',
   null, 10)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = '66666666-6666-6666-6666-666666666661' and l.position = v.pos
);
