-- Spanish C1 seminar pack (Latin-American Spanish, dialect 'latam').
-- One advanced course built on elite-university pedagogy: the case method
-- (analyze, then defend a decision), tutorial-style argumentative essays,
-- adversarial debate seminars, a project-based capstone, and DELE C1 exam
-- drills. All content is original. Fixed UUIDs and guarded inserts make the
-- file idempotent: safe to re-run at any time.

-- ============ Spanish — Seminar & Exam Mastery ============
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  'aaaa0001-0000-4000-8000-000000000004',
  'es', 'latam',
  'Spanish — Seminar & Exam Mastery',
  'Operate in Spanish at seminar level: work through a business case with the case method, write tutorial-style argumentative essays, hold your own in debate seminars, build a capstone presentation project, and drill DELE C1 exam skills.',
  'C1', 'work', 13, true
) on conflict (id) do nothing;

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes)
select 'aaaa0001-0000-4000-8000-000000000004', v.pos, v.title, v.kind, v.body::jsonb, v.notes, v.mins
from (values
  (1, 'The case: a startup expands to Mexico', 'reading',
   '{"sections":[
      {"heading":"Los hechos","text":"Kuska es una startup chilena de software de logística con 40 empleados y tres años de operación. Su plataforma optimiza rutas de reparto para cadenas de farmacias y ya domina el mercado santiaguino. En marzo, la dirección recibió dos noticias el mismo día: un fondo de inversión ofreció seis millones de dólares para financiar la expansión a México, y su cliente más grande —el 45 % de los ingresos— anunció que renegociará su contrato a la baja. La directora general, Paulina Reyes, convocó al comité ejecutivo para decidir el rumbo de la empresa antes de fin de mes."},
      {"heading":"La tensión","text":"El equipo está dividido. El director comercial sostiene que entrar a Ciudad de México es urgente: el mercado es diez veces mayor y dos competidores estadounidenses ya negocian con las cadenas mexicanas. La directora de operaciones, en cambio, advierte que la empresa apenas retiene a sus ingenieros, que la normativa sanitaria mexicana exige certificaciones que tomarían un año y que expandirse con un cliente clave en fuga sería «construir el segundo piso mientras se incendia el primero». El fondo, por su parte, condiciona la inversión a que la expansión comience en seis meses."},
      {"heading":"La decisión abierta","text":"Paulina debe recomendar una de tres rutas al directorio: aceptar la inversión y lanzar la operación mexicana ya; rechazarla y consolidar Chile primero; o negociar un plazo mayor con el fondo, arriesgándose a que retire la oferta. No hay opción sin costo. Preguntas para la discusión: ¿Qué peso debería tener la amenaza de los competidores frente a la fragilidad interna? ¿Qué información adicional pediría usted antes de decidir, y qué haría si no pudiera obtenerla a tiempo? ¿Cuál ruta recomendaría usted y cuál es el argumento más fuerte en su contra?"}
   ]}',
   null, 15),
  (2, 'Seminar: defend your recommendation', 'roleplay',
   '{"scenario":"A case-discussion seminar on the Kuska case from the previous lesson. You open by stating which of the three routes you recommend and why. The seminar leader cross-examines you: they will question your assumptions, cite facts from the case against you, and ask what would make you change your mind. Concede points where honest, but hold a defensible position to the end.","persona":"An exacting seminar professor who never gives their own opinion, answers every argument with a harder question, and politely refuses to accept vague generalities","goal":"Sustain a clear recommendation on the case through at least three rounds of challenge, in precise argumentative Spanish"}',
   null, 12),
  (3, 'Academic & argumentation Spanish', 'vocab',
   '{"items":[
      {"term":"no obstante","translation":"nevertheless, however (formal)","ipa":"no oβsˈtan.te","example":"El plan es ambicioso; no obstante, los plazos parecen poco realistas."},
      {"term":"cabe señalar","translation":"it is worth pointing out","ipa":"ˈka.βe se.ɲaˈlaɾ","example":"Cabe señalar que los datos provienen de una muestra reducida."},
      {"term":"en síntesis","translation":"in summary, in short","ipa":"en ˈsin.te.sis","example":"En síntesis, la evidencia respalda la segunda hipótesis."},
      {"term":"plantear","translation":"to pose, to raise (an issue, question)","ipa":"plan.teˈaɾ","example":"El informe plantea una pregunta incómoda sobre los costos ocultos."},
      {"term":"sostener","translation":"to argue, to maintain (a position)","ipa":"sos.teˈneɾ","example":"La autora sostiene que la regulación llegó demasiado tarde."},
      {"term":"por consiguiente","translation":"consequently, therefore (formal)","ipa":"poɾ kon.siˈɣjen.te","example":"La demanda cayó un 20 %; por consiguiente, habrá que ajustar la producción."}
   ]}',
   'These connectors mark register: *no obstante* and *por consiguiente* belong to essays and presentations, where *pero* and *entonces* would sound casual. *Plantear* raises a question; *sostener* defends an answer — a C1 essay needs both moves.', 10),
  (4, 'Advanced connectors & the subjunctive', 'grammar',
   '{"sections":[
      {"heading":"Aunque + subjunctive vs indicative","text":"With *aunque*, the mood signals how real the concession is. Indicative states a fact you concede: *Aunque el mercado mexicano es enorme, la empresa no está lista* (it IS enormous, granted). Subjunctive marks the concession as hypothetical or as information you refuse to treat as decisive: *Aunque el mercado sea enorme, la empresa no está lista* (even if / however enormous it may be). In debate, the subjunctive version is a power move: you neutralize the rival argument without disputing its truth."},
      {"heading":"Con tal de que — condition as bargain","text":"*Con tal de que* + subjunctive means provided that, and frames a condition as the price of your agreement: *Acepto la inversión con tal de que el fondo extienda el plazo a un año.* Related bargaining connectors also take the subjunctive: *siempre que* (as long as), *a menos que* (unless), *salvo que* (except if). With the same subject, drop *que* and use the infinitive: *Con tal de cerrar el trato, prometieron lo imposible.*"},
      {"heading":"A fin de que — purpose in formal prose","text":"Purpose clauses with a change of subject take *a fin de que* or *para que* + subjunctive: *Documentó cada supuesto a fin de que el directorio pudiera verificar el análisis.* Note the tense agreement: a past main verb pulls the subjunctive into the imperfect (*pudiera*), a present one keeps it present (*pueda*). *A fin de que* is the formal register choice for reports and essays; *para que* works everywhere."}
   ]}',
   null, 12),
  (5, 'Tutorial essay: the remote-work question', 'writing',
   '{"sections":[
      {"heading":"Your prompt","text":"Write a 250-word argumentative essay in Spanish: «Las empresas deberían tener derecho a exigir el retorno presencial a la oficina». Agree, disagree, or defend a qualified position — but commit to a thesis in the first paragraph. This is a tutorial essay: assume a demanding reader who will probe every claim, so every assertion needs a reason or an example behind it."},
      {"heading":"Structure: thesis — antithesis — synthesis","text":"Paragraph 1 (thesis): state your position in one sharp sentence, then give your two strongest reasons. Paragraph 2 (antithesis): present the best version of the opposing view — not a caricature — using concessive language: *es cierto que…*, *no puede negarse que…*, *aunque se argumente que…*. Paragraph 3 (synthesis): explain why your position survives the objection, or how it must be refined to survive it. Close with a consequence, not a repetition: what follows if the reader accepts your thesis?"},
      {"heading":"Self-check rubric","text":"Before submitting, audit your draft against four criteria. Argument: could a skeptic state your thesis and your main reason after one reading? Counterargument: did you concede something real, or did you attack a straw man? Language: at least three formal connectors (*no obstante*, *por consiguiente*, *cabe señalar*) and at least one correct subjunctive in a concessive or purpose clause? Economy: cut every sentence that neither advances nor defends the thesis — at 250 words there is no room for decoration."}
   ]}',
   null, 15),
  (6, 'Debate: ID verification on social media', 'roleplay',
   '{"scenario":"A formal oral debate: «¿Deberían las redes sociales exigir verificación de identidad a todos los usuarios?». You choose your side in your opening statement; your opponent immediately takes the other side. Expect at least two direct rebuttals — they will attack your weakest premise first, then press a hypothetical designed to trap you. Rebut with evidence and concessive structures (aunque + subjunctive), and finish with a closing statement.","persona":"A sharp, fast debate opponent who always argues the side you did not pick, quotes your own words back at you, and pushes back at least twice before conceding anything","goal":"Deliver an opening, survive two rebuttals, and close the debate without abandoning your position"}',
   null, 12),
  (7, 'Exam reading: the city we measure', 'reading',
   '{"sections":[
      {"heading":"Columna de opinión — I","text":"Las capitales latinoamericanas se han vuelto expertas en inaugurar. Cada año se cortan cintas de teleféricos, ciclovías y estaciones intermodales ante cámaras entusiastas. Sin embargo, los mapas de esos proyectos dibujan siempre la misma silueta: corredores que conectan el centro financiero con los barrios que ya estaban conectados. La periferia, donde los trayectos al trabajo superan las dos horas, aparece en los discursos y desaparece en los presupuestos. Pregunta de inferencia: cuando el autor dice que las ciudades son «expertas en inaugurar», ¿elogia la gestión pública o insinúa que se privilegia la foto sobre el impacto?"},
      {"heading":"Columna de opinión — II","text":"Se dirá que los recursos son finitos y que conviene invertir donde hay densidad de usuarios. El argumento parece técnico, pero esconde una circularidad: la periferia tiene pocos usuarios de transporte formal precisamente porque nunca ha tenido oferta. Medir la demanda futura con la vara de la exclusión pasada garantiza que el mapa no cambie jamás. Pregunta de inferencia: según el autor, ¿el criterio de densidad es neutral o perpetúa la desigualdad que dice administrar?"},
      {"heading":"Columna de opinión — III","text":"No se trata de renunciar a la evidencia, sino de elegir qué medimos. Si el indicador fuera el tiempo que una enfermera de la periferia tarda en llegar al hospital donde trabaja, y no el número de pasajeros por kilómetro, otras obras encabezarían la lista. Las ciudades terminan pareciéndose a sus métricas. Pregunta de inferencia: la frase final sugiere que cambiar los indicadores cambiaría las prioridades urbanas — ¿presenta el autor esto como una utopía lejana o como una decisión disponible hoy?"}
   ]}',
   null, 14),
  (8, 'Near-synonyms & register', 'vocab',
   '{"items":[
      {"term":"solicitar vs pedir","translation":"to request (formal) vs to ask for (neutral)","ipa":"so.li.siˈtaɾ","example":"Le escribo para solicitar una prórroga. / ¿Puedo pedirte un favor?"},
      {"term":"laboral vs de trabajo","translation":"labor-, work- (adjective, formal) vs of work (plain)","ipa":"la.βoˈɾal","example":"El mercado laboral se contrajo. / Tengo una reunión de trabajo a las tres."},
      {"term":"acorde con vs de acuerdo con","translation":"in keeping with vs in accordance with / according to","ipa":"aˈkoɾ.ðe","example":"Un sueldo acorde con su experiencia. / De acuerdo con el informe, las ventas cayeron."},
      {"term":"llevar a cabo vs hacer","translation":"to carry out (formal) vs to do (neutral)","ipa":"ʝeˈβaɾ a ˈka.βo","example":"El equipo llevó a cabo la auditoría. / Hicimos la tarea juntos."},
      {"term":"percatarse de vs darse cuenta de","translation":"to become aware of (formal) vs to realize (neutral)","ipa":"peɾ.kaˈtaɾ.se","example":"Nadie se percató del error hasta la revisión final. / Me di cuenta tarde."},
      {"term":"remuneración vs sueldo","translation":"remuneration (formal) vs salary, pay (everyday)","ipa":"re.mu.ne.ɾaˈsjon","example":"La remuneración se ajustará por inflación. / Me depositan el sueldo el día 30."}
   ]}',
   'At C1 the exam rewards register control, not rare words: in a formal letter write *solicitar*, *llevar a cabo*, *remuneración*; in conversation the same ideas take *pedir*, *hacer*, *sueldo*. Using the formal member in casual speech sounds stiff — the mismatch is penalized in both directions.', 10),
  (9, 'Capstone: your five-minute talk', 'writing',
   '{"sections":[
      {"heading":"The project","text":"Design a five-minute presentation in Spanish on a real topic from your professional field — a decision your team faces, a tool you would adopt, a trend your industry ignores. Deliverables: a one-sentence thesis, a written outline (opening hook, three argument blocks, close with a recommendation), and a slide-by-slide plan of at most five slides with one idea per slide. The talk must answer a question a real colleague would care about, not summarize a topic."},
      {"heading":"Milestones","text":"Milestone 1 — choose the question and write the thesis sentence; if you cannot state it in one Spanish sentence, the topic is still too broad. Milestone 2 — draft the outline and mark where each formal connector and each subjunctive structure from lessons 3 and 4 will appear. Milestone 3 — write the opening 60 seconds word for word and rehearse them aloud. Milestone 4 — deliver the full talk aloud, twice: once reading the outline, once from the slides alone."},
      {"heading":"Evaluation criteria","text":"Grade yourself on four axes, 1 to 4 each. Claridad: a listener can repeat your thesis and recommendation afterward. Estructura: the three blocks each earn their place and appear in the strongest order. Lengua: sustained C1 register, at least three formal connectors, no more than one reformulated sentence per minute. Defensa: you prepared answers to the two hardest questions the audience could ask. A total of 12 or higher means the talk is ready for a real audience."}
   ]}',
   null, 15),
  (10, 'C1 checkpoint', 'quiz',
   '{"questions":[
      {"prompt":"La propuesta implica costos altos; ___, sus beneficios a largo plazo la justifican con creces.","options":["no obstante","a fin de que","con tal de que","puesto que"],"answer":0,"explanation":"A contrast between two facts needs a concessive connector: no obstante (nevertheless). The other options introduce purpose, condition, and cause."},
      {"prompt":"Formal email to a client: «Le escribo para ___ una reunión la próxima semana.»","options":["pedir","exigir","solicitar","rogar"],"answer":2,"explanation":"Solicitar is the formal register match for a business email. Pedir is neutral-casual, exigir is aggressive (to demand), rogar is excessively pleading."},
      {"prompt":"«Aunque el informe elogia la nueva línea de metro, dedica tres páginas a los barrios que quedaron sin cobertura. Cierra preguntando quién decide qué zonas merecen inversión.» ¿Qué se puede inferir sobre el autor del informe?","options":["Celebra el proyecto sin reservas","Cuestiona el reparto desigual de la inversión","Propone cancelar la línea de metro","Considera irrelevante la cobertura"],"answer":1,"explanation":"Praising the line while devoting three pages to excluded neighborhoods and ending on who decides signals criticism of unequal distribution — inferred, never stated outright."},
      {"prompt":"«Te presto el auto con tal de que me lo ___ antes del viernes.»","options":["devuelves","devolverás","devuelvas","devolviste"],"answer":2,"explanation":"Con tal de que always takes the subjunctive: devuelvas. The indicative forms are ungrammatical after this connector."},
      {"prompt":"Choose the sentence that means «even if it is expensive, I will buy it» (speaker does not know the price yet):","options":["Aunque es caro, lo compraré.","Aunque era caro, lo compré.","Aunque sea caro, lo compraré.","Aunque fue caro, lo compraré."],"answer":2,"explanation":"A hypothetical concession takes the subjunctive: aunque sea caro. The indicative (es caro) concedes a known fact — the speaker would already know the price."},
      {"prompt":"«Redactó el informe con sumo cuidado ___ el directorio no encontrara ningún error.»","options":["a fin de que","no obstante","de acuerdo con","en síntesis"],"answer":0,"explanation":"A purpose clause with a different subject needs a fin de que + subjunctive (encontrara, imperfect subjunctive agreeing with the past main verb redactó)."}
   ]}',
   null, 10)
) as v(pos, title, kind, body, notes, mins)
where not exists (
  select 1 from public.lessons l
  where l.course_id = 'aaaa0001-0000-4000-8000-000000000004' and l.position = v.pos
);
