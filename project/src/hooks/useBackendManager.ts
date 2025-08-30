import { useState, useCallback } from 'react';

export interface BackendServer {
  id: string;
  name: string;
  port: number;
  framework: 'express' | 'fastify' | 'koa' | 'hono';
  status: 'stopped' | 'running' | 'error';
  endpoints: ApiEndpoint[];
  databases: DatabaseConnection[];
  createdAt: Date;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  code: string;
}

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'sqlite' | 'postgresql' | 'mongodb' | 'mysql';
  connectionString: string;
  status: 'connected' | 'disconnected' | 'error';
}

export function useBackendManager() {
  const [servers, setServers] = useState<BackendServer[]>([]);

  const addServer = useCallback((server: Omit<BackendServer, 'id' | 'status' | 'createdAt'>) => {
    const newServer: BackendServer = {
      ...server,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      status: 'stopped',
      createdAt: new Date()
    };
    
    setServers(prev => [...prev, newServer]);
    return newServer;
  }, []);

  const updateServer = useCallback((id: string, updates: Partial<BackendServer>) => {
    setServers(prev => prev.map(server => 
      server.id === id ? { ...server, ...updates } : server
    ));
  }, []);

  const deleteServer = useCallback((id: string) => {
    setServers(prev => prev.filter(server => server.id !== id));
  }, []);

  const startServer = useCallback(async (id: string) => {
    const server = servers.find(s => s.id === id);
    if (!server) return;

    try {
      // Simulate server startup
      updateServer(id, { status: 'running' });
      
      // In a real implementation, this would:
      // 1. Generate server code based on framework
      // 2. Create package.json with dependencies
      // 3. Install dependencies
      // 4. Start the server process
      
      console.log(`Starting ${server.framework} server on port ${server.port}`);
    } catch (error) {
      updateServer(id, { status: 'error' });
      console.error('Failed to start server:', error);
    }
  }, [servers, updateServer]);

  const stopServer = useCallback(async (id: string) => {
    try {
      // Simulate server shutdown
      updateServer(id, { status: 'stopped' });
      
      // In a real implementation, this would:
      // 1. Send shutdown signal to server process
      // 2. Clean up resources
      
      console.log('Server stopped');
    } catch (error) {
      console.error('Failed to stop server:', error);
    }
  }, [updateServer]);

  const addEndpoint = useCallback((serverId: string, endpoint: Omit<ApiEndpoint, 'id'>) => {
    const newEndpoint: ApiEndpoint = {
      ...endpoint,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
    };
    
    updateServer(serverId, {
      endpoints: [...(servers.find(s => s.id === serverId)?.endpoints || []), newEndpoint]
    });
  }, [servers, updateServer]);

  const updateEndpoint = useCallback((serverId: string, endpointId: string, updates: Partial<ApiEndpoint>) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    const updatedEndpoints = server.endpoints.map(endpoint =>
      endpoint.id === endpointId ? { ...endpoint, ...updates } : endpoint
    );
    
    updateServer(serverId, { endpoints: updatedEndpoints });
  }, [servers, updateServer]);

  const deleteEndpoint = useCallback((serverId: string, endpointId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    const updatedEndpoints = server.endpoints.filter(endpoint => endpoint.id !== endpointId);
    updateServer(serverId, { endpoints: updatedEndpoints });
  }, [servers, updateServer]);

  const addDatabase = useCallback((serverId: string, database: Omit<DatabaseConnection, 'id' | 'status'>) => {
    const newDatabase: DatabaseConnection = {
      ...database,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      status: 'disconnected'
    };
    
    updateServer(serverId, {
      databases: [...(servers.find(s => s.id === serverId)?.databases || []), newDatabase]
    });
  }, [servers, updateServer]);

  const updateDatabase = useCallback((serverId: string, databaseId: string, updates: Partial<DatabaseConnection>) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    const updatedDatabases = server.databases.map(database =>
      database.id === databaseId ? { ...database, ...updates } : database
    );
    
    updateServer(serverId, { databases: updatedDatabases });
  }, [servers, updateServer]);

  const deleteDatabase = useCallback((serverId: string, databaseId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    const updatedDatabases = server.databases.filter(database => database.id !== databaseId);
    updateServer(serverId, { databases: updatedDatabases });
  }, [servers, updateServer]);

  const testDatabaseConnection = useCallback(async (serverId: string, databaseId: string) => {
    const server = servers.find(s => s.id === serverId);
    const database = server?.databases.find(d => d.id === databaseId);
    if (!database) return;

    try {
      // Simulate database connection test
      updateDatabase(serverId, databaseId, { status: 'connected' });
      
      // In a real implementation, this would:
      // 1. Parse connection string
      // 2. Attempt to connect to database
      // 3. Run a simple query to verify connection
      
      console.log(`Testing connection to ${database.type} database: ${database.name}`);
    } catch (error) {
      updateDatabase(serverId, databaseId, { status: 'error' });
      console.error('Database connection failed:', error);
    }
  }, [servers, updateDatabase]);

  const generateServerCode = useCallback((server: BackendServer) => {
    const framework = server.framework;
    const port = server.port;
    
    switch (framework) {
      case 'express':
        return generateExpressServer(server);
      case 'fastify':
        return generateFastifyServer(server);
      case 'koa':
        return generateKoaServer(server);
      case 'hono':
        return generateHonoServer(server);
      default:
        return generateExpressServer(server);
    }
  }, []);

  const generatePackageJson = useCallback((server: BackendServer) => {
    const dependencies: Record<string, string> = {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "helmet": "^7.1.0"
    };

    // Add framework-specific dependencies
    switch (server.framework) {
      case 'fastify':
        dependencies.fastify = "^4.24.3";
        break;
      case 'koa':
        dependencies.koa = "^2.14.2";
        dependencies["@koa/router"] = "^12.0.1";
        break;
      case 'hono':
        dependencies.hono = "^3.11.7";
        break;
    }

    // Add database dependencies based on configured databases
    server.databases.forEach(db => {
      switch (db.type) {
        case 'sqlite':
          dependencies.sqlite3 = "^5.1.6";
          break;
        case 'postgresql':
          dependencies.pg = "^8.11.3";
          break;
        case 'mongodb':
          dependencies.mongodb = "^6.3.0";
          break;
        case 'mysql':
          dependencies.mysql2 = "^3.6.5";
          break;
      }
    });

    return {
      name: server.name.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      description: `${server.name} - ${server.framework} backend server`,
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "nodemon server.js"
      },
      dependencies,
      devDependencies: {
        nodemon: "^3.0.2"
      }
    };
  }, []);

  return {
    servers,
    addServer,
    updateServer,
    deleteServer,
    startServer,
    stopServer,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
    addDatabase,
    updateDatabase,
    deleteDatabase,
    testDatabaseConnection,
    generateServerCode,
    generatePackageJson
  };
}

