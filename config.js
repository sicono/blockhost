// Configuración de Supabase
// IMPORTANTE: Este archivo contiene las credenciales públicas (anon key)
// La anon key es segura para uso público ya que Supabase usa RLS (Row Level Security)
// para proteger los datos

export const config = {
  supabase: {
    url: 'https://nthbvwoclvifyqoftfje.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aGJ2d29jbHZpZnlxb2Z0ZmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTkxMzksImV4cCI6MjA3NjE3NTEzOX0.MFilAbPA-fMJnpdJZ-PefO3c7ml7m_0B-IZFPaQihyg'
  },
  stripe: {
    // Stripe Publishable Key (segura para uso público)
    // NOTA: Necesitas configurar tus productos en Stripe Dashboard y reemplazar los stripePriceId en checkout.js
    publishableKey: 'pk_live_51SJCFYDQaOEVVvuYbj1Q7Pc53TwLnsLxRZOux0Fvb0xNGloXgaM4I2SMXjJMmI9rtLtcKVG7Y6ErX0UKD6PNZdIg00ReJSqwZZ'
  }
};
