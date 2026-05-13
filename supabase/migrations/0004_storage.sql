-- Private bucket for student submissions (text was already inline; this is for
-- file + audio attachments). Teachers fetch via short-lived signed URLs minted
-- server-side by /api/uploads/sign-get.

insert into storage.buckets (id, name, public)
  values ('submissions', 'submissions', false)
  on conflict (id) do nothing;

-- Path convention: submissions/{user_id}/{assignment_id}/{filename}
-- The first folder must match the uploader's auth.uid().

create policy "submissions student upload"
  on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "submissions student read own"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "submissions student delete own"
  on storage.objects for delete
  using (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
