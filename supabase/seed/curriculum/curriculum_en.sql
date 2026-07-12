-- English curriculum pack (dialect: US): a CEFR-aligned track for non-native
-- learners, from first words to confident work conversations.
--   A1 "Foundations"            — introductions, numbers & prices, food, routines, shopping
--   A2 "Everyday life"          — past tenses, plans, health, work small talk, transport
--   B1 "Confident conversations"— storytelling, conditionals, interviews, complaints, news
-- Fixed UUIDs make re-runs idempotent (insert … on conflict / where not exists).
-- The "translation" field holds a simple-English definition, since the target
-- language is English itself.

-- ============ English A1 — Foundations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0005-0000-4000-8000-000000000001',
  'en', 'us',
  'English A1 — Foundations',
  'Introduce yourself, handle numbers and prices, order food, and talk about your day — the essentials for getting started in American English.',
  'A1', 'daily_life', 10, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0005-0000-4000-8000-000000000001', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Meeting people', 'vocab',
   '{"items":[
      {"term":"Hi, I''m…","translation":"a friendly way to say hello and give your name","ipa":"haɪ aɪm","example":"Hi, I''m Carlos. Nice to meet you."},
      {"term":"Nice to meet you","translation":"a polite phrase for meeting someone for the first time","ipa":"naɪs tə ˈmit ju","example":"Nice to meet you too, Sarah!"},
      {"term":"Where are you from?","translation":"a question about someone''s country or city","ipa":"wɛr ɑr ju ˈfrʌm","example":"Where are you from? — I''m from Brazil."},
      {"term":"How''s it going?","translation":"a casual way to ask how someone is","ipa":"haʊz ɪt ˈɡoʊɪŋ","example":"Hey Tom, how''s it going?"},
      {"term":"See you later","translation":"a casual way to say goodbye","ipa":"ˈsi ju ˈleɪtər","example":"I have to go now. See you later!"}
   ]}',
   'In the US, *How''s it going?* works like a greeting, not a real question — a quick *Good, thanks!* is the expected answer.', 8),
  (2, 'Numbers and prices', 'vocab',
   '{"items":[
      {"term":"How much is this?","translation":"a question to ask the price of something","ipa":"haʊ ˈmʌtʃ ɪz ðɪs","example":"Excuse me, how much is this hat?"},
      {"term":"four fifty","translation":"a short way to say $4.50","ipa":"ˈfɔr ˈfɪfti","example":"The coffee is four fifty."},
      {"term":"thirteen / thirty","translation":"13 and 30 — listen for the stress to tell them apart","ipa":"θɜrˈtin / ˈθɜrti","example":"Wait — is it thirteen dollars or thirty?"},
      {"term":"a buck","translation":"an informal word for one dollar","ipa":"ə ˈbʌk","example":"Water is just a buck at this store."},
      {"term":"Keep the change","translation":"a phrase that lets the cashier keep the extra money","ipa":"ˈkip ðə ˈtʃeɪndʒ","example":"Here''s a ten — keep the change."}
   ]}',
   'Americans read prices in pairs: $4.50 is *four fifty*, $12.99 is *twelve ninety-nine*. The word *dollars* is usually dropped.', 7),
  (3, 'Be, have, and do', 'grammar',
   '{"sections":[
      {"heading":"The verb be: am, is, are","text":"Use *be* for names, feelings, jobs, and places: I am tired. She is a nurse. We are from Peru. In speech it almost always contracts: I''m, she''s, we''re. Negative: I''m not, she isn''t, they aren''t."},
      {"heading":"Have and has","text":"Use *have* for possession and family: I have two brothers. He has a new phone. Only he/she/it changes: has. Negative uses do: I don''t have a car. She doesn''t have time."},
      {"heading":"Do: the question machine","text":"For most verbs, questions and negatives need *do* or *does*: Do you work here? Does she like coffee? I don''t know. Notice the main verb stays in its base form: Does she like (not likes)."}
   ]}',
   null, 10),
  (4, 'Ordering food', 'vocab',
   '{"items":[
      {"term":"Can I get…?","translation":"the most common way to order in the US","ipa":"kæn aɪ ˈɡɛt","example":"Can I get a cheeseburger and a small fries?"},
      {"term":"I''ll have…","translation":"a slightly more formal way to order","ipa":"aɪl ˈhæv","example":"I''ll have the chicken sandwich, please."},
      {"term":"For here or to go?","translation":"a question asking if you will eat in the restaurant or take the food away","ipa":"fər ˈhɪr ɔr tə ˈɡoʊ","example":"For here or to go? — To go, please."},
      {"term":"Anything else?","translation":"a question the server asks to see if you want more","ipa":"ˈɛniθɪŋ ˈɛls","example":"Anything else? — No, that''s it, thanks."},
      {"term":"Can we get the check?","translation":"how to ask for the bill at a restaurant","ipa":"kæn wi ˈɡɛt ðə ˈtʃɛk","example":"Excuse me, can we get the check?"}
   ]}',
   'In the US it''s the *check*, not the bill — and *Can I get…?* sounds friendlier than *I want…*, which can feel rude.', 8),
  (5, 'Breakfast at a diner', 'roleplay',
   '{"scenario":"A classic American diner at 8am. Order eggs, toast, and coffee, answer the server''s questions about how you want everything cooked, and ask for the check at the end.","persona":"Chatty diner server who calls everyone honey and talks fast","goal":"Order a full breakfast, answer at least two follow-up questions, and get the check"}',
   null, 10),
  (6, 'Daily routines', 'vocab',
   '{"items":[
      {"term":"wake up","translation":"to stop sleeping","ipa":"weɪk ˈʌp","example":"I wake up at 6:30 every day."},
      {"term":"get ready","translation":"to prepare yourself — shower, dress, and so on","ipa":"ɡɛt ˈrɛdi","example":"It takes me twenty minutes to get ready."},
      {"term":"commute","translation":"to travel between home and work","ipa":"kəˈmjut","example":"I commute by bus, and it takes an hour."},
      {"term":"grab lunch","translation":"to get lunch quickly, often with someone","ipa":"ɡræb ˈlʌntʃ","example":"Want to grab lunch around noon?"},
      {"term":"go to bed","translation":"to lie down to sleep at night","ipa":"ɡoʊ tə ˈbɛd","example":"On weekdays I go to bed at eleven."}
   ]}',
   'Daily routines use the present simple, and he/she/it adds -s: *She wakes up at six. He commutes by train.*', 7),
  (7, 'A Tuesday in Chicago', 'reading',
   '{"sections":[
      {"heading":"Read the story","text":"Maria lives in Chicago. On weekdays she wakes up at 6:30 and makes coffee. She commutes downtown on the L train — it takes 35 minutes. At work she answers emails and goes to meetings. At noon she grabs lunch with her coworker Dan. They usually get tacos for eight bucks. After work she buys groceries, cooks dinner, and watches one episode of a show. She goes to bed at 11."},
      {"heading":"Check yourself","text":"Answer without looking back: What time does Maria wake up? How does she get to work? Who does she eat lunch with, and how much do the tacos cost? Then read again and check your answers."},
      {"heading":"Language to steal","text":"Notice the verbs with -s after she: lives, wakes, makes, grabs, goes. Notice *it takes 35 minutes* for travel time, and *eight bucks* for an informal price."}
   ]}',
   null, 8),
  (8, 'Shopping basics', 'vocab',
   '{"items":[
      {"term":"I''m just looking","translation":"what you say when a clerk offers help but you don''t need it","ipa":"aɪm dʒʌst ˈlʊkɪŋ","example":"Can I help you find anything? — I''m just looking, thanks."},
      {"term":"Do you have this in a medium?","translation":"a question asking for a different size","ipa":"du ju ˈhæv ðɪs ɪn ə ˈmidiəm","example":"I love this shirt. Do you have this in a medium?"},
      {"term":"fitting room","translation":"the small room where you try on clothes","ipa":"ˈfɪtɪŋ rum","example":"The fitting rooms are in the back, on the left."},
      {"term":"on sale","translation":"selling at a lower price than usual","ipa":"ɑn ˈseɪl","example":"These jeans are on sale — thirty percent off."},
      {"term":"receipt","translation":"the paper that proves you paid","ipa":"rɪˈsit","example":"Keep your receipt in case you want to return it."}
   ]}',
   'Watch the spelling trap: the *p* in *receipt* is silent — it rhymes with *seat*.', 7),
  (9, 'At the clothing store', 'roleplay',
   '{"scenario":"A clothing store at the mall. You want jeans. Tell the clerk your size, ask about colors and the price, try a pair on in the fitting room, and decide whether to buy them.","persona":"Helpful but slightly pushy sales clerk who keeps suggesting extra items","goal":"Get the right size, learn the sale price, and politely say no to at least one extra item"}',
   null, 10),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Which sentence is correct?","options":["She have a car.","She has a car.","She haves a car.","She is have a car."],"answer":1,"explanation":"With he/she/it, *have* becomes *has*: She has a car."},
      {"prompt":"The most natural way to order at a café is:","options":["I want coffee.","Give me a coffee.","Can I get a coffee?","You bring coffee."],"answer":2,"explanation":"*Can I get…?* is the standard friendly way to order in the US."},
      {"prompt":"\"How much is this?\" asks about…","options":["the time","the price","the size","the color"],"answer":1,"explanation":"*How much…?* asks the price."},
      {"prompt":"$7.50 is usually said as…","options":["seven and fifty","seven fifty","seventy-five","fifty-seven"],"answer":1,"explanation":"Prices are read in pairs: $7.50 = seven fifty."},
      {"prompt":"You say \"I''m just looking\" when…","options":["you want the check","a clerk offers help but you don''t need it","you can''t find the exit","you want a discount"],"answer":1,"explanation":"It politely tells the clerk you''re browsing and don''t need help yet."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0005-0000-4000-8000-000000000001' and l.position = v.pos
);

