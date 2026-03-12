alter table public.exam_questions
  add column if not exists source_site text,
  add column if not exists source_url text,
  add column if not exists source_published_at timestamptz,
  add column if not exists content_hash text;

update public.exam_questions
set content_hash = encode(
  digest(
    regexp_replace(lower(trim(content)), '\s+', ' ', 'g'),
    'sha256'
  ),
  'hex'
)
where content_hash is null;

create unique index if not exists idx_exam_questions_content_hash_unique
  on public.exam_questions(content_hash);

create index if not exists idx_exam_questions_source_published_at
  on public.exam_questions(source_published_at desc nulls last);

create index if not exists idx_exam_questions_source_url
  on public.exam_questions(source_url);
