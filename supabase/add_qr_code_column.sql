-- Add QR code column to assets table
alter table public.assets
add column if not exists qr_code text;

-- Optional: index for faster lookups by QR code
create index if not exists assets_qr_code_idx on public.assets (qr_code);