// Server code generators
function generateExpressServer(server: BackendServer): string {
  return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = ${server.port};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
${server.endpoints.map(endpoint => `
app.${endpoint.method.toLowerCase()}('${endpoint.path}', (req, res) => {
  ${endpoint.code}
});`).join('\n')}

// Start server
app.listen(PORT, () => {
  console.log(\`${server.name} server running on port \${PORT}\`);
});`;
}

function generateFastifyServer(server: BackendServer): string {
  return `const fastify = require('fastify')();

// Register plugins
fastify.register(require('@fastify/cors'));
fastify.register(require('@fastify/helmet'));

// Routes
${server.endpoints.map(endpoint => `
fastify.${endpoint.method.toLowerCase()}('${endpoint.path}', async (request, reply) => {
  ${endpoint.code}
});`).join('\n')}

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: ${server.port} });
    console.log(\`${server.name} server running on port ${server.port}\`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();`;
}

function generateKoaServer(server: BackendServer): string {
  return `const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');

const app = new Koa();
const router = new Router();

// Middleware
app.use(helmet());
app.use(cors());

// Routes
${server.endpoints.map(endpoint => `
router.${endpoint.method.toLowerCase()}('${endpoint.path}', async (ctx) => {
  ${endpoint.code}
});`).join('\n')}

app.use(router.routes());
app.use(router.allowedMethods());

// Start server
app.listen(${server.port}, () => {
  console.log(\`${server.name} server running on port ${server.port}\`);
});`;
}

function generateHonoServer(server: BackendServer): string {
  return `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
${server.endpoints.map(endpoint => `
app.${endpoint.method.toLowerCase()}('${endpoint.path}', (c) => {
  ${endpoint.code}
});`).join('\n')}

// Start server
export default {
  port: ${server.port},
  fetch: app.fetch,
};`;
}
