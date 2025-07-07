-- Enable pg_cron extension for scheduling
SELECT cron.schedule(
  'generate-recurring-transactions',
  '0 0 1 * *', -- Run at 00:00 on the 1st day of every month
  $$
  SELECT
    net.http_post(
        url:='https://xtujsvzfthsqfeqrsqvt.supabase.co/functions/v1/generate-recurring-transactions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dWpzdnpmdGhzcWZlcXJzcXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NjA2MDIsImV4cCI6MjA2NzIzNjYwMn0.qY8HTnkhM0osSaYmw7EWE8EfB6g3RQCbSkeU16n2arU"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);