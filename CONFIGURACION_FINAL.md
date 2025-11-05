# BlockHost - Guía de Configuración Final

## 1. Variables de Entorno en Supabase

Configura las siguientes variables en **Supabase Dashboard → Settings → Edge Functions → Environment Variables**:

```bash
PTERODACTYL_API_KEY=ptla_pkSPMpVRIWiWaE0hf4vMLfbWwm5AglPu58rzejxDhNq
```

## 2. Flujo de Pago Completamente Automatizado

### El proceso funciona así:

1. **Usuario completa el checkout:**
   - Selecciona versión (Java/Bedrock)
   - Selecciona software (Vanilla, Paper, etc.)
   - Selecciona región (Canadá o Europa - ambas activas)
   - Configura IP personalizada (opcional)
   - Ingresa su email

2. **Se crea una orden "pendiente" en la base de datos** con todos los detalles

3. **Usuario hace clic en "Pagar con Stripe"** y es redirigido al link de pago del plan

4. **Después de pagar en Stripe:**
   - Stripe redirige al usuario a `success.html`
   - El webhook de Stripe procesa automáticamente el pago
   - Se marca la orden como "completed" en la base de datos
   - Se llama automáticamente a la Edge Function `create-server`

5. **La Edge Function `create-server`:**
   - Obtiene los datos de la orden
   - Se conecta a Pterodactyl con la API key
   - Crea el servidor con:
     - RAM del plan seleccionado
     - Almacenamiento del plan seleccionado
     - Software/núcleo seleccionado
     - Configuración automática
   - Guarda el ID del servidor en la orden
   - Marca la orden como "active"

6. **Usuario recibe su servidor automáticamente** en su panel de Pterodactyl

## 3. Configuración de Regiones en Pterodactyl

El código está configurado para enviar servidores a `user_id: 1` y `allocation: 1`.

**IMPORTANTE:** Verifica estos valores en tu panel de Pterodactyl:
- `user_id: 1` debe ser el usuario propietario de los servidores
- `allocation: 1` debe ser una asignación de puerto válida

Si necesitas cambiar estos valores, edita `supabase/functions/create-server/index.ts`:
```typescript
const serverConfig: ServerConfig = {
  // ...
  user_id: 1,  // ← Cambia aquí si es necesario
  allocation: {
    default: 1,  // ← Y aquí
  },
};
```

## 4. Verificar que Todo Funcione

### Probar el flujo completo:

1. Ve a `precios.html`
2. Haz clic en "Contratar" en cualquier plan
3. Completa los 5 pasos del checkout
4. Haz clic en "Pagar con Stripe"
5. En la página de Stripe, usa tarjeta de prueba: `4242 4242 4242 4242`
6. Después de pagar, serás redirigido a `success.html`

### Verificar en la base de datos:

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
```

Deberías ver:
- `payment_status: 'completed'`
- `pterodactyl_server_id: <número>`
- `pterodactyl_identifier: <código>`
- `status: 'active'`

### Verificar en Pterodactyl:

- Panel Admin → Servers
- Deberías ver un servidor nuevo con el nombre: `[Plan] - [email del usuario]`
- Con la RAM y almacenamiento especificados

### Ver los logs de la Edge Function:

- Supabase Dashboard → Edge Functions → `create-server` → Logs
- Deberías ver información de la creación del servidor

## 5. Configurar Webhook de Stripe (Si aún no está configurado)

Si el webhook no está configurado:

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Haz clic en "Add endpoint"
3. URL: `https://nthbvwoclvifyqoftfje.supabase.co/functions/v1/stripe-webhook`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copia el **Signing Secret** (comienza con `whsec_`)
6. En Supabase, añade como variable de entorno: `STRIPE_WEBHOOK_SECRET`

## 6. Desplegar la Edge Function

Si hiciste cambios en `create-server/index.ts`:

```bash
supabase functions deploy create-server
```

## 7. Características Implementadas

✅ Checkout multi-paso (5 pasos)
✅ Selección de versión (Java/Bedrock)
✅ Selección de software (9 opciones)
✅ Selección de región (Canadá y Europa - ambas activas)
✅ IP personalizada (opcional)
✅ Multi-moneda (EUR, USD, PEN, MXN, COP, ARS, VES, BOB)
✅ Pago con Stripe (links directos por plan)
✅ Creación automática de servidor en Pterodactyl
✅ Asignación automática de RAM y almacenamiento
✅ Base de datos Supabase para tracking completo
✅ Webhook para automatizar todo el proceso

## 8. Troubleshooting

**El servidor no se crea después de pagar:**
- Verifica los logs de la Edge Function en Supabase
- Verifica que `PTERODACTYL_API_KEY` esté configurada correctamente
- Verifica que `user_id: 1` existe en Pterodactyl
- Verifica que `allocation: 1` es válida

**El webhook no se procesa:**
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurada
- Ve a Stripe Dashboard → Webhooks → Ver intentos
- Verifica los logs de la Edge Function `stripe-webhook`

**La orden no se crea:**
- Verifica que la tabla `orders` existe en Supabase
- Verifica que las columnas tienen los nombres correctos

## 9. En Producción

Cuando pases a producción:
- Cambia los links de Stripe a los de producción
- Cambia `PTERODACTYL_API_KEY` a la key de producción
- Actualiza `STRIPE_WEBHOOK_SECRET` a la de producción
- Verifica que todos los egg IDs sean correctos en tu instalación de Pterodactyl
