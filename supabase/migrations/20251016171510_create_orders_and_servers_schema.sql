/*
  # Create Orders and Server Configuration Schema

  ## Overview
  This migration creates the necessary database structure for handling server orders and configurations in the BlockHost Minecraft hosting platform.

  ## New Tables
  
  ### 1. `orders`
  Stores all order information including plan details and configuration choices.
  - `id` (uuid, primary key) - Unique order identifier
  - `email` (text, not null) - Customer email address
  - `plan_name` (text, not null) - Plan tier (Mini, Básico, Estándar, Plus)
  - `price_eur` (decimal, not null) - Price in euros
  - `ram_gb` (integer, not null) - Allocated RAM in GB
  - `storage_gb` (integer, not null) - Storage space in GB
  - `max_players` (text, not null) - Maximum players range
  - `version` (text, not null) - Minecraft version (Java or Bedrock)
  - `software` (text, not null) - Selected software/core (Vanilla, Paper, Forge, etc.)
  - `region` (text, not null) - Server region (Canada, Europa)
  - `status` (text, default 'pending') - Order status (pending, processing, completed, failed)
  - `payment_status` (text, default 'pending') - Payment status (pending, completed, failed)
  - `created_at` (timestamptz, default now()) - Order creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### 2. `servers`
  Stores provisioned server information after successful payment.
  - `id` (uuid, primary key) - Unique server identifier
  - `order_id` (uuid, foreign key) - Reference to original order
  - `email` (text, not null) - Owner email address
  - `server_name` (text, not null) - Server display name
  - `plan_name` (text, not null) - Plan tier
  - `ram_gb` (integer, not null) - Allocated RAM
  - `storage_gb` (integer, not null) - Storage space
  - `version` (text, not null) - Minecraft version
  - `software` (text, not null) - Installed software
  - `region` (text, not null) - Server region
  - `status` (text, default 'provisioning') - Server status (provisioning, active, suspended, terminated)
  - `created_at` (timestamptz, default now()) - Server creation timestamp
  - `expires_at` (timestamptz) - Subscription expiry date

  ## Security
  
  ### Row Level Security (RLS)
  - Both tables have RLS enabled
  - Users can only view their own orders and servers (filtered by email)
  - Only authenticated users can insert orders
  - Only authenticated users can view their data

  ## Important Notes
  - All tables use `gen_random_uuid()` for primary keys
  - Timestamps are automatically managed
  - Foreign key constraint ensures data integrity between orders and servers
  - Default values are set for status fields to ensure data consistency
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  plan_name text NOT NULL,
  price_eur decimal(10,2) NOT NULL,
  ram_gb integer NOT NULL,
  storage_gb integer NOT NULL,
  max_players text NOT NULL,
  version text NOT NULL,
  software text NOT NULL,
  region text NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create servers table
CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  email text NOT NULL,
  server_name text NOT NULL,
  plan_name text NOT NULL,
  ram_gb integer NOT NULL,
  storage_gb integer NOT NULL,
  version text NOT NULL,
  software text NOT NULL,
  region text NOT NULL,
  status text DEFAULT 'provisioning',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = email);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = email);

-- Servers policies
CREATE POLICY "Users can view own servers"
  ON servers FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = email);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_servers_email ON servers(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
