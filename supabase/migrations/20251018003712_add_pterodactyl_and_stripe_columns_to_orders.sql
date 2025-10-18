/*
  # Add Pterodactyl and Stripe columns to orders table

  1. Changes
    - Add `pterodactyl_server_id` column to store the server ID from Pterodactyl
    - Add `pterodactyl_identifier` column to store the server identifier/UUID
    - Add `stripe_payment_intent` column to store Stripe payment intent ID
    - Add `stripe_session_id` column to store Stripe checkout session ID

  2. Notes
    - All columns are optional (nullable) as they'll be populated after creation
    - These columns enable tracking of external service IDs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'pterodactyl_server_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN pterodactyl_server_id integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'pterodactyl_identifier'
  ) THEN
    ALTER TABLE orders ADD COLUMN pterodactyl_identifier text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_session_id text;
  END IF;
END $$;
