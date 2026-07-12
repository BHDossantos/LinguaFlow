-- French advanced curriculum pack: "French — Seminar & Exam Mastery" (dialect 'fr').
-- One C1 course, 10 lessons, built on seminar-style teaching methods: the case
-- method (an original business case with an open decision), tutorial essays with
-- thèse–antithèse–synthèse structure, adversarial debate practice, a capstone
-- presentation project, and a DALF C1-style checkpoint. All content is original.
-- Fixed UUID keeps re-runs idempotent: the course uses `on conflict (id) do
-- nothing`, lessons are guarded by a `where not exists` check on (course_id, position).

-- ============ French C1 — Seminar & Exam Mastery ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0002-0000-4000-8000-000000000004',
  'fr', 'fr',
  'French — Seminar & Exam Mastery',
  'Advanced French the way elite seminars teach it: dissect an original business case (case method), write and defend tutorial essays, spar in debate seminars, and build a capstone presentation — all aligned with DALF C1 preparation.',
  'C1', 'work', 13, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0002-0000-4000-8000-000000000004', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Case study: Boréal Numérique goes to Paris', 'reading',
   '{"sections":[
      {"heading":"Première partie — les faits","text":"Boréal Numérique, éditeur montréalais de logiciels de gestion des ressources humaines, emploie 280 personnes et réalise un chiffre d''affaires de 45 millions de dollars canadiens, dont 30 % en Europe francophone. Après deux années de croissance soutenue sur le marché belge, la direction envisage d''ouvrir un bureau à Paris au premier trimestre. Le loyer d''un plateau dans le 9e arrondissement est estimé à 480 000 euros par an ; le plan de recrutement porte sur douze personnes, dont un directeur de filiale. Method note (English): the case method starts from verifiable facts. Read them twice and note every figure before you allow yourself an opinion."},
      {"heading":"Deuxième partie — la tension","text":"La directrice financière s''oppose au projet : elle rappelle que la trésorerie ne couvre que dix-huit mois d''exploitation et que le droit du travail français, qu''elle juge autrement plus contraignant que celui du Québec, ferait peser un risque durable sur les coûts. Elle préconise plutôt un partenariat avec un distributeur local. Le directeur commercial soutient au contraire que, sans présence physique, aucun grand compte français ne signera, et que chaque trimestre de retard profite à un concurrent lyonnais qui vient de lever vingt millions d''euros. La directrice des ressources humaines, elle, s''inquiète d''un choc de cultures d''entreprise entre Montréal et Paris. Method note (English): a good case has no obviously right answer — the tension is the point."},
      {"heading":"Troisième partie — la décision ouverte","text":"Le conseil d''administration se réunit vendredi et devra trancher : ouvrir le bureau parisien, conclure le partenariat, ou différer la décision d''un an. Questions de discussion : 1. Quels chiffres du dossier pèsent le plus lourd, et pourquoi ? 2. Que perdrait Boréal Numérique en choisissant le partenariat ? 3. Différer, est-ce décider ? Défendez votre position. Method note (English): come to the next lesson with ONE recommendation and the two figures that best support it — you will be asked to defend it aloud."}
   ]}',
   null, 12),
  (2, 'Seminar: defend your recommendation', 'roleplay',
   '{"scenario":"A graduate seminar room, case file open on the table. You have read the Boréal Numérique case and must defend one recommendation — open the Paris office, sign the partnership, or delay a year — in front of the class, entirely in French.","persona":"An exacting seminar professor who cold-calls without warning, interrupts vague claims with « Sur quels chiffres vous appuyez-vous ? », and visibly rewards precise connectors like néanmoins and en revanche","goal":"State your recommendation in your very first sentence, defend it against three follow-up questions using at least two figures from the case, and concede exactly one valid counter-argument with a concessive construction (certes… mais)"}',
   null, 12),
  (3, 'The academic toolkit: argumentation French', 'vocab',
   '{"items":[
      {"term":"néanmoins","translation":"nevertheless, nonetheless","ipa":"ne.ɑ̃.mwɛ̃","example":"Le projet est coûteux ; néanmoins, il demeure rentable à long terme."},
      {"term":"il convient de","translation":"it is advisable / appropriate to","ipa":"il kɔ̃.vjɛ̃ də","example":"Il convient de rappeler que ces données datent de 2023."},
      {"term":"en somme","translation":"in short, all things considered","ipa":"ɑ̃ sɔm","example":"En somme, les deux stratégies ne s''excluent pas."},
      {"term":"soutenir que","translation":"to argue / maintain that","ipa":"su.tə.niʁ kə","example":"L''auteure soutient que la fiscalité locale freine l''innovation."},
      {"term":"remettre en question","translation":"to call into question","ipa":"ʁə.mɛtʁ ɑ̃ kɛs.tjɔ̃","example":"Ces résultats remettent en question le consensus établi."},
      {"term":"en revanche","translation":"on the other hand, by contrast","ipa":"ɑ̃ ʁə.vɑ̃ʃ","example":"Le marché belge est mûr ; en revanche, le marché français reste à conquérir."}
   ]}',
   'These belong to formal written register — the voice DALF C1 examiners reward. *Néanmoins* and *en revanche* typically open a clause after a semicolon; *il convient de* + infinitive gives you an impersonal, authoritative stance; *soutenir que* introduces a claim you attribute to someone (and may then dismantle).', 8),
  (4, 'Connectors, subjunctive moves, and the passé simple', 'grammar',
   '{"sections":[
      {"heading":"Connectors that structure an argument","text":"C1 writing is judged on architecture, not just accuracy. Concede then counter with *certes… mais* : « Certes, le loyer est élevé, mais le marché le justifie. » Add a point with *en outre* or *par ailleurs*, draw a consequence with *par conséquent* or *dès lors*, and reframe with *si… c''est que* : « Si le projet inquiète, c''est que ses coûts sont mal connus. » Vary them — repeating *mais* three times in one paragraph reads as B1."},
      {"heading":"Subjunctive after concession and purpose","text":"Concessive conjunctions take the subjunctive even when the fact is real : « Bien que les coûts soient élevés, le conseil a dit oui. » Same with *quoique*. Purpose clauses too : « Nous détaillons les chiffres pour que chacun puisse trancher », also *afin que*. Condition-setters *à condition que* and *pourvu que* follow suit : « J''appuierai le projet à condition que le budget soit revu. » After *à moins que*, polished writing adds the expletive *ne* : « à moins que les loyers ne baissent » — that *ne* is not a negation."},
      {"heading":"The passé simple in written registers","text":"You will meet the passé simple in the press, in history, and in fiction — recognize it instantly, even if you rarely produce it. Key irregulars : *fut* (être), *eut* (avoir), *fit* (faire), *prit* (prendre), *parut* (paraître), *vint* (venir). « Elle fut nommée directrice en 1998 et fit de la filiale un modèle. » In speech and email you would say *a été nommée* and *a fait* ; in a formal written narrative, the passé simple signals distance and authority."}
   ]}',
   null, 12),
  (5, 'Tutorial essay: thèse, antithèse, synthèse', 'writing',
   '{"sections":[
      {"heading":"The task","text":"Write a 250-word argumentative essay: « Le télétravail doit-il devenir la norme dans les entreprises de services ? » Tutorial method: your essay is not an endpoint but the script you will defend aloud — every sentence should survive the question « Qu''est-ce qui vous permet d''affirmer cela ? »"},
      {"heading":"Thèse — antithèse — synthèse","text":"The classic French plan in three movements. Thèse: the strongest case for one side — « On ne saurait nier que le télétravail accroît l''autonomie des salariés… » Antithèse: the strongest case against, not a strawman — « Toutefois, il serait réducteur d''ignorer l''érosion du collectif de travail… » Synthèse: not a timid middle, but a higher-order resolution — « En définitive, la question n''est pas de généraliser le télétravail mais de repenser ce que le bureau doit désormais offrir. » Introduce your plan explicitly in the introduction (« Nous verrons d''abord…, avant d''examiner…, pour enfin proposer… »)."},
      {"heading":"Self-check rubric","text":"Before submitting, verify: (1) the introduction ends with an announced plan; (2) each paragraph carries exactly one idea, opened by a connector from lesson 3; (3) at least one *bien que* or *à condition que* clause with a correct subjunctive; (4) the synthèse adds an idea absent from both previous parts; (5) word count between 240 and 260; (6) read it aloud once — anything you stumble on, the examiner will too."}
   ]}',
   null, 15),
  (6, 'Debate seminar: screens at school', 'roleplay',
   '{"scenario":"A formal oral debate in a seminar: « Faut-il limiter les écrans à l''école ? » You have drawn the FOR side. You get a two-minute opening statement, then must hold your position under fire before delivering a closing synthesis.","persona":"A sharp debate opponent who concedes nothing easily and pushes back exactly twice — first with a concrete counter-example about digital learning tools, then with a statistic on educational inequality — before allowing you to conclude","goal":"Deliver a structured opening (thèse, deux arguments, un exemple), answer both rebuttals with concessive constructions (certes… mais, bien que + subjunctive) instead of simple denial, and close with a one-sentence synthèse that reframes the question"}',
   null, 12),
  (7, 'Exam reading: an op-ed on urban policy', 'reading',
   '{"sections":[
      {"heading":"Tribune (début) — la ville du quart d''heure","text":"« On nous promet des métropoles apaisées où l''école, le médecin et le commerce se trouveraient à quinze minutes de chez soi. Séduisant sur le papier, le concept de la ville du quart d''heure s''est imposé dans les discours municipaux avec une rapidité qui devrait, à elle seule, nous inviter à la prudence. » Inference question (English): the author never writes « je suis sceptique » — which two signals convey it anyway? Look at the conditional *se trouveraient* (promised, not real) and the closing phrase *nous inviter à la prudence*. DALF C1 rewards reading stance from grammar, not just vocabulary."},
      {"heading":"Tribune (suite) — le développement","text":"« Certes, réduire les déplacements contraints est un objectif que nul ne conteste. Néanmoins, à moins que les loyers des quartiers centraux ne cessent de flamber, la proximité restera un privilège : ceux qui font vivre la ville — soignants, livreurs, enseignants — continueront d''habiter là où le quart d''heure en vaut quarante. » Inference questions (English): (1) Which social group does the author imply is excluded from the promise, without naming any exclusion outright? (2) The *ne* in « ne cessent » is the expletive *ne* from lesson 4 — does it make the sentence negative? (No — trap answer on the exam.)"},
      {"heading":"Tribune (fin) — la chute","text":"« Faut-il pour autant enterrer l''idée ? Ce serait jeter le bébé avec l''eau du bain. La ville du quart d''heure est une boussole, non un mirage — à condition qu''elle oriente d''abord l''investissement public vers les périphéries, là où l''on n''a jamais rien promis à personne. » Inference questions (English): (1) What is the author''s final stance — rejection, full endorsement, or conditional endorsement? (2) Which single conjunction carries that condition, and what mood follows it? (3) In one French sentence, state the thèse of the whole op-ed as you would in the DALF synthèse exercise."}
   ]}',
   null, 12),
  (8, 'Register: the elevated near-synonym', 'vocab',
   '{"items":[
      {"term":"solliciter","translation":"to request (formal) — neutral equivalent: demander","ipa":"sɔ.li.si.te","example":"Je me permets de solliciter un entretien auprès de votre service."},
      {"term":"œuvrer","translation":"to work, to strive (elevated) — neutral equivalent: travailler","ipa":"œ.vʁe","example":"L''association œuvre depuis dix ans pour l''insertion des jeunes."},
      {"term":"préconiser","translation":"to recommend, to advocate (formal) — neutral equivalent: conseiller","ipa":"pʁe.kɔ.ni.ze","example":"Le rapport préconise un moratoire sur les loyers commerciaux."},
      {"term":"s''avérer","translation":"to prove to be, to turn out to be (formal) — neutral equivalent: se révéler","ipa":"sa.ve.ʁe","example":"La mesure s''est avérée insuffisante dès le premier hiver."},
      {"term":"escompter","translation":"to expect, to count on (formal) — neutral equivalent: espérer","ipa":"ɛs.kɔ̃.te","example":"Les résultats escomptés ne sont pas au rendez-vous."},
      {"term":"requérir","translation":"to require, to call for (formal) — neutral equivalent: exiger","ipa":"ʁə.ke.ʁiʁ","example":"Ce dossier requiert l''avis préalable du comité d''éthique."}
   ]}',
   'Register-shifting is a C1 marker: examiners notice when a candidate writes *le rapport préconise* instead of *le rapport dit de faire*. Rule of thumb — speak with the neutral verb, write the elevated one in essays and formal letters. Beware *s''avérer* : *s''avérer vrai* is accepted, but purists reject *s''avérer faux* as a contradiction (avérer comes from *vrai*).', 8),
  (9, 'Capstone brief: the five-minute exposé', 'writing',
   '{"sections":[
      {"heading":"The brief","text":"Project-based method: over three weeks, design and rehearse a five-minute presentation in French — « Boréal Numérique doit-elle ouvrir son bureau parisien ? » (or an equivalent open decision from your own field). Deliverables: a one-page outline in French (annonce du plan, arguments, synthèse) and speaker notes. This mirrors the DALF C1 production orale: an exposé built from documents, followed by an entretien where the jury attacks your weakest point."},
      {"heading":"Milestones","text":"Semaine 1 — research and thesis: reread the case, pick your recommendation, write your thèse in one sentence and choose the three figures that carry it. Semaine 2 — architecture and draft: build the thèse–antithèse–synthèse skeleton, then flesh it out using at least five connectors from lesson 3 and one purpose clause with *pour que* + subjunctive. Semaine 3 — rehearse and record: deliver it aloud three times, record the final run, then listen once as your own examiner with the rubric below."},
      {"heading":"Evaluation criteria","text":"Score yourself 0–2 on each: (1) Structure — the plan is announced, every transition is signposted; (2) Argumentation — at least one concession honestly stated and then answered, not ignored; (3) Language — correct subjunctive after *bien que* / *pour que*, formal register verbs from lesson 8; (4) Delivery — under five minutes, no sentence read word-for-word; (5) Resilience — you can answer « Et si vous aviez tort ? » without abandoning your thèse. 8/10 or above: you are ready for the checkpoint quiz."}
   ]}',
   null, 15),
  (10, 'C1 checkpoint', 'quiz',
   '{"questions":[
      {"prompt":"Choose the connector: « Le projet est ambitieux ; ____, son financement demeure incertain. »","options":["en effet","néanmoins","ainsi","voire"],"answer":1,"explanation":"The second clause opposes the first, so you need a concessive connector: *néanmoins* (nevertheless). *En effet* confirms, *ainsi* concludes, *voire* escalates."},
      {"prompt":"Complete: « ____ les coûts soient élevés, la direction a validé le projet. »","options":["Parce que","Tandis que","Bien que","Dès que"],"answer":2,"explanation":"Only *bien que* both fits the concessive meaning and licenses the subjunctive *soient*. *Parce que*, *tandis que* and *dès que* all take the indicative."},
      {"prompt":"Which verb is the most formal way to say « to recommend » in a written report?","options":["dire de","proposer","conseiller","préconiser"],"answer":3,"explanation":"*Préconiser* is the elevated, report-register verb (lesson 8). *Conseiller* is neutral, *proposer* is weaker (to suggest), *dire de* is colloquial."},
      {"prompt":"Complete: « Nous reporterons la réunion à condition que chacun en ____ informé. »","options":["soit","est","sera","serait"],"answer":0,"explanation":"*À condition que* triggers the subjunctive, so *soit*. The indicative *est*, future *sera* and conditional *serait* are all ungrammatical here."},
      {"prompt":"Inference: from « Séduisant sur le papier, le concept s''est imposé avec une rapidité qui devrait nous inviter à la prudence », the author''s attitude is…","options":["openly hostile","enthusiastic","cautiously skeptical","indifferent"],"answer":2,"explanation":"*Séduisant sur le papier* concedes appeal while hinting it may not hold in reality, and *inviter à la prudence* counsels caution — skepticism without hostility. Classic C1 inference from stance markers, not explicit statements."},
      {"prompt":"In « Elle fut nommée directrice en 1998 », the form *fut* is the passé simple of which verb?","options":["faire","avoir","falloir","être"],"answer":3,"explanation":"*Fut* is the passé simple of *être* (here in a passive: *fut nommée* = was appointed). *Faire* gives *fit*, *avoir* gives *eut*, *falloir* gives *il fallut*."}
   ]}',
   null, 10)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0002-0000-4000-8000-000000000004' and l.position = v.pos
);
