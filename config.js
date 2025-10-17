// Configuración de Supabase
// IMPORTANTE: Este archivo contiene las credenciales públicas (anon key)
// La anon key es segura para uso público ya que Supabase usa RLS (Row Level Security)
// para proteger los datos

export const config = {
  supabase: {
    url: 'https://nthbvwoclvifyqoftfje.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aGJ2d29jbHZpZnlxb2Z0ZmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTkxMzksImV4cCI6MjA3NjE3NTEzOX0.MFilAbPA-fMJnpdJZ-PefO3c7ml7m_0B-IZFPaQihyg'
  },
  paypal: {
    // Client ID de PayPal (puedes cambiarlo cuando tengas el de producción)
    clientId: 'AVMCOVzTwRauV1kPTt9w6kZj_fTQVSlfLMlx7L39tiKDODGm5Eek-G6phL6kYc3EaCc5PcCJ5UKY4dmR',
    currency: 'EUR'
  }
};
