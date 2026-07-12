-- Brazilian Portuguese advanced pack (dialect 'br'): one C1 course built on
-- elite-university teaching methods — a business case discussed seminar-style,
-- tutorial essays with a self-check rubric, adversarial debate, a capstone
-- presentation brief and CELPE-Bras-style reading and checkpoint work.
-- All content is original. Fixed UUIDs make re-runs idempotent.

-- ============ Course: Portuguese — Seminar & Exam Mastery ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0004-0000-4000-8000-000000000004',
  'pt', 'br',
  'Portuguese — Seminar & Exam Mastery',
  'Operate at C1 in academic and professional settings: argue a business case with the case method, write tutorial-style essays, hold your ground in debate seminars, deliver a capstone presentation, and train for the CELPE-Bras exam with inference-driven reading and register work.',
  'C1', 'work', 13, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0004-0000-4000-8000-000000000004', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'Case study: a fintech eyes Lisbon', 'reading',
   '{"sections":[
      {"heading":"Os fatos","text":"A PagVerde é uma fintech paulistana fundada em 2019, especializada em pagamentos instantâneos para pequenos comerciantes. Com 1,2 milhão de clientes ativos e faturamento anual de R$ 180 milhões, a empresa acaba de captar R$ 95 milhões em uma nova rodada de investimento. O conselho deu à diretoria doze meses para apresentar um plano de expansão internacional, e Lisboa surgiu como candidata natural: idioma comum, porta de entrada para a União Europeia e um ecossistema de startups em plena efervescência."},
      {"heading":"A tensão","text":"Nem todos na diretoria estão convencidos. A diretora financeira argumenta que o custo de conformidade regulatória na Europa consumiria um terço do novo capital antes da primeira transação. O diretor de produto rebate que o mercado brasileiro dá sinais de saturação e que os concorrentes já ensaiam o mesmo movimento — quem chegar depois pagará mais caro. Há ainda um obstáculo técnico: o produto foi desenhado em torno do Pix, e Portugal opera com outra infraestrutura de pagamentos, o que exigiria reconstruir parte do sistema do zero."},
      {"heading":"A decisão em aberto","text":"Na próxima reunião do conselho, a diretoria precisa recomendar um caminho: expandir para Lisboa agora, adiar a expansão por dezoito meses ou concentrar o capital no crescimento em outras regiões do Brasil. Não há resposta única — cada opção envolve riscos e renúncias. Perguntas para discussão: (1) Quais fatos do caso pesam mais na sua avaliação? (2) Que informação adicional você solicitaria antes de decidir? (3) Se você fosse a diretora financeira, como defenderia sua posição diante do conselho? Prepare uma recomendação de dois minutos, sustentada por pelo menos dois dados do texto."}
   ]}',
   null, 12),
  (2, 'Seminar: defend your recommendation', 'roleplay',
   '{"scenario":"A graduate seminar room. The class has read the PagVerde case, and the professor cold-calls you to open the discussion. State your recommendation — expand to Lisbon now, wait eighteen months, or grow within Brazil — and defend it in Portuguese using facts from the case.","persona":"An exacting seminar professor who never accepts an unsupported claim: she asks ''Com base em quê?'' after every assertion, cites numbers from the case back at you, and switches sides the moment you get comfortable.","goal":"Deliver a clear recommendation, back every claim with a fact from the case, and revise your position out loud if the professor exposes a weakness — without abandoning academic register."}',
   null, 12),
  (3, 'Academic argumentation toolkit', 'vocab',
   '{"items":[
      {"term":"no entanto","translation":"however, nevertheless","ipa":"nu ẽˈtɐ̃.tu","example":"A proposta é sólida; no entanto, o cronograma parece otimista demais."},
      {"term":"cabe ressaltar","translation":"it is worth highlighting","ipa":"ˈka.bi ʁe.sawˈtaʁ","example":"Cabe ressaltar que os dados se referem apenas ao primeiro trimestre."},
      {"term":"em síntese","translation":"in summary, in short","ipa":"ẽj ˈsĩ.te.zi","example":"Em síntese, os riscos superam os benefícios no curto prazo."},
      {"term":"sustentar que","translation":"to argue / maintain that","ipa":"sus.tẽˈtaʁ ki","example":"A autora sustenta que a regulação chegou tarde demais ao setor."},
      {"term":"questionar","translation":"to question, to challenge","ipa":"kes.tʃjoˈnaʁ","example":"Permita-me questionar a premissa central desse argumento."},
      {"term":"por conseguinte","translation":"consequently, therefore","ipa":"puʁ kõ.seˈgĩ.tʃi","example":"O capital é limitado; por conseguinte, é preciso priorizar uma frente."}
   ]}',
   'These connectors mark formal written and seminar register. In casual speech Brazilians prefer *mas*, *então* and *resumindo* — swapping in *no entanto*, *por conseguinte* and *em síntese* is one of the fastest ways to sound C1 on paper and in presentations.', 9),
  (4, 'Subjunctive for arguing: concession, purpose, future', 'grammar',
   '{"sections":[
      {"heading":"Concession with embora + present subjunctive","text":"*Embora* (although) always takes the subjunctive: *Embora o mercado seja promissor, os custos regulatórios preocupam.* *Embora a empresa tenha capital, falta experiência internacional.* Same pattern with *ainda que* and *mesmo que*: *Mesmo que o conselho aprove o plano, a execução levará um ano.* Concession lets you acknowledge the other side before striking — the core move of academic argument."},
      {"heading":"Purpose and condition: para que, contanto que","text":"*Para que* (so that) and *contanto que* (provided that) also demand the subjunctive: *Enviamos o relatório com antecedência para que todos possam preparar perguntas.* *Apoio a expansão, contanto que a diretoria estabeleça metas trimestrais.* Related conjunctions that behave the same way: *a fim de que*, *desde que*, *a menos que* (*A menos que os dados melhorem, adiaremos a decisão.*)."},
      {"heading":"Futuro do subjuntivo — the exam favorite","text":"After *se*, *quando*, *assim que* and *enquanto* referring to the future, Portuguese uses the future subjunctive: *Se a empresa expandir agora, assumirá um risco calculado.* *Quando os resultados chegarem, enviaremos o parecer.* *Assim que o contrato for assinado, começa a contagem.* Regular forms come from the third-person plural preterite minus *-am* (*falarem → falar*); memorize the irregulars: *for* (ser/ir), *tiver* (ter), *fizer* (fazer), *puder* (poder), *quiser* (querer), *vier* (vir)."}
   ]}',
   null, 13),
  (5, 'Tutorial essay: remote work in 250 words', 'writing',
   '{"sections":[
      {"heading":"The task","text":"Write a 250-word argumentative essay in Portuguese answering: *O trabalho remoto deveria ser um direito garantido por lei?* Imagine it will be read aloud and dissected in a one-on-one tutorial — every sentence must earn its place. Take a clear position in the first paragraph; do not sit on the fence."},
      {"heading":"Structure: tese, antítese, síntese","text":"Paragraph 1 — *tese*: state your position and preview two reasons (*Sustento que…, por duas razões*). Paragraph 2 — *antítese*: present the strongest objection honestly, then answer it (*Poder-se-ia argumentar que…; no entanto,…*). Paragraph 3 — *síntese*: do not merely repeat the thesis — show what survives the clash (*Em síntese, embora a objeção tenha mérito, ela não invalida…*). This dialectical arc is what separates a C1 essay from a list of opinions."},
      {"heading":"Language to deploy","text":"Concession: *embora + subjuntivo*, *ainda que*, *é verdade que…, contudo*. Position: *sustento que*, *defendo a tese de que*, *cabe ressaltar que*. Consequence: *por conseguinte*, *disso decorre que*. Aim for at least one future subjunctive (*se o Congresso aprovar…*) and one concessive clause — examiners look for exactly these."},
      {"heading":"Self-check rubric","text":"Before finishing, score yourself 0-2 on each line: (1) Position stated unambiguously in paragraph one. (2) Strongest counterargument presented fairly, not as a straw man. (3) At least three formal connectors used correctly. (4) Subjunctive after *embora / para que / se* with no slips. (5) Within 230-270 words. 8+ points: tutorial-ready. Below 6: rewrite paragraph 2 first — the antítese is where most essays collapse."}
   ]}',
   null, 15),
  (6, 'Debate: identity checks on social media', 'roleplay',
   '{"scenario":"A formal debate seminar. The motion: ''As redes sociais deveriam exigir verificação de identidade?'' You choose a side and open with a two-minute argument in Portuguese; your opponent then attacks your reasoning and you must rebut without losing composure or register.","persona":"A sharp, fast debate opponent who genuinely disagrees with whatever you argue: he pushes back hard on your two strongest points — first with a counterexample, then by questioning your underlying premise — before conceding anything.","goal":"State your position with a clear thesis, survive both pushbacks with rebuttals that use concessive structures (embora, ainda que) rather than flat denial, and close with a one-sentence síntese of what your argument proved."}',
   null, 12),
  (7, 'CELPE-Bras reading: the invisible price of traffic', 'reading',
   '{"sections":[
      {"heading":"Opinião: o preço invisível do congestionamento","text":"Quem atravessa uma grande capital brasileira de carro no horário de pico perde, em média, mais de duas horas por dia — tempo que não aparece em nenhuma fatura, mas que se paga em produtividade, saúde e convívio familiar. Curiosamente, o debate público insiste em tratar o congestionamento como fatalidade climática: lamenta-se, mas não se decide nada. Inference check (answer in Portuguese): when the author compares traffic to weather, what criticism is being made — and of whom?"},
      {"heading":"O argumento central","text":"A experiência internacional sugere outro caminho. Cidades que priorizaram faixas exclusivas de ônibus, bilhete integrado e pedágio urbano não eliminaram o carro — tornaram-no desnecessário para a maioria dos trajetos. Não faltam estudos; falta coragem política, porque toda medida eficaz desagrada, no primeiro ano, justamente quem vota. O prefeito que plantar essa árvore raramente colherá seus frutos no próprio mandato. Inference check: the author never says mayors are cowardly — but what does the tree metaphor imply about why reforms stall?"},
      {"heading":"A provocação final","text":"Há quem diga que restringir o carro é medida elitista contra quem mora longe. O argumento merece resposta, não desdém: quem mora longe é exatamente quem mais sofre hoje, espremido em ônibus lentos presos atrás dos carros de quem mora perto. Subsidiar o congestionamento é, na prática, subsidiar o privilégio. Inference check: does the author accept, reject, or partially concede the elitism objection? Support your answer with the sentence that shows the concession move — then summarize the whole op-ed in one Portuguese sentence, CELPE-Bras style."}
   ]}',
   null, 13),
  (8, 'Register: near-synonyms that raise your level', 'vocab',
   '{"items":[
      {"term":"solicitar (vs. pedir)","translation":"to request (formal) vs. to ask for","ipa":"so.li.siˈtaʁ","example":"Solicitamos que os documentos sejam enviados até sexta-feira."},
      {"term":"realizar (vs. fazer)","translation":"to carry out, conduct vs. to do/make","ipa":"ʁe.a.liˈzaʁ","example":"A equipe realizou um estudo de viabilidade em três semanas."},
      {"term":"almejar (vs. querer)","translation":"to aspire to vs. to want","ipa":"aw.meˈʒaʁ","example":"A empresa almeja liderar o mercado latino-americano até 2030."},
      {"term":"adquirir (vs. comprar)","translation":"to acquire vs. to buy","ipa":"a.dʒi.kiˈɾiʁ","example":"O grupo adquiriu duas startups de logística no último ano."},
      {"term":"residir (vs. morar)","translation":"to reside vs. to live (somewhere)","ipa":"ʁe.ziˈdʒiʁ","example":"A candidata reside em Belo Horizonte desde 2018."},
      {"term":"averiguar (vs. checar)","translation":"to ascertain, verify vs. to check","ipa":"a.ve.ɾiˈgwaʁ","example":"O comitê averiguou a origem dos dados antes de publicá-los."}
   ]}',
   'Both members of each pair are correct — the difference is register. Use the formal verb in reports, exams and presentations (*realizamos uma pesquisa*), and the neutral one in conversation (*fizemos uma pesquisa*). Mixing registers — *a gente almeja* — is a classic C1 examiner trap: keep the whole sentence at one level.', 9),
  (9, 'Capstone brief: your five-minute talk', 'writing',
   '{"sections":[
      {"heading":"The brief","text":"Design and outline a five-minute presentation, entirely in Portuguese, on a real question from your own field — for example: *Minha área deveria adotar a semana de quatro dias?* The deliverable for this lesson is the written outline: title, thesis in one sentence (*Sustento que…*), three supporting points with one piece of evidence each, one anticipated objection with your rebuttal, and a closing síntese. The talk itself is your course capstone."},
      {"heading":"Milestones","text":"Milestone 1 — choose the question and write the one-sentence thesis; if you cannot state it in one sentence, the topic is too broad. Milestone 2 — draft the outline and check it against the essay rubric from the tutorial lesson. Milestone 3 — rehearse aloud twice with a timer: under 4:30 means you need one more example; over 5:30 means cut your weakest point, not talk faster. Milestone 4 — record yourself once and listen only for two things: subjunctive slips and register drops (*a gente*, *tipo*, *né* have no place here)."},
      {"heading":"Evaluation criteria","text":"You will be assessed the way a seminar would assess you: Argumentation (40%) — clear thesis, evidence attached to every claim, one objection honestly answered. Language (40%) — correct subjunctive in concessive and conditional clauses, formal connectors, consistent register. Delivery (20%) — within 4:30-5:30, structured signposting (*em primeiro lugar…, passo agora a…, em síntese…*). Anything you cannot defend under questioning, cut before you present it."}
   ]}',
   null, 15),
  (10, 'C1 checkpoint', 'quiz',
   '{"questions":[
      {"prompt":"Choose the connector: \"A proposta reduz custos; ___, exige um investimento inicial elevado.\"","options":["no entanto","por conseguinte","ou seja","além disso"],"answer":0,"explanation":"The second clause opposes the first, so the contrastive *no entanto* fits. *Por conseguinte* would signal consequence, *ou seja* a reformulation, *além disso* an addition."},
      {"prompt":"Which sentence keeps formal register for a written report?","options":["A gente fez uma pesquisa com os clientes.","Realizamos uma pesquisa com os clientes.","Fizemos uma pesquisinha com os clientes.","Fizemos uma pesquisa, tá?"],"answer":1,"explanation":"*Realizamos* is the formal register verb with the standard first-person plural. *A gente*, the diminutive *pesquisinha* and the tag *tá?* all drop the register."},
      {"prompt":"Read: \"A empresa não descartou a expansão, mas o tom da diretora sugere que o entusiasmo inicial esfriou.\" What can be inferred?","options":["The expansion has been cancelled.","The expansion now looks less likely than before.","The director wants to expand faster.","The expansion has already happened."],"answer":1,"explanation":"*Não descartou* rules out cancellation, and *o entusiasmo esfriou* signals fading support — so the plan survives but with weaker momentum. Inference, not statement: nothing is decided in the text."},
      {"prompt":"Complete: \"Embora o projeto ___ caro, o conselho o aprovou.\"","options":["é","seja","era","será"],"answer":1,"explanation":"*Embora* always triggers the subjunctive; with a present-time concession that is *seja*. The indicative forms are all ungrammatical after *embora*."},
      {"prompt":"Complete: \"Quando os resultados ___, enviaremos o parecer ao conselho.\"","options":["chegarem","chegam","cheguem","chegariam"],"answer":0,"explanation":"*Quando* pointing to the future takes the futuro do subjuntivo: *chegarem*. *Cheguem* is present subjunctive (wrong mood-tense here) and *chegam* is plain indicative."},
      {"prompt":"Complete: \"Enviamos o resumo com antecedência para que todos ___ preparar perguntas.\"","options":["podem","possam","poderão","podiam"],"answer":1,"explanation":"Purpose clauses with *para que* require the present subjunctive: *possam*. Note the irregular stem — and remember its future subjunctive cousin *puder* after *se* and *quando*."}
   ]}',
   null, 10)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0004-0000-4000-8000-000000000004' and l.position = v.pos
);
