-- Phase 3 seed: academic (non-language) courses to prove the platform is
-- multi-subject. Instruction language is English; teacher_id left null
-- (platform-authored content; students can read via the published policy).

-- ===== Introduction to Biology (science) =====
insert into public.courses (id, language, title, description, cefr_level, kind, subject, position, published)
values (
  '22222222-2222-2222-2222-222222222222',
  'en',
  'Introduction to Biology',
  'Cells, energy, genetics, evolution, and ecosystems — a first secondary-school biology course.',
  null, 'science', 'Biology', 10, true
);

insert into public.lessons (course_id, position, title, kind, body, estimated_minutes) values
('22222222-2222-2222-2222-222222222222', 1, 'The cell: life''s basic unit', 'reading',
 '{"content":"All living things are made of cells. A cell is the smallest unit that can carry out the processes of life: taking in energy, responding to the environment, and reproducing.\n\nProkaryotic cells (bacteria) have no nucleus. Eukaryotic cells (plants, animals, fungi) keep their DNA inside a membrane-bound nucleus and contain organelles such as mitochondria and, in plants, chloroplasts.","key_terms":[{"term":"Organelle","definition":"A specialized structure inside a cell."},{"term":"Nucleus","definition":"The membrane-bound compartment that holds a eukaryotic cell''s DNA."}]}'::jsonb, 12),

('22222222-2222-2222-2222-222222222222', 2, 'Energy: photosynthesis & respiration', 'reading',
 '{"content":"Cells need energy. Photosynthesis (in chloroplasts) converts light energy, water, and carbon dioxide into glucose and oxygen. Cellular respiration (in mitochondria) breaks glucose back down to release usable energy (ATP), producing carbon dioxide and water.\n\nThese two processes form a cycle that connects nearly all life on Earth.","key_terms":[{"term":"ATP","definition":"The molecule cells use to store and transfer energy."},{"term":"Glucose","definition":"A sugar that stores chemical energy."}]}'::jsonb, 14),

('22222222-2222-2222-2222-222222222222', 3, 'DNA and inheritance', 'reading',
 '{"content":"DNA is a long molecule that stores genetic instructions in a four-letter code (A, T, G, C). Genes are segments of DNA that code for proteins. Offspring inherit one copy of each gene from each parent.\n\nGregor Mendel''s pea-plant experiments showed that traits are inherited in predictable ratios — the foundation of classical genetics."}'::jsonb, 14),

('22222222-2222-2222-2222-222222222222', 4, 'Evolution by natural selection', 'reading',
 '{"content":"Within any population, individuals vary. When variation is heritable and affects survival or reproduction, the better-suited variants leave more offspring. Over many generations this shifts the population — evolution by natural selection.\n\nEvidence comes from fossils, comparative anatomy, biogeography, and DNA."}'::jsonb, 13),

('22222222-2222-2222-2222-222222222222', 5, 'Ecosystems & energy flow', 'reading',
 '{"content":"An ecosystem is a community of organisms plus their physical environment. Energy enters through producers (usually via photosynthesis), flows to consumers, and is lost as heat at each step — which is why food chains are short.\n\nMatter (carbon, nitrogen, water) cycles; energy does not — it flows through and is lost."}'::jsonb, 12);

insert into public.assignments (course_id, title, instructions_md, rubric, max_score, kind, language, published) values
('22222222-2222-2222-2222-222222222222',
 'Explain the energy cycle',
 'In 250-350 words, explain how photosynthesis and cellular respiration are connected. Use the terms glucose, ATP, oxygen, and carbon dioxide correctly.',
 '[{"name":"Scientific accuracy","weight":0.4,"description":"Correct use of concepts and terms."},{"name":"Clarity & structure","weight":0.3,"description":"Logical, well-organized explanation."},{"name":"Completeness","weight":0.3,"description":"Addresses both processes and their link."}]'::jsonb,
 100, 'essay', 'en', true),