-- ============ English A2 — Everyday life ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0005-0000-4000-8000-000000000002',
  'en', 'us',
  'English A2 — Everyday life',
  'Tell people what happened, make plans, handle the pharmacy and the doctor, chat with coworkers, and get around town.',
  'A2', 'daily_life', 11, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0005-0000-4000-8000-000000000002', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Past simple vs. past continuous', 'grammar',
   '{"sections":[
      {"heading":"Two past tenses, two jobs","text":"The past simple reports finished events: I lost my keys. We watched a movie. The past continuous (was/were + -ing) paints the background — what was in progress: I was walking home. It was raining."},
      {"heading":"The classic combo","text":"Put them together to show an interruption: I was cooking dinner when the phone rang. The long background action takes the continuous; the short event that cuts in takes the simple. *When* usually introduces the event, *while* the background: While I was cooking, the phone rang."},
      {"heading":"Watch the irregulars","text":"Many everyday verbs are irregular in the past simple: go → went, get → got, take → took, ring → rang, lose → lost. There''s no shortcut — you meet them, you keep them."}
   ]}',
   null, 10),
  (2, 'Talking about the past', 'vocab',
   '{"items":[
      {"term":"the other day","translation":"a few days ago, without saying exactly when","ipa":"ði ˈʌðər ˈdeɪ","example":"I saw Jake at the store the other day."},
      {"term":"a couple of…","translation":"about two — days, weeks, years","ipa":"ə ˈkʌpəl əv","example":"We moved here a couple of years ago."},
      {"term":"while","translation":"during the time that something was happening","ipa":"waɪl","example":"She called while I was cooking dinner."},
      {"term":"at first","translation":"in the beginning, before things changed","ipa":"æt ˈfɜrst","example":"At first I didn''t like the city, but now I love it."},
      {"term":"run into","translation":"to meet someone by chance","ipa":"rʌn ˈɪntu","example":"Guess who I ran into at the gym!"}
   ]}',
   '*Ago* goes after the time period, never before it: *two years ago*, not *ago two years*.', 7),
  (3, 'Making plans: going to and present continuous', 'grammar',
   '{"sections":[
      {"heading":"Going to for intentions","text":"Use *be going to* for things you''ve decided to do: I''m going to look for a new apartment. We''re going to visit my parents in June. In fast speech it becomes *gonna* — fine to say, avoid in writing."},
      {"heading":"Present continuous for arrangements","text":"When a plan is fixed — time set, people told — Americans just use the present continuous: I''m seeing the dentist on Friday. We''re having dinner with Sam tomorrow. The future meaning comes from the time word."},
      {"heading":"Inviting and suggesting","text":"Common moves for making plans together: Do you want to grab dinner Saturday? How about seven? Works for me. I can''t make it Friday — can we do Sunday instead?"}
   ]}',
   null, 9),
  (4, 'Weekend plans with a friend', 'roleplay',
   '{"scenario":"Texting turned into a phone call: you and a friend are planning Saturday. Suggest an activity, negotiate the time and meeting place, and handle it when your friend says they''re busy in the morning.","persona":"Easygoing friend who is free only after 2pm and keeps floating alternatives","goal":"Agree on one activity, a time, and a meeting spot, then confirm the plan in one sentence"}',
   null, 10),
  (5, 'Pharmacy and doctor', 'vocab',
   '{"items":[
      {"term":"I have a headache","translation":"how to describe pain in your head; also: a sore throat, a fever, a cough","ipa":"aɪ hæv ə ˈhɛdeɪk","example":"I''ve had a headache since this morning."},
      {"term":"over-the-counter","translation":"describes medicine you can buy without a prescription","ipa":"ˈoʊvər ðə ˈkaʊntər","example":"Is there anything over-the-counter for allergies?"},
      {"term":"prescription","translation":"a doctor''s written order for medicine","ipa":"prɪˈskrɪpʃən","example":"The doctor gave me a prescription for antibiotics."},
      {"term":"side effects","translation":"unwanted extra effects a medicine can cause","ipa":"ˈsaɪd ɪˌfɛkts","example":"Does this have any side effects, like drowsiness?"},
      {"term":"twice a day","translation":"two times every day — how often to take medicine","ipa":"twaɪs ə ˈdeɪ","example":"Take one pill twice a day with food."}
   ]}',
   'Use *have* + *a* for most symptoms: *I have a fever / a cough / a sore throat.* Exception: *my back hurts* uses the verb *hurt*.', 8),
  (6, 'At the walk-in clinic', 'roleplay',
   '{"scenario":"You''ve had a sore throat and a fever for two days, so you go to a walk-in clinic. Check in at the front desk, describe your symptoms and when they started, answer the doctor''s questions, and make sure you understand the instructions for the medicine.","persona":"Kind but efficient doctor who asks precise questions about symptoms and timing","goal":"Describe two symptoms with their timing, and repeat back how often to take the medicine"}',
   null, 11),
  (7, 'Small talk and opinions at work', 'vocab',
   '{"items":[
      {"term":"How was your weekend?","translation":"the standard Monday-morning question at work","ipa":"haʊ wəz jʊr ˈwikˌɛnd","example":"Morning! How was your weekend? — Pretty good, really quiet."},
      {"term":"Not bad","translation":"a common answer meaning fairly good","ipa":"nɑt ˈbæd","example":"How''s the new job? — Not bad, actually. I like the team."},
      {"term":"in my opinion","translation":"a phrase that introduces what you think","ipa":"ɪn maɪ əˈpɪnjən","example":"In my opinion, the morning meeting is too long."},
      {"term":"I totally agree","translation":"a strong, friendly way to say someone is right","ipa":"aɪ ˈtoʊtəli əˈɡri","example":"We need more time for this project. — I totally agree."},
      {"term":"I''m not so sure","translation":"a soft, polite way to disagree","ipa":"aɪm nɑt soʊ ˈʃʊr","example":"I''m not so sure about that — it could cost too much."}
   ]}',
   'Disagreeing head-on can sound harsh at work. Soften it: *I''m not so sure*, *I see your point, but…*, *Maybe, but…*.', 8),
  (8, 'Getting around town', 'vocab',
   '{"items":[
      {"term":"catch the bus","translation":"to get on the bus in time","ipa":"kætʃ ðə ˈbʌs","example":"I have to leave now or I''ll miss the bus — I catch it at 8:10."},
      {"term":"transfer","translation":"to change from one bus or train to another","ipa":"ˈtrænsfər","example":"Take the blue line and transfer to the red line at Central."},
      {"term":"rush hour","translation":"the busy time when everyone travels to or from work","ipa":"ˈrʌʃ ˌaʊər","example":"Avoid the subway during rush hour if you can."},
      {"term":"round-trip","translation":"describes a ticket that goes there and comes back","ipa":"ˈraʊnd ˈtrɪp","example":"A round-trip ticket to Boston is cheaper than two one-ways."},
      {"term":"layover","translation":"a wait between two flights","ipa":"ˈleɪˌoʊvər","example":"We have a three-hour layover in Denver."}
   ]}',
   'US vs UK heads-up: Americans say *round-trip* and *one-way* tickets — not *return* and *single*.', 7),
  (9, 'Writing: my last trip', 'writing',
   '{"sections":[
      {"heading":"The task","text":"Write 80–120 words about a trip you took — real or invented. Say where you went, who you went with, two things you did, and one thing that went wrong or surprised you. Use the past simple for events and the past continuous for background."},
      {"heading":"Useful language","text":"Last summer I went to… / We stayed in a small hotel near… / On the second day we visited… / While we were walking around, it started to rain. / The best part was… / Next time, I''m going to…"},
      {"heading":"Model paragraph","text":"Last spring I went to Austin with my sister. We stayed downtown and rented bikes. On the first day we visited the state capitol and ate way too many tacos. While we were watching the bats fly out from the bridge, my phone died, so I have no photos! The best part was the live music on Sixth Street. Next time, I''m going to bring a charger."}
   ]}',
   null, 12),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"Choose the correct sentence:","options":["I was cooking when the phone rang.","I was cook when the phone rang.","I cooking when the phone rang.","I was cooking when the phone was ring."],"answer":0,"explanation":"Background action in past continuous (was cooking) + interrupting event in past simple (rang)."},
      {"prompt":"\"I''m seeing the dentist on Friday\" describes…","options":["a habit","a fixed plan","a past event","a wish"],"answer":1,"explanation":"Present continuous + a time expression = a fixed future arrangement."},
      {"prompt":"You can buy over-the-counter medicine…","options":["only with a prescription","without a prescription","only at the doctor''s office","only twice a day"],"answer":1,"explanation":"Over-the-counter means no prescription is needed."},
      {"prompt":"\"I ran into Maria\" means…","options":["I hit Maria with my car","I met Maria by chance","I ran faster than Maria","I called Maria"],"answer":1,"explanation":"*Run into someone* = meet them unexpectedly."},
      {"prompt":"Which reply politely disagrees?","options":["I totally agree.","That makes sense.","I''m not so sure about that.","Sounds good."],"answer":2,"explanation":"*I''m not so sure* softens disagreement — common in US workplaces."},
      {"prompt":"A round-trip ticket takes you…","options":["one way only","to your destination and back","around the city center","to the airport"],"answer":1,"explanation":"Round-trip = there and back; the one-direction ticket is one-way."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0005-0000-4000-8000-000000000002' and l.position = v.pos
);

