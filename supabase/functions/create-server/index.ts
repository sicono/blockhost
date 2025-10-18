import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const PTERODACTYL_URL = 'https://panel.blockhost.es';
const PTERODACTYL_API_KEY = Deno.env.get('PTERODACTYL_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ServerConfig {
  name: string;
  user_id: number;
  egg_id: number;
  docker_image: string;
  startup: string;
  environment: Record<string, string>;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
  };
  feature_limits: {
    databases: number;
    backups: number;
    allocations: number;
  };
  allocation: {
    default: number;
  };
}

const SOFTWARE_TO_EGG: Record<string, { egg_id: number; docker_image: string; startup: string }> = {
  'Vanilla': {
    egg_id: 1,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'
  },
  'Paper': {
    egg_id: 3,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'
  },
  'Spigot': {
    egg_id: 2,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'
  },
  'Fabric': {
    egg_id: 4,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'
  },
  'Forge': {
    egg_id: 5,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'
  },
  'Sponge': {
    egg_id: 6,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'
  },
  'Archlight': {
    egg_id: 7,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'
  },
  'Pocketmine': {
    egg_id: 8,
    docker_image: 'ghcr.io/pterodactyl/yolks:php_8.1',
    startup: './bin/php7/bin/php ./PocketMine-MP.phar'
  },
  'Nukkit': {
    egg_id: 9,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar nukkit.jar'
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('payment_status', 'completed')
      .maybeSingle();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or not paid' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (order.pterodactyl_server_id) {
      return new Response(
        JSON.stringify({
          error: 'Server already created',
          server_id: order.pterodactyl_server_id
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const softwareConfig = SOFTWARE_TO_EGG[order.software];
    if (!softwareConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid software type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const memoryMB = order.ram_gb * 1024;

    const serverConfig: ServerConfig = {
      name: `${order.plan_name} - ${order.email}`,
      user_id: 1,
      egg_id: softwareConfig.egg_id,
      docker_image: softwareConfig.docker_image,
      startup: softwareConfig.startup,
      environment: {
        SERVER_JARFILE: 'server.jar',
        MC_VERSION: order.version === 'Java' ? 'latest' : 'bedrock',
      },
      limits: {
        memory: memoryMB,
        swap: 0,
        disk: order.storage_gb * 1024,
        io: 500,
        cpu: 100,
      },
      feature_limits: {
        databases: 1,
        backups: 2,
        allocations: 1,
      },
      allocation: {
        default: 1,
      },
    };

    const pterodactylResponse = await fetch(
      `${PTERODACTYL_URL}/api/application/servers`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        },
        body: JSON.stringify(serverConfig),
      }
    );

    if (!pterodactylResponse.ok) {
      const errorText = await pterodactylResponse.text();
      console.error('Pterodactyl API error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to create server in Pterodactyl',
          details: errorText
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const serverData = await pterodactylResponse.json();

    await supabase
      .from('orders')
      .update({
        pterodactyl_server_id: serverData.attributes.id,
        pterodactyl_identifier: serverData.attributes.identifier,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    return new Response(
      JSON.stringify({
        success: true,
        server: serverData.attributes,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating server:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