('22222222-2222-2222-2222-222222222222',
 'Natural selection short answer',
 'A population of beetles lives on a mostly dark tree bark. Explain, in 120-180 words, what would likely happen to beetle coloration over many generations if a lighter-barked tree species took over the forest.',
 '[{"name":"Reasoning","weight":0.5,"description":"Correct application of natural selection."},{"name":"Use of evidence/logic","weight":0.3,"description":"Clear cause-and-effect chain."},{"name":"Concision","weight":0.2,"description":"Stays on point within the word range."}]'::jsonb,
 100, 'short_answer', 'en', true);

-- ===== Algebra I Foundations (math) =====
insert into public.courses (id, language, title, description, cefr_level, kind, subject, position, published)
values (
  '33333333-3333-3333-3333-333333333333',
  'en',
  'Algebra I Foundations',
  'Variables, equations, inequalities, and linear functions — the core of first-year algebra.',
  null, 'math', 'Algebra I', 11, true
);

insert into public.lessons (course_id, position, title, kind, body, estimated_minutes) values
('33333333-3333-3333-3333-333333333333', 1, 'Variables & expressions', 'reading',
 '{"content":"A variable is a symbol that stands for a number we don''t know yet. An expression combines variables, numbers, and operations — for example 3x + 5.\n\nTo evaluate an expression, substitute a value for the variable: if x = 4, then 3x + 5 = 3(4) + 5 = 17."}'::jsonb, 10),

('33333333-3333-3333-3333-333333333333', 2, 'Solving linear equations', 'reading',
 '{"content":"To solve an equation, isolate the variable by doing the same operation to both sides.\n\nExample: 3x + 5 = 17  ->  3x = 12  ->  x = 4.\n\nAlways check by substituting your answer back into the original equation."}'::jsonb, 12),

('33333333-3333-3333-3333-333333333333', 3, 'Inequalities', 'reading',
 '{"content":"Inequalities (<, >, <=, >=) describe ranges of values. Solve them like equations, with one rule: when you multiply or divide both sides by a negative number, flip the inequality sign.\n\nExample: -2x < 6  ->  x > -3."}'::jsonb, 11),

('33333333-3333-3333-3333-333333333333', 4, 'The coordinate plane & slope', 'reading',
 '{"content":"Points are located by an (x, y) pair on the coordinate plane. Slope measures steepness: slope = rise / run = (y2 - y1) / (x2 - x1).\n\nA positive slope rises left-to-right; a negative slope falls."}'::jsonb, 12),

('33333333-3333-3333-3333-333333333333', 5, 'Linear functions: y = mx + b', 'reading',
 '{"content":"A linear function has the form y = mx + b, where m is the slope and b is the y-intercept (where the line crosses the y-axis).\n\nGiven m and b you can graph the line; given two points you can find m, then solve for b."}'::jsonb, 13);

insert into public.assignments (course_id, title, instructions_md, rubric, max_score, kind, language, published) values
('33333333-3333-3333-3333-333333333333',
 'Solve and explain: linear equations',
 'Solve each equation and show every step.\n1) 4x - 7 = 21\n2) 2(x + 3) = 16\n3) (x / 5) + 2 = 6\nFor each, write one sentence explaining how you isolated the variable.',
 '[{"name":"Correct answers","weight":0.5,"description":"Final values are correct."},{"name":"Shown work","weight":0.35,"description":"Each algebraic step is visible and valid."},{"name":"Explanation","weight":0.15,"description":"Clear reasoning for the isolation step."}]'::jsonb,
 100, 'math', 'en', true),
('33333333-3333-3333-3333-333333333333',
 'Find the line through two points',
 'A line passes through (2, 1) and (6, 9). Find its slope, find its y-intercept, and write the equation in y = mx + b form. Show all work.',
 '[{"name":"Slope","weight":0.35,"description":"Correctly computes rise over run."},{"name":"Y-intercept","weight":0.35,"description":"Correctly solves for b."},{"name":"Final equation & work","weight":0.3,"description":"Correct equation with visible steps."}]'::jsonb,
 100, 'math', 'en', true);
