import React, { useState, useEffect } from 'react';
import {
  Plus,
  Settings,
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Cloud,
  Archive,
  Database,
  Cpu,
} from 'lucide-react';
import {
  getAvailableAzureServices,
  getServiceOptions,
  createAzureNode,
  validateAzureConfig,
  estimateCost,
  getDeploymentTemplate,
} from '../../lib/azureInfrastructureApi';

/**
 * Azure Infrastructure Management Panel
 * Create and configure Azure deployment components
 */
export default function AzureInfrastructurePanel({ onNodeCreated, onTemplateLoaded }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceOptions, setServiceOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [templates, setTemplates] = useState([]);

  // Configuration form state
  const [config, setConfig] = useState({});
  const [validation, setValidation] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAvailableAzureServices();
      setServices(result.services || []);

      // Define templates
      setTemplates([
        {
          id: 'simple-web-app',
          name: 'Simple Web App',
          description: 'Frontend + Backend + Database',
          icon: '🌐',
        },
        {
          id: 'microservices',
          name: 'Microservices',
          description: 'Distributed services architecture',
          icon: '🔗',
        },
        {
          id: 'ai-enabled-app',
          name: 'AI-Enabled App',
          description: 'App with Azure OpenAI integration',
          icon: '🤖',
        },
        {
          id: 'global-scale-app',
          name: 'Global Scale App',
          description: 'Multi-region deployment',
          icon: '🌍',
        },
      ]);
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load Azure services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = async (service) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedService(service);
      setConfig({});
      setCostEstimate(null);
      setValidation(null);

      // Load service options
      const options = await getServiceOptions(service.type);
      setServiceOptions(options.service || options);
    } catch (err) {
      setError(`Failed to load service options: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleValidate = async () => {
    try {
      setLoading(true);
      const result = await validateAzureConfig(selectedService.type, config);
      setValidation(result);

      if (result.valid) {
        // Get cost estimate if valid
        const costResult = await estimateCost(selectedService.type, config);
        setCostEstimate(costResult.costEstimate);
      }
    } catch (err) {
      setError(`Validation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNode = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate first
      const result = await validateAzureConfig(selectedService.type, config);
      if (!result.valid) {
        setError(`Configuration invalid: ${result.errors.join(', ')}`);
        setLoading(false);
        return;
      }

      // Create node
      const nodeResult = await createAzureNode(selectedService.type, config);
      setSuccess(true);

      if (onNodeCreated) {
        onNodeCreated(nodeResult.node);
      }

      // Reset form
      setTimeout(() => {
        setSuccess(false);
        setSelectedService(null);
        setConfig({});
        setValidation(null);
        setCostEstimate(null);
      }, 2000);
    } catch (err) {
      setError(`Failed to create node: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTemplate = async (templateId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getDeploymentTemplate(templateId);

      if (onTemplateLoaded) {
        onTemplateLoaded(result.template);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(`Failed to load template: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'COMPUTE':
        return <Cpu className="w-4 h-4" />;
      case 'DATABASE':
        return <Database className="w-4 h-4" />;
      case 'AI':
        return <Zap className="w-4 h-4" />;
      case 'STORAGE':
        return <Archive className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-700 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
        <div className="absolute inset-0 opacity-10 blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full"></div>
        </div>
        <div className="relative flex items-center gap-3">
          <Cloud className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="font-bold text-base">Azure Infrastructure</h2>
            <p className="text-xs text-slate-300">Design cloud deployment architecture</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-700 bg-slate-800/50">
        <button
          onClick={() => {
            setActiveTab('services');
            setSelectedService(null);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'services'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-300">Error</p>
                <p className="text-sm text-red-200/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300">Success</p>
                <p className="text-sm text-green-200/80 mt-1">
                  {activeTab === 'services' ? 'Node created successfully' : 'Template loaded successfully'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {!selectedService ? (
              <div className="space-y-2">
                {loading && !services.length ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-200">Available Services</p>
                    <div className="grid gap-2">
                      {services.map(service => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceSelect(service)}
                          className="p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-left transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{service.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-100">{service.label}</h3>
                              <p className="text-xs text-slate-400 mt-1">{service.description}</p>
                              <div className="flex gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-600/50 rounded text-slate-300">
                                  {getCategoryIcon(service.category)}
                                  {service.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Service Configuration */}
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                  <h3 className="font-medium text-slate-100 mb-4">
                    {selectedService.label} Configuration
                  </h3>

                  {serviceOptions && (
                    <div className="space-y-4">
                      {/* Region Selection */}
                      {serviceOptions.options.regions && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Region
                          </label>
                          <select
                            value={config.region || ''}
                            onChange={e => handleConfigChange('region', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Region</option>
                            {serviceOptions.options.regions.map(region => (
                              <option key={region} value={region}>
                                {region}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Tier Selection */}
                      {serviceOptions.options.tiers && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Service Tier
                          </label>
                          <select
                            value={config.tier || ''}
                            onChange={e => handleConfigChange('tier', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Tier</option>
                            {serviceOptions.options.tiers.map(tier => (
                              <option key={tier} value={tier}>
                                {tier}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Runtime Selection (App Service) */}
                      {serviceOptions.options.runtimes && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Runtime
                          </label>
                          <select
                            value={config.runtime || ''}
                            onChange={e => handleConfigChange('runtime', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Runtime</option>
                            {serviceOptions.options.runtimes.map(runtime => (
                              <option key={runtime} value={runtime}>
                                {runtime}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* API Selection (Cosmos DB) */}
                      {serviceOptions.options.apis && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            API Type
                          </label>
                          <select
                            value={config.api || ''}
                            onChange={e => handleConfigChange('api', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select API</option>
                            {serviceOptions.options.apis.map(api => (
                              <option key={api} value={api}>
                                {api}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Throughput (Cosmos DB) */}
                      {selectedService.type.includes('CosmosDB') && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Throughput (RU/s)
                          </label>
                          <input
                            type="number"
                            min="400"
                            max="1000000"
                            step="100"
                            value={config.throughput || 400}
                            onChange={e => handleConfigChange('throughput', parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-slate-400 mt-1">400 - 1,000,000 RU/s</p>
                        </div>
                      )}

                      {/* Instances (App Service) */}
                      {selectedService.type.includes('AppService') && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Instances
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={config.instances || 1}
                            onChange={e => handleConfigChange('instances', parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Quota Tokens (OpenAI) */}
                      {selectedService.type.includes('OpenAI') && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Token Quota (per minute)
                          </label>
                          <input
                            type="number"
                            min="1000"
                            step="1000"
                            value={config.quotaTokens || 240000}
                            onChange={e => handleConfigChange('quotaTokens', parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cost Estimate */}
                {costEstimate && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-300">Cost Estimate</p>
                        <p className="text-sm text-emerald-200/80 mt-1">
                          ${costEstimate.estimate} {costEstimate.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {validation && !validation.valid && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm font-medium text-red-300 mb-2">Configuration Issues:</p>
                    <ul className="text-xs text-red-200/80 space-y-1">
                      {validation.errors.map((err, idx) => (
                        <li key={idx}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setConfig({});
                      setValidation(null);
                      setCostEstimate(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-sm"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleValidate}
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        Validate & Estimate
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCreateNode}
                    disabled={loading || !validation?.valid}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:opacity-50 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Node
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-2">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template.id)}
                disabled={loading}
                className="w-full p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-100">{template.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{template.description}</p>
                  </div>
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0 mt-1" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 p-3 bg-slate-900/50 text-xs text-slate-400">
        <p>💡 Create nodes individually or load predefined templates for common architectures</p>
      </div>
    </div>
  );
}
