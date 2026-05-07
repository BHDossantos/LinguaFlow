-- Sample seed: Spanish A1 (Latin American)
insert into public.courses (id, language, dialect, title, description, cefr_level, goal_tag, position, published)
values (
  '11111111-1111-1111-1111-111111111111',
  'es', 'latam',
  'Spanish for travel — Latin American',
  'Order food, ask directions, handle money, make small talk.',
  'A1', 'travel', 1, true
);

insert into public.lessons (course_id, position, title, kind, body, grammar_notes_md, estimated_minutes) values
('11111111-1111-1111-1111-111111111111', 1, 'Greetings & introductions', 'vocab',
 '{"items":[
    {"term":"hola","translation":"hello","ipa":"ˈo.la","example":"Hola, ¿cómo estás?"},
    {"term":"buenos días","translation":"good morning","ipa":"ˈbwe.nos ˈdi.as","example":"Buenos días, señor."},
    {"term":"me llamo","translation":"my name is","example":"Me llamo Ana."}
 ]}'::jsonb,
 'Spanish uses inverted question marks (¿) and exclamation marks (¡). The verb *llamarse* is reflexive — literally "I call myself".',
 8),

('11111111-1111-1111-1111-111111111111', 2, 'At the café', 'roleplay',
 '{"scenario":"You walk into a café in Mexico City. Order a coffee and a pastry, ask the price, pay.","goal":"Complete the order with no English.","persona":"friendly barista, speaks at moderate speed"}'::jsonb,
 null, 10),

('11111111-1111-1111-1111-111111111111', 3, 'Numbers 1–20', 'vocab',
 '{"items":[
    {"term":"uno","translation":"one"},{"term":"dos","translation":"two"},{"term":"tres","translation":"three"},
    {"term":"cuatro","translation":"four"},{"term":"cinco","translation":"five"}
 ]}'::jsonb, null, 6);
