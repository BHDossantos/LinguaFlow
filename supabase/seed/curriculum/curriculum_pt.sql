-- Brazilian Portuguese curriculum pack (dialect 'br'): a CEFR-aligned track
-- from A1 to B1 — 3 courses × 10 lessons. A1 covers first conversations,
-- numbers, padaria/restaurante and daily routines; A2 covers past tenses,
-- plans, health, work small talk and transport; B1 covers storytelling,
-- the subjunctive, debating, job interviews, complaints and the news.
-- Fixed UUIDs make re-runs idempotent (insert … on conflict / not exists).

-- ============ Course 1: Portuguese A1 — Foundations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0004-0000-4000-8000-000000000001',
  'pt', 'br',
  'Portuguese A1 — Foundations',
  'Introduce yourself, handle numbers and prices, order at the padaria and the restaurante, and talk about your day — with ser, estar and ter in the present.',
  'A1', 'daily_life', 10, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0004-0000-4000-8000-000000000001', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Introducing yourself', 'vocab',
   '{"items":[
      {"term":"Meu nome é…","translation":"My name is…","ipa":"mew ˈno.mi ɛ","example":"Meu nome é Carlos, e o seu?"},
      {"term":"Muito prazer","translation":"Nice to meet you","ipa":"ˈmũj.tu pɾaˈzeʁ","example":"Muito prazer, dona Lúcia."},
      {"term":"De onde você é?","translation":"Where are you from?","ipa":"dʒi ˈõ.dʒi voˈse ɛ","example":"De onde você é? Sou do Recife."},
      {"term":"Eu sou de…","translation":"I am from…","example":"Eu sou de Salvador, na Bahia."},
      {"term":"Eu moro em…","translation":"I live in…","example":"Eu moro em São Paulo com minha família."},
      {"term":"Tudo bom?","translation":"How''s it going? / All good?","ipa":"ˈtu.du bõ","example":"Oi, Rafael! Tudo bom?"}
   ]}',
   '*Você* takes third-person verb forms — *você é*, *você mora* — and is far more common in Brazil than *tu*.', 8),
  (2, 'Numbers & prices', 'vocab',
   '{"items":[
      {"term":"trinta, quarenta, cinquenta","translation":"thirty, forty, fifty","example":"O livro custa cinquenta reais."},
      {"term":"cem","translation":"one hundred","ipa":"sẽj","example":"Cem reais? Está caro!"},
      {"term":"Quanto custa?","translation":"How much is it?","ipa":"ˈkwɐ̃.tu ˈkus.tɐ","example":"Quanto custa o quilo do queijo?"},
      {"term":"o real / os reais","translation":"the real (Brazilian currency)","example":"São vinte e cinco reais no total."},
      {"term":"o troco","translation":"the change (money back)","ipa":"u ˈtɾo.ku","example":"Pode ficar com o troco."}
   ]}',
   'Brazilian prices use a comma for decimals: R$ 2,50 reads *dois reais e cinquenta centavos*.', 7),
  (3, 'Ser, estar and ter in the present', 'grammar',
   '{"sections":[
      {"heading":"Ser — what things are","text":"Use *ser* for identity, origin and profession — things that define you. Present forms: *eu sou*, *você/ele/ela é*, *nós somos*, *vocês/eles são*. Examples: *Eu sou brasileira.* *Ela é médica.* *Nós somos de Curitiba.*"},
      {"heading":"Estar — states and locations","text":"Use *estar* for temporary states and for where things are right now. Present forms: *eu estou*, *você está*, *nós estamos*, *vocês estão*. Examples: *Estou cansado hoje.* *O café está quente.* *Onde você está?* In speech Brazilians clip it to *tô*, *tá*, *tamos*."},
      {"heading":"Ter — to have (and ''there is'')","text":"Present forms: *eu tenho*, *você tem*, *nós temos*, *eles têm*. Examples: *Tenho dois irmãos.* *Você tem troco?* In spoken Brazilian Portuguese *tem* also means ''there is/are'': *Tem uma padaria na esquina.*"}
   ]}',
   'Rule of thumb: *ser* says what something is; *estar* says how it is right now.', 10),
  (4, 'At the padaria', 'vocab',
   '{"items":[
      {"term":"o pão francês","translation":"crusty bread roll","ipa":"u pɐ̃w fɾɐ̃ˈses","example":"Me vê seis pães franceses, por favor."},
      {"term":"o pão de queijo","translation":"cheese bread","ipa":"u pɐ̃w dʒi ˈkej.ʒu","example":"Um pão de queijo e um café, por favor."},
      {"term":"o pão na chapa","translation":"bread roll grilled with butter","example":"Um pão na chapa e um pingado, por favor."},
      {"term":"o café com leite","translation":"coffee with milk","example":"Um café com leite sem açúcar."},
      {"term":"o suco de laranja","translation":"orange juice","example":"Um suco de laranja natural, bem gelado."},
      {"term":"Me vê…","translation":"Can I get… (colloquial order)","example":"Me vê dois pãezinhos e uma água."}
   ]}',
   '*Me vê* + item is how Brazilians order at a counter — literally ''see me'', but it means ''get me''.', 8),
  (5, 'Breakfast at the padaria', 'roleplay',
   '{"scenario":"A busy padaria in São Paulo at 8am. Order a pão na chapa and a coffee at the counter, ask how much it all costs, and pay in cash.","persona":"Fast-talking counter attendant who calls everyone ''chefe''","goal":"Order breakfast, understand the total, and count your change"}',
   null, 10),
  (6, 'At the restaurante', 'vocab',
   '{"items":[
      {"term":"o cardápio","translation":"the menu","ipa":"u kaʁˈda.pju","example":"Pode trazer o cardápio, por favor?"},
      {"term":"o prato feito","translation":"set lunch plate (the classic PF)","example":"O prato feito vem com arroz, feijão e bife."},
      {"term":"a sobremesa","translation":"the dessert","ipa":"a so.bɾeˈme.zɐ","example":"De sobremesa, tem pudim?"},
      {"term":"sem cebola","translation":"without onion","example":"Pode fazer o prato sem cebola?"},
      {"term":"A conta, por favor","translation":"The bill, please","example":"Moço, a conta, por favor!"}
   ]}',
   'The 10% service charge (*a taxa de serviço*) usually comes included in the bill in Brazil — check before tipping extra.', 8),
  (7, 'Reading: a morning in São Paulo', 'reading',
   '{"sections":[
      {"heading":"Before you read","text":"Key verbs you will meet: *acordar* (to wake up), *tomar café da manhã* (to have breakfast), *trabalhar* (to work), *almoçar* (to have lunch). Read the text once for the big picture, then once more for details."},
      {"heading":"A rotina da Marina","text":"Marina acorda às seis horas da manhã. Ela toma banho e toma café da manhã: pão francês, queijo e um café com leite. Às sete e meia, ela pega o metrô para o trabalho. Marina trabalha em um escritório no centro de São Paulo. Ao meio-dia, ela almoça um prato feito com os colegas. À noite, ela janta em casa e dorme às onze horas."},
      {"heading":"Check your understanding","text":"What time does Marina wake up? What does she have for breakfast? How does she get to work? Answer in Portuguese if you can: *Ela acorda às seis horas…*"}
   ]}',
   null, 9),
  (8, 'Daily routine verbs', 'vocab',
   '{"items":[
      {"term":"acordar","translation":"to wake up","ipa":"a.koʁˈdaʁ","example":"Eu acordo às sete horas."},
      {"term":"tomar banho","translation":"to take a shower","example":"Tomo banho antes do trabalho."},
      {"term":"trabalhar","translation":"to work","ipa":"tɾa.baˈʎaʁ","example":"Trabalho de segunda a sexta."},
      {"term":"almoçar","translation":"to have lunch","example":"Almoço ao meio-dia com os colegas."},
      {"term":"dormir","translation":"to sleep","ipa":"doʁˈmiʁ","example":"Durmo cedo durante a semana."}
   ]}',
   'Regular *-ar* verbs in the present: *eu acordo*, *você acorda*, *nós acordamos*, *eles acordam*.', 7),
  (9, 'Shopping for clothes', 'roleplay',
   '{"scenario":"A clothing store in a Rio shopping mall. Find a t-shirt you like, ask about sizes and colors, try it on, and ask if there is a discount for paying in cash.","persona":"Chatty sales assistant who keeps suggesting extra items","goal":"Buy one t-shirt in your size and confirm the final price"}',
   null, 10),
  (10, 'Checkpoint: A1 essentials', 'quiz',
   '{"questions":[
      {"prompt":"How do you ask the price of something?","options":["Onde fica?","Quanto custa?","Tudo bem?","Que horas são?"],"answer":1,"explanation":"Quanto custa? = how much does it cost? Onde fica? asks for a location."},
      {"prompt":"Pick the correct form: Eu ___ de Salvador.","options":["está","sou","tenho","são"],"answer":1,"explanation":"Origin is identity, so it takes *ser*: eu sou de Salvador."},
      {"prompt":"\"A conta, por favor\" means…","options":["The menu, please","The bill, please","The change, please","The dessert, please"],"answer":1,"explanation":"a conta = the bill; o cardápio = the menu; o troco = the change."},
      {"prompt":"Which sentence uses estar correctly?","options":["O café está quente.","O café é quente agora.","Eu está cansado.","Nós está em casa."],"answer":0,"explanation":"A temporary state takes *estar*, and the form must agree: o café está quente."},
      {"prompt":"At the padaria, \"pão na chapa\" is…","options":["cheese bread","a roll grilled with butter","orange juice","a set lunch plate"],"answer":1,"explanation":"Pão na chapa is a roll split and toasted with butter on the griddle — a padaria classic."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0004-0000-4000-8000-000000000001' and l.position = v.pos
);

-- ============ Course 2: Portuguese A2 — Everyday life ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0004-0000-4000-8000-000000000002',
  'pt', 'br',
  'Portuguese A2 — Everyday life',
  'Tell people what happened, make and change plans, handle the pharmacy and the doctor, survive work small talk, give opinions, and ride the city like a local.',
  'A2', 'daily_life', 11, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0004-0000-4000-8000-000000000002', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Pretérito perfeito: what happened', 'grammar',
   '{"sections":[
      {"heading":"Completed actions","text":"The *pretérito perfeito* reports finished events: *Ontem eu falei com a Ana.* *Ele comeu feijoada no almoço.* Regular endings for *eu*: -ar → *falei*, -er → *comi*, -ir → *abri*. For *você/ele*: *falou*, *comeu*, *abriu*."},
      {"heading":"The workhorse irregulars","text":"A handful of irregulars carry most conversations: *ser/ir → fui, foi* (one form for both verbs!), *fazer → fiz, fez*, *ter → tive, teve*, *estar → estive, esteve*, *poder → pude, pôde*. *Fui ao mercado e fiz o jantar.*"},
      {"heading":"Time markers","text":"Anchor the tense with time expressions: *ontem* (yesterday), *anteontem* (the day before), *na semana passada* (last week), *no ano passado* (last year). *Na semana passada eu tive três reuniões.*"}
   ]}',
   'One-time, finished, over: that is the perfeito. *Fui*, *fiz*, *tive* cover half of daily conversation.', 10),
  (2, 'Making plans', 'vocab',
   '{"items":[
      {"term":"Vamos marcar?","translation":"Shall we set something up?","ipa":"ˈvɐ̃.mus maʁˈkaʁ","example":"Faz tempo que a gente não se vê. Vamos marcar?"},
      {"term":"Que tal…?","translation":"How about…?","example":"Que tal sexta à noite?"},
      {"term":"combinar","translation":"to arrange / agree on","example":"A gente combina o horário pelo WhatsApp."},
      {"term":"Tô dentro!","translation":"I''m in!","example":"Churrasco no domingo? Tô dentro!"},
      {"term":"desmarcar","translation":"to cancel (plans)","example":"Tive que desmarcar o jantar de ontem."}
   ]}',
   '*A gente* + third-person singular is spoken Brazilian for ''we'': *a gente combina*, *a gente vai*.', 7),
  (3, 'Weekend plans with a friend', 'roleplay',
   '{"scenario":"A voice call with a Brazilian friend to plan Saturday. Suggest an activity, react when your friend keeps changing the plan, and lock in what, where and what time.","persona":"Enthusiastic friend who proposes three different plans in five minutes","goal":"Settle on one activity with a fixed time and meeting point"}',
   null, 10),
  (4, 'Pharmacy & symptoms', 'vocab',
   '{"items":[
      {"term":"a dor de cabeça","translation":"headache","ipa":"a doʁ dʒi kaˈbe.sɐ","example":"Estou com dor de cabeça desde ontem."},
      {"term":"a febre","translation":"fever","ipa":"a ˈfɛ.bɾi","example":"Meu filho está com febre alta."},
      {"term":"a tosse","translation":"cough","example":"Estou com tosse e dor de garganta."},
      {"term":"o remédio","translation":"the medicine","example":"Esse remédio precisa de receita?"},
      {"term":"a receita","translation":"the prescription","example":"O médico me deu uma receita para uma semana."}
   ]}',
   'Symptoms use *estar com*: *estou com febre*, *estou com tosse* — not a direct translation of ''I have''.', 7),
  (5, 'At the pharmacy', 'roleplay',
   '{"scenario":"A drugstore in Belo Horizonte. Describe your cold symptoms to the pharmacist, ask what they recommend, confirm the dosage, and check whether you need a prescription.","persona":"Attentive pharmacist who asks follow-up questions about your symptoms","goal":"Leave with the right medicine and know how many times a day to take it"}',
   null, 10),
  (6, 'Perfeito vs imperfeito', 'grammar',
   '{"sections":[
      {"heading":"Two past tenses, two jobs","text":"The *perfeito* is the event; the *imperfeito* is the scenery. *Eu morava no Rio* (ongoing background) vs *eu morei no Rio por dois anos* (closed chapter). Habits and descriptions in the past go to the imperfeito: *Quando eu era criança, brincava na rua.*"},
      {"heading":"Forming the imperfeito","text":"-ar verbs take -ava: *falava, falávamos*. -er/-ir verbs take -ia: *comia, abria*. Only four irregulars: *ser → era*, *ter → tinha*, *vir → vinha*, *pôr → punha*. In speech, *tinha* also replaces ''there was'': *Tinha muita gente na festa.*"},
      {"heading":"Putting them together","text":"Classic combo — imperfeito sets the scene, perfeito interrupts it: *Eu estava no ponto de ônibus quando começou a chover.* *Ela tomava café quando o telefone tocou.*"}
   ]}',
   'Ask yourself: is this the event (perfeito) or the background (imperfeito)?', 10),
  (7, 'Small talk at work', 'vocab',
   '{"items":[
      {"term":"E aí, como foi o fim de semana?","translation":"So, how was your weekend?","example":"E aí, como foi o fim de semana? Foi tranquilo?"},
      {"term":"a reunião","translation":"the meeting","ipa":"a ʁe.u.niˈɐ̃w","example":"A reunião foi adiada para amanhã."},
      {"term":"corrido","translation":"hectic, rushed","example":"A semana está corrida demais."},
      {"term":"o cafezinho","translation":"a quick coffee (office ritual)","example":"Vamos tomar um cafezinho antes da reunião?"},
      {"term":"Combinado!","translation":"Deal! / Agreed!","example":"Nos falamos amanhã às dez, combinado?"}
   ]}',
   'The diminutive *-inho* softens almost anything in Brazil — *um cafezinho* is an invitation, not a size.', 7),
  (8, 'Getting around the city', 'vocab',
   '{"items":[
      {"term":"o ponto de ônibus","translation":"the bus stop","ipa":"u ˈpõ.tu dʒi ˈo.ni.bus","example":"Te espero no ponto de ônibus da esquina."},
      {"term":"o metrô","translation":"the subway","ipa":"u meˈtɾo","example":"O metrô está lotado hoje."},
      {"term":"descer","translation":"to get off","example":"Você desce na próxima estação."},
      {"term":"a baldeação","translation":"the transfer (between lines)","example":"Faça baldeação na estação Sé."},
      {"term":"o cartão de transporte","translation":"the transit card","example":"Preciso recarregar meu cartão de transporte."}
   ]}',
   'To ask the driver to stop, Brazilians say *vou descer!* or ring the bell — *descer* covers getting off anything.', 7),
  (9, 'Your opinion: big city or small town?', 'writing',
   '{"sections":[
      {"heading":"Phrases to build with","text":"Opinion starters: *na minha opinião* (in my opinion), *eu acho que* (I think that), *para mim* (for me). Contrast: *por outro lado* (on the other hand), *mesmo assim* (even so). Agreement: *concordo* / *discordo*."},
      {"heading":"Your task","text":"Write 6–8 sentences comparing life in a big city and in a small town. Use at least two opinion phrases, one contrast phrase, and one sentence in the past about your own experience (*Eu morei…*, *Quando eu era…*)."},
      {"heading":"Model opening","text":"*Na minha opinião, morar numa cidade grande é mais prático: tem metrô, cinema e trabalho. Por outro lado, a vida é corrida e tudo é caro. Quando eu era criança, morava numa cidade pequena e…* — now finish the story with your own ideas."}
   ]}',
   null, 10),
  (10, 'Checkpoint: A2 essentials', 'quiz',
   '{"questions":[
      {"prompt":"\"Yesterday I went to the beach\" is…","options":["Eu ia à praia ontem.","Eu fui à praia ontem.","Eu vou à praia ontem.","Eu era na praia ontem."],"answer":1,"explanation":"A one-time completed event takes the perfeito: fui. Ia would be a past habit."},
      {"prompt":"Pick the background tense: Quando eu ___ criança, morava no Rio.","options":["fui","era","sou","estive"],"answer":1,"explanation":"Description/background in the past uses the imperfeito of ser: era."},
      {"prompt":"\"Estou com dor de cabeça\" means…","options":["I have a fever","I have a headache","I have a cough","I am dizzy"],"answer":1,"explanation":"dor de cabeça = headache; symptoms use estar com."},
      {"prompt":"The natural way to suggest a plan:","options":["Que tal sexta à noite?","Onde fica sexta?","Quanto custa sexta?","Desço na sexta."],"answer":0,"explanation":"Que tal…? = how about…? The others ask location, price, or announce a bus stop."},
      {"prompt":"On the metrô, \"baldeação\" means…","options":["the ticket","a delay","a transfer between lines","the last station"],"answer":2,"explanation":"Baldeação is changing lines — you will hear it in every announcement at hub stations."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0004-0000-4000-8000-000000000002' and l.position = v.pos
);

-- ============ Course 3: Portuguese B1 — Confident conversations ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0004-0000-4000-8000-000000000003',
  'pt', 'br',
  'Portuguese B1 — Confident conversations',
  'Tell stories that land, use the subjuntivo, hold your own in a debate, ace a job interview, get a refund, and read Brazilian news headlines.',
  'B1', 'work', 12, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0004-0000-4000-8000-000000000003', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Storytelling connectors', 'vocab',
   '{"items":[
      {"term":"aí","translation":"then / so (narrative glue)","ipa":"aˈi","example":"Aí ele chegou e perguntou por você."},
      {"term":"de repente","translation":"suddenly","ipa":"dʒi ʁeˈpẽ.tʃi","example":"De repente, começou a chover."},
      {"term":"enquanto isso","translation":"meanwhile","example":"Enquanto isso, o chefe esperava na sala."},
      {"term":"acabar fazendo","translation":"to end up doing","example":"No fim, acabei aceitando a proposta."},
      {"term":"no final das contas","translation":"in the end / at the end of the day","example":"No final das contas, deu tudo certo."}
   ]}',
   '*Aí* is the duct tape of spoken Brazilian storytelling — it strings events together the way English uses ''so then''.', 8),
  (2, 'Subjuntivo presente: quero que…', 'grammar',
   '{"sections":[
      {"heading":"When it kicks in","text":"The present subjunctive appears after triggers of desire, doubt and emotion: *quero que…* (I want that…), *espero que…* (I hope that…), *é importante que…*, *talvez* (maybe). *Quero que você venha à reunião.* *Talvez ele chegue atrasado.*"},
      {"heading":"How to form it","text":"Start from the *eu* form of the present, drop the -o, and flip the vowel: *falo → fale*, *como → coma*, *peço → peça*, *faço → faça*. Key irregulars: *ser → seja*, *estar → esteja*, *ter → tenha*, *ir → vá*, *saber → saiba*."},
      {"heading":"In real sentences","text":"*Espero que dê tudo certo na entrevista.* *É importante que a equipe esteja alinhada.* *Não acho que isso seja um problema.* Notice the pattern: main clause + *que* + subjunctive."}
   ]}',
   'Trigger + *que* + subjuntivo. If you can say *quero que*, *espero que* or *talvez*, the next verb changes shape.', 10),
  (3, 'Job interview vocabulary', 'vocab',
   '{"items":[
      {"term":"a entrevista de emprego","translation":"the job interview","ipa":"a ẽ.tɾeˈvis.tɐ dʒi ẽˈpɾe.ɡu","example":"Tenho uma entrevista de emprego na quinta."},
      {"term":"a vaga","translation":"the opening / position","example":"A vaga é para analista de marketing."},
      {"term":"o currículo","translation":"the résumé / CV","ipa":"u kuˈʁi.ku.lu","example":"Enviei meu currículo ontem à noite."},
      {"term":"os pontos fortes","translation":"strengths","example":"Quais são os seus pontos fortes?"},
      {"term":"a pretensão salarial","translation":"salary expectation","example":"Qual é a sua pretensão salarial?"},
      {"term":"trabalhar sob pressão","translation":"to work under pressure","example":"Trabalho bem sob pressão e com prazos curtos."}
   ]}',
   'Expect *Qual é a sua pretensão salarial?* in every Brazilian interview — have a range ready, in reais.', 8),
  (4, 'The job interview', 'roleplay',
   '{"scenario":"A video interview for a mid-level role at a tech company in São Paulo. Present your experience, answer questions about strengths, weaknesses and salary expectations, and ask two smart questions about the team.","persona":"Professional but warm HR interviewer who probes vague answers","goal":"Answer three interview questions convincingly and confirm the next steps"}',
   null, 12),
  (5, 'Complaints & returns', 'vocab',
   '{"items":[
      {"term":"trocar","translation":"to exchange (a product)","ipa":"tɾoˈkaʁ","example":"Queria trocar esse fone, ele veio com defeito."},
      {"term":"o defeito","translation":"the defect / fault","example":"A tela chegou com defeito de fábrica."},
      {"term":"o reembolso","translation":"the refund","example":"Prefiro o reembolso em vez da troca."},
      {"term":"a nota fiscal","translation":"the receipt / invoice","example":"O senhor está com a nota fiscal?"},
      {"term":"o Procon","translation":"Brazilian consumer protection agency","example":"Se não resolverem, vou reclamar no Procon."}
   ]}',
   'Returns in Brazil hinge on the *nota fiscal* — no receipt, no exchange. Invoking *o Procon* is the classic escalation.', 8),
  (6, 'Returning a faulty product', 'roleplay',
   '{"scenario":"The customer service desk of an electronics store. The headphones you bought last week stopped working. Explain the problem, present the nota fiscal, push back politely when the clerk offers only store credit, and escalate if needed.","persona":"Polite but rule-bound customer service clerk who starts by offering store credit","goal":"Get a full refund or a brand-new unit"}',
   null, 12),
  (7, 'Agreeing, disagreeing, debating', 'grammar',
   '{"sections":[
      {"heading":"Taking a position","text":"Stake your claim clearly: *na minha opinião…*, *do meu ponto de vista…*, *eu defendo que…*, *o que está em jogo é…* (what is at stake is…). *Na minha opinião, o trabalho remoto aumenta a produtividade.*"},
      {"heading":"Pushing back politely","text":"Brazilian debate stays warm: *concordo em parte, mas…* (I partly agree, but…), *entendo seu ponto, porém…*, *não é bem assim* (it is not quite like that), *pelo contrário* (on the contrary). Blunt disagreement without a softener sounds harsh."},
      {"heading":"Hedging with the subjuntivo","text":"Concessions and doubts pull in the subjunctive: *embora o plano seja bom, o prazo é curto* (although the plan is good…), *talvez você tenha razão* (maybe you are right), *mesmo que custe mais…* (even if it costs more…)."}
   ]}',
   'Soften first, then disagree: *entendo seu ponto, porém…* wins more arguments in Brazil than a direct *você está errado*.', 10),
  (8, 'Debate: remote work vs the office', 'roleplay',
   '{"scenario":"A team meeting where your company is deciding its return-to-office policy. Argue your side with concrete arguments, respond to counterarguments, concede one good point, and propose a compromise.","persona":"Colleague who strongly disagrees with you but argues in good faith","goal":"Defend your position with three arguments and land on a compromise both of you accept"}',
   null, 12),
  (9, 'Reading the news', 'reading',
   '{"sections":[
      {"heading":"Headline grammar","text":"Brazilian headlines drop articles and compress everything: *Prefeitura anuncia novas ciclovias* (City hall announces new bike lanes), *Desemprego cai pelo terceiro mês seguido* (Unemployment falls for the third straight month). Learn the verbs headlines love: *anunciar*, *cair*, *subir*, *aprovar*, *prever*."},
      {"heading":"Cidade aposta em ciclovias","text":"A prefeitura anunciou nesta semana um plano para construir 40 quilômetros de novas ciclovias até o fim do ano. Segundo a secretaria de transportes, o número de ciclistas cresceu 25% nos últimos dois anos. Comerciantes da região central, porém, temem perder vagas de estacionamento. *A gente apoia a ideia, mas quer participar do planejamento*, disse a presidente da associação comercial."},
      {"heading":"Check your understanding","text":"What did city hall announce, and by when? What grew 25%? Who is worried, and about what? Notice *porém* and *segundo* — two connectors that carry most Brazilian news writing."}
   ]}',
   null, 9),
  (10, 'Checkpoint: B1 essentials', 'quiz',
   '{"questions":[
      {"prompt":"Quero que você ___ à reunião amanhã.","options":["vem","venha","vir","veio"],"answer":1,"explanation":"Quero que triggers the present subjunctive: venha."},
      {"prompt":"\"Acabei aceitando a proposta\" means…","options":["I refused the offer","I just accepted the offer","I ended up accepting the offer","I finished writing the proposal"],"answer":2,"explanation":"acabar + gerund = to end up doing something."},
      {"prompt":"The most Brazilian way to disagree politely:","options":["Você está completamente errado.","Entendo seu ponto, porém discordo.","Não quero falar disso.","Isso é mentira."],"answer":1,"explanation":"Soften first, then disagree — entendo seu ponto, porém… keeps the debate warm."},
      {"prompt":"To exchange a faulty product, the store will ask for…","options":["o cardápio","a nota fiscal","a receita","o troco"],"answer":1,"explanation":"No nota fiscal (receipt/invoice), no exchange — it is the key document in any return."},
      {"prompt":"\"Desemprego cai pelo terceiro mês seguido\" means…","options":["Unemployment rises for the third month","Unemployment falls for the third straight month","Employment falls every third month","March had no unemployment"],"answer":1,"explanation":"cair = to fall; pelo terceiro mês seguido = for the third month in a row."},
      {"prompt":"Embora o plano ___ bom, o prazo é curto.","options":["é","seja","era","foi"],"answer":1,"explanation":"Embora (although) always takes the subjunctive: seja."}
   ]}',
   null, 6)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0004-0000-4000-8000-000000000003' and l.position = v.pos
);
