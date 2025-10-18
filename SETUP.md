# BlockHost - Guía de Configuración

Este documento explica cómo configurar correctamente todas las partes del sistema.

## 1. Variables de Entorno de Supabase

Necesitas configurar las siguientes variables de entorno en tu proyecto de Supabase (Settings → Edge Functions → Environment Variables):

### Variables Requeridas:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_TuClaveSecretaDeStripe
STRIPE_WEBHOOK_SECRET=whsec_TuSecretDeWebhookDeStripe

# Pterodactyl
PTERODACTYL_API_KEY=ptla_8v3SqbsvVmYjqgOB2CauBhfUcTp02xTMu1Y2vCZAMwB

# Supabase (Ya configuradas automáticamente)
SUPABASE_URL=https://nthbvwoclvifyqoftfje.supabase.co
SUPABASE_SERVICE_ROLE_KEY=(automático)
SUPABASE_ANON_KEY=(automático)
```

## 2. Configurar Stripe

### 2.1 Crear Productos en Stripe Dashboard

1. Ve a Stripe Dashboard: https://dashboard.stripe.com/test/products
2. Crea 4 productos con estos nombres exactos:
   - **Mini** - €3.50/mes
   - **Básico** - €5.50/mes
   - **Estándar** - €7.50/mes
   - **Plus** - €9.50/mes

3. Después de crear cada producto, copia su **Price ID** (comienza con `price_...`)

### 2.2 Actualizar Price IDs en el código

Edita `checkout.js` y reemplaza los `stripePriceId` en `PLAN_DATA`:

```javascript
const PLAN_DATA = {
  'Mini': {
    name: 'Mini',
    price: 3.50,
    ram: 4,
    storage: 25,
    players: '15-25',
    stripePriceId: 'price_1234567890'  // ← Reemplaza con tu Price ID real
  },
  // ... y así para cada plan
};
```

### 2.3 Actualizar Stripe Publishable Key

Edita `config.js` y reemplaza:

```javascript
stripe: {
  publishableKey: 'pk_test_TuClavePublicaDeStripe'  // ← Reemplaza con tu clave real
}
```

La clave publicable la encuentras en: https://dashboard.stripe.com/test/apikeys

### 2.4 Configurar Webhook de Stripe

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Haz clic en "Add endpoint"
3. URL del endpoint: `https://nthbvwoclvifyqoftfje.supabase.co/functions/v1/stripe-webhook`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copia el **Signing Secret** (comienza con `whsec_...`)
6. Agrégalo a las variables de entorno de Supabase como `STRIPE_WEBHOOK_SECRET`

## 3. Configurar Pterodactyl

### 3.1 Verificar la API Key

La API key ya está en el código: `ptla_8v3SqbsvVmYjqgOB2CauBhfUcTp02xTMu1Y2vCZAMwB`

### 3.2 Configurar Egg IDs

Edita `supabase/functions/create-server/index.ts` y actualiza los `egg_id` según tu instalación de Pterodactyl:

```typescript
const SOFTWARE_TO_EGG: Record<string, { egg_id: number; docker_image: string; startup: string }> = {
  'Vanilla': {
    egg_id: 1,  // ← Reemplaza con tu Egg ID real
    // ...
  },
  // ... etc
};
```

Para encontrar los Egg IDs:
1. Panel de Pterodactyl → Admin → Nests
2. Haz clic en "Minecraft" (o el nest que uses)
3. Los IDs aparecen al lado de cada egg

### 3.3 Configurar User ID y Allocation

En `create-server/index.ts`, actualiza:

```typescript
const serverConfig: ServerConfig = {
  // ...
  user_id: 1,  // ← ID del usuario de Pterodactyl que será dueño del servidor
  // ...
  allocation: {
    default: 1  // ← ID de la allocation (puerto) a usar
  },
};
```

## 4. Desplegar Edge Functions

Para desplegar las funciones a Supabase:

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Login en Supabase
supabase login

# Link tu proyecto
supabase link --project-ref nthbvwoclvifyqoftfje

# Desplegar todas las funciones
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy create-server
```

## 5. Probar el Sistema

### 5.1 Flujo completo de prueba:

1. Ve a `precios.html`
2. Haz clic en "Contratar" en cualquier plan
3. Completa los 4 pasos del checkout
4. Serás redirigido a Stripe Checkout
5. Usa una tarjeta de prueba: `4242 4242 4242 4242`
6. Después del pago, serás redirigido a `success.html`
7. El webhook de Stripe creará el servidor automáticamente en Pterodactyl

### 5.2 Verificar que todo funciona:

1. **Verifica el pedido en Supabase:**
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
   ```

2. **Verifica el servidor en Pterodactyl:**
   - Panel Admin → Servers
   - Debería aparecer un servidor nuevo con el nombre del plan

3. **Verifica los logs de las Edge Functions:**
   - Supabase Dashboard → Edge Functions → Logs

## 6. Pasar a Producción

Cuando estés listo para producción:

1. **Stripe:**
   - Cambia a claves de producción (`pk_live_...` y `sk_live_...`)
   - Actualiza los webhooks con la URL de producción
   - Usa productos de producción (no test)

2. **Pterodactyl:**
   - Verifica que la API key tenga los permisos correctos
   - Configura los límites de recursos apropiados

3. **Variables de entorno:**
   - Actualiza todas las claves en Supabase Edge Functions

## 7. Soporte

Si algo no funciona:

1. Revisa los logs de Edge Functions en Supabase Dashboard
2. Verifica que las variables de entorno estén correctamente configuradas
3. Comprueba los webhooks de Stripe (Dashboard → Webhooks → Ver intentos)
4. Verifica los logs de Pterodactyl

## Notas Importantes

- Las claves públicas (anon key, publishable key) son seguras para incluir en el código
- Las claves secretas (service role, secret key, API key) NUNCA deben estar en el código del frontend
- El archivo `.env` está en `.gitignore` y no se subirá a GitHub
- Las Edge Functions manejan toda la lógica sensible del servidor
