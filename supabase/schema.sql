create extension if not exists pgcrypto;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  amount numeric not null,
  token text not null default 'USDC',
  tx_hash text,
  status text,
  created_at timestamptz not null default now()
);

create table if not exists prompt_runs (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  prompt text not null,
  cost numeric not null,
  tx_hash text,
  status text,
  created_at timestamptz not null default now()
);

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  receiver text not null,
  amount numeric not null,
  tx_hash text,
  status text,
  created_at timestamptz not null default now()
);