-- ============ English B1 — Confident conversations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0005-0000-4000-8000-000000000003',
  'en', 'us',
  'English B1 — Confident conversations',
  'Tell stories that land, debate opinions, handle a job interview, push back on a bad product, and read the news — English that works at work.',
  'B1', 'work', 12, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0005-0000-4000-8000-000000000003', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Telling stories: narrative tenses', 'grammar',
   '{"sections":[
      {"heading":"Set the scene, then move","text":"Good stories layer three tenses. Past continuous sets the scene: I was waiting for the bus. Past simple moves the action: A guy walked up and asked for directions. Past perfect jumps back earlier: I realized I had left my wallet at home."},
      {"heading":"Past perfect: the flashback tense","text":"Had + past participle marks that one event happened before another past event: When we got to the gate, the flight had already boarded. Without it, listeners assume events happened in the order you say them."},
      {"heading":"Keep the listener with you","text":"Sequence with *so*, *then*, *meanwhile*, and *by the time*: So then the manager showed up. Meanwhile, my phone was dying. By the time we sorted it out, the store had closed. Spoken stories also love the historic present for drama: So this guy walks up to me and says…"}
   ]}',
   null, 10),
  (2, 'Storytelling expressions', 'vocab',
   '{"items":[
      {"term":"You won''t believe this","translation":"a hook that signals a surprising story is coming","ipa":"ju woʊnt bɪˈliv ðɪs","example":"You won''t believe this — I got upgraded to first class."},
      {"term":"all of a sudden","translation":"very quickly and unexpectedly","ipa":"ˌɔl əv ə ˈsʌdən","example":"We were driving along, and all of a sudden the engine just died."},
      {"term":"it turns out","translation":"introduces the surprising fact you learned later","ipa":"ɪt tɜrnz ˈaʊt","example":"It turns out the \"stranger\" at the door was my new neighbor."},
      {"term":"long story short","translation":"a signal that you''re skipping the details to give the ending","ipa":"lɔŋ ˈstɔri ˈʃɔrt","example":"Long story short, we missed the flight but got home okay."},
      {"term":"in the end","translation":"after everything, finally","ipa":"ɪn ði ˈɛnd","example":"In the end, the airline refunded the whole ticket."}
   ]}',
   'These phrases are the road signs of a story: hook (*you won''t believe this*), twist (*it turns out*), and landing (*long story short, in the end*). Use one of each and any story holds together.', 8),
  (3, 'Conditionals: zero, first, and second', 'grammar',
   '{"sections":[
      {"heading":"Zero: facts and rules","text":"If + present, present — for things that are always true: If you press this button, the machine stops. If I drink coffee after 6, I don''t sleep."},
      {"heading":"First: real future possibilities","text":"If + present, will — for things that may really happen: If the client signs today, we''ll start Monday. Never put *will* in the if-clause: If it rains (not: if it will rain), we''ll cancel."},
      {"heading":"Second: imagined situations","text":"If + past, would — for unreal or unlikely situations now: If I had more time, I would learn Japanese. If I were you, I''d ask for a raise. The past tense here doesn''t mean past time — it marks distance from reality. Note the polite workplace favorite: It would be great if we could move the deadline."}
   ]}',
   null, 10),
  (4, 'Friendly debate: remote work', 'roleplay',
   '{"scenario":"Lunch with a coworker turns into a friendly debate: should your company go fully remote, or come back to the office three days a week? Take a side, defend it with concrete reasons, and respond to your coworker''s counterarguments without getting personal.","persona":"Sharp, good-humored coworker who firmly takes the opposite side of whatever you argue and pushes back with specifics","goal":"Give two supported arguments, concede one fair point, and use at least one conditional (If we went fully remote, …)"}',
   null, 12),
  (5, 'Job interview language', 'vocab',
   '{"items":[
      {"term":"Walk me through…","translation":"a request to explain something step by step","ipa":"wɔk mi ˈθru","example":"Walk me through your last project — what was your role?"},
      {"term":"strengths and weaknesses","translation":"the things you do well and the things you struggle with","ipa":"strɛŋkθs ənd ˈwiknəsəz","example":"My main strength is staying calm under pressure."},
      {"term":"a good fit","translation":"a person who matches the job and the team well","ipa":"ə ɡʊd ˈfɪt","example":"I think I''d be a good fit because I''ve done this kind of work before."},
      {"term":"work under pressure","translation":"to do your job well even when there is stress or little time","ipa":"wɜrk ˈʌndər ˈprɛʃər","example":"Retail taught me how to work under pressure during the holidays."},
      {"term":"follow up","translation":"to contact someone again after a meeting or application","ipa":"ˈfɑloʊ ˈʌp","example":"I''ll follow up by email early next week."}
   ]}',
   'Interview answers land best in the past simple with a result: *I led X, which cut costs by 15%.* Practice one two-sentence story per strength.', 8),
  (6, 'The job interview', 'roleplay',
   '{"scenario":"A video interview for a customer success coordinator role at a mid-size tech company. Introduce yourself, walk the interviewer through your experience, answer a behavioral question about a difficult customer, and ask two smart questions of your own at the end.","persona":"Professional, friendly hiring manager who asks follow-up questions and one curveball: where do you see yourself in three years?","goal":"Tell one structured past-experience story and ask two questions about the role or team"}',
   null, 12),
  (7, 'Phrasal verbs at work', 'vocab',
   '{"items":[
      {"term":"figure out","translation":"to find the answer or solution after some thought","ipa":"ˈfɪɡjər ˈaʊt","example":"We still need to figure out why the report numbers don''t match."},
      {"term":"put off","translation":"to delay something until later","ipa":"pʊt ˈɔf","example":"Let''s not put off this decision again — we''ve delayed it twice."},
      {"term":"bring up","translation":"to start talking about a topic","ipa":"brɪŋ ˈʌp","example":"Good point — can you bring that up in tomorrow''s meeting?"},
      {"term":"run something by someone","translation":"to tell someone your idea to get their opinion or approval","ipa":"rʌn ˈsʌmθɪŋ ˈbaɪ","example":"Before I send this to the client, can I run it by you?"},
      {"term":"catch up on","translation":"to do the things you missed or fell behind on","ipa":"kætʃ ˈʌp ɑn","example":"I spent Monday catching up on emails from my vacation."}
   ]}',
   'Separable phrasal verbs let the object move — *bring up the issue* or *bring the issue up* — but pronouns must go in the middle: *bring it up*, never *bring up it*.', 8),
  (8, 'Returning a faulty blender', 'roleplay',
   '{"scenario":"The $89 blender you bought three weeks ago stopped working. Back at the store, the first clerk says returns are only accepted within 14 days. Stay polite but firm: explain the problem, point out the one-year warranty, and escalate to a manager if needed.","persona":"Skeptical customer service clerk who quotes the 14-day return policy, then a pragmatic manager if you ask to escalate","goal":"Get a refund or a replacement without raising your voice, using at least one polite-but-firm phrase like: I understand, but the warranty covers this."}',
   null, 11),
  (9, 'Reading the news', 'reading',
   '{"sections":[
      {"heading":"Headline grammar is its own dialect","text":"Headlines drop small words and bend tenses. Present simple = past event: Mayor cuts transit fares (it already happened). To + verb = planned future: Mayor to cut transit fares. -ing or a past participle drops the verb be: City expanding bike lanes. Three arrested downtown."},
      {"heading":"Read it twice, differently","text":"First pass: skim the headline, the first paragraph, and any quote — news puts the who/what/when up top, so 30 seconds gets you the core. Second pass: read fully and hunt for hedges like reportedly, allegedly, according to — they tell you how solid each claim is."},
      {"heading":"Practice article","text":"CITY TO EXPAND FERRY SERVICE — The city council approved a plan Tuesday to add three ferry routes by next summer. Officials say the routes could carry 4,000 riders a day, though the projected $12 million cost has reportedly grown since the plan was first proposed. Riders will pay the same fare as the subway, according to the transit authority. Now test yourself: has the expansion happened yet? Which two claims come with hedges attached?"}
   ]}',
   null, 9),
  (10, 'Checkpoint quiz', 'quiz',
   '{"questions":[
      {"prompt":"\"If I had more time, I would learn Japanese.\" The speaker…","options":["had time in the past","has a definite plan","is imagining a situation that isn''t true now","is talking about a schedule"],"answer":2,"explanation":"Second conditional (past + would) describes an unreal or unlikely present situation."},
      {"prompt":"Which sentence uses the past perfect correctly?","options":["When we got there, the movie had already started.","When we had got there, the movie already starts.","The movie already start when we got there.","When we got there, the movie has already start."],"answer":0,"explanation":"Past perfect (had started) marks the earlier of two past events."},
      {"prompt":"\"Long story short\" introduces…","options":["a detailed explanation","a quick summary of how things ended","a complaint","a question"],"answer":1,"explanation":"It signals you''re skipping the details and jumping to the outcome."},
      {"prompt":"In an interview, \"Walk me through your resume\" means…","options":["describe your experience step by step","hand over your resume","leave the room and come back","talk about your hobbies"],"answer":0,"explanation":"*Walk me through X* = explain X step by step."},
      {"prompt":"\"Let''s not put off the decision\" means let''s…","options":["delay it","not delay it","cancel it","announce it"],"answer":1,"explanation":"*Put off* = delay, and the *not* negates it: decide now."},
      {"prompt":"A headline says \"Mayor to cut transit fares.\" The mayor…","options":["cut fares in the past","plans to cut fares","refuses to cut fares","cut fares many times"],"answer":1,"explanation":"In headlines, *to + verb* signals a planned or future action."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0005-0000-4000-8000-000000000003' and l.position = v.pos
);
