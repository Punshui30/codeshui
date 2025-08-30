import React, { useState, useEffect } from 'react';
import { Server, Database, Globe, Play, Square, Settings, Plus, Trash2, Edit, Eye, Code, Terminal } from 'lucide-react';

interface BackendServer {
  id: string;
  name: string;
  port: number;
  framework: 'express' | 'fastify' | 'koa' | 'hono';
  status: 'stopped' | 'running' | 'error';
  endpoints: ApiEndpoint[];
  databases: DatabaseConnection[];
  createdAt: Date;
}

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  code: string;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'sqlite' | 'postgresql' | 'mongodb' | 'mysql';
  connectionString: string;
  status: 'connected' | 'disconnected' | 'error';
}

interface BackendManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddServer: (server: Omit<BackendServer, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateServer: (id: string, updates: Partial<BackendServer>) => void;
  onDeleteServer: (id: string) => void;
  servers: BackendServer[];
}

const frameworks = [
  { id: 'express', name: 'Express.js', description: 'Fast, unopinionated web framework' },
  { id: 'fastify', name: 'Fastify', description: 'Fast and low overhead web framework' },
  { id: 'koa', name: 'Koa.js', description: 'Next generation web framework' },
  { id: 'hono', name: 'Hono', description: 'Lightweight and ultrafast web framework' }
];

const databaseTypes = [
  { id: 'sqlite', name: 'SQLite', description: 'Lightweight file-based database' },
  { id: 'postgresql', name: 'PostgreSQL', description: 'Advanced open source database' },
  { id: 'mongodb', name: 'MongoDB', description: 'Document-based NoSQL database' },
  { id: 'mysql', name: 'MySQL', description: 'Popular open source database' }
];

export function BackendManager({ 
  isOpen, 
  onClose, 
  onAddServer, 
  onUpdateServer, 
  onDeleteServer,
  servers 
}: BackendManagerProps) {
  const [selectedServer, setSelectedServer] = useState<BackendServer | null>(null);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showServerDetails, setShowServerDetails] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    port: 3000,
    framework: 'express' as const,
    endpoints: [],
    databases: []
  });

  const [newEndpoint, setNewEndpoint] = useState({
    method: 'GET' as const,
    path: '',
    description: '',
    code: ''
  });

  const [newDatabase, setNewDatabase] = useState({
    name: '',
    type: 'sqlite' as const,
    connectionString: ''
  });

  const handleCreateServer = () => {
    if (newServer.name.trim()) {
      onAddServer(newServer);
      setNewServer({ name: '', port: 3000, framework: 'express', endpoints: [], databases: [] });
      setShowCreateServer(false);
    }
  };

  const handleAddEndpoint = () => {
    if (newEndpoint.path.trim() && selectedServer) {
      const endpoint: ApiEndpoint = {
        id: Date.now().toString(),
        ...newEndpoint
      };
      onUpdateServer(selectedServer.id, {
        endpoints: [...selectedServer.endpoints, endpoint]
      });
      setNewEndpoint({ method: 'GET', path: '', description: '', code: '' });
    }
  };

  const handleAddDatabase = () => {
    if (newDatabase.name.trim() && selectedServer) {
      const database: DatabaseConnection = {
        id: Date.now().toString(),
        ...newDatabase,
        status: 'disconnected'
      };
      onUpdateServer(selectedServer.id, {
        databases: [...selectedServer.databases, database]
      });
      setNewDatabase({ name: '', type: 'sqlite', connectionString: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-3 h-3" />;
      case 'error': return <Square className="w-3 h-3" />;
      default: return <Square className="w-3 h-3" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Backend Manager</h2>
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
              {servers.length} servers
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateServer(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Server
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Servers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {servers.map(server => (
              <div
                key={server.id}
                className="bg-gray-700 rounded-lg border border-gray-600 p-4 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => {
                  setSelectedServer(server);
                  setShowServerDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{server.name}</h3>
                    <p className="text-sm text-gray-400">Port {server.port}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${getStatusColor(server.status)}`}>
                    {getStatusIcon(server.status)}
                    {server.status}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  <div>Framework: {frameworks.find(f => f.id === server.framework)?.name}</div>
                  <div>Endpoints: {server.endpoints.length}</div>
                  <div>Databases: {server.databases.length}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateServer(server.id, { status: server.status === 'running' ? 'stopped' : 'running' });
                    }}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2 ${
                      server.status === 'running' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {server.status === 'running' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {server.status === 'running' ? 'Stop' : 'Start'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteServer(server.id);
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Create Server Modal */}
          {showCreateServer && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
              <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Create New Backend Server</h3>
                  <button
                    onClick={() => setShowCreateServer(false)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Server Name</label>
                    <input
                      type="text"
                      value={newServer.name}
                      onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="My API Server"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Port</label>
                    <input
                      type="number"
                      value={newServer.port}
                      onChange={(e) => setNewServer(prev => ({ ...prev, port: parseInt(e.target.value) || 3000 }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      min="1024"
                      max="65535"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Framework</label>
                    <select
                      value={newServer.framework}
                      onChange={(e) => setNewServer(prev => ({ ...prev, framework: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      {frameworks.map(framework => (
                        <option key={framework.id} value={framework.id}>
                          {framework.name} - {framework.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateServer}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create Server
                    </button>
                    <button
                      onClick={() => setShowCreateServer(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Server Details Modal */}
          {showServerDetails && selectedServer && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
              <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Server: {selectedServer.name}</h3>
                  <button
                    onClick={() => setShowServerDetails(false)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Endpoints Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        API Endpoints
                      </h4>
                      <button
                        onClick={() => setNewEndpoint({ method: 'GET', path: '', description: '', code: '' })}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Endpoint
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedServer.endpoints.map(endpoint => (
                        <div key={endpoint.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                endpoint.method === 'GET' ? 'bg-green-600' :
                                endpoint.method === 'POST' ? 'bg-blue-600' :
                                endpoint.method === 'PUT' ? 'bg-yellow-600' :
                                endpoint.method === 'DELETE' ? 'bg-red-600' :
                                'bg-gray-600'
                              }`}>
                                {endpoint.method}
                              </span>
                              <span className="text-white font-mono">{endpoint.path}</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors">
                                <Edit className="w-3 h-3" />
                              </button>
                              <button className="p-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{endpoint.description}</p>
                          <div className="bg-gray-900 rounded p-2">
                            <pre className="text-xs text-gray-300">{endpoint.code}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Databases Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Database Connections
                      </h4>
                      <button
                        onClick={() => setNewDatabase({ name: '', type: 'sqlite', connectionString: '' })}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Database
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedServer.databases.map(database => (
                        <div key={database.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-white">{database.name}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(database.status)}`}>
                              {database.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{databaseTypes.find(d => d.id === database.type)?.name}</p>
                          <p className="text-xs text-gray-500 font-mono break-all">{database.connectionString}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
