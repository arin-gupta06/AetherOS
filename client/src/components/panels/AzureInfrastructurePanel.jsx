/**
 * Azure Infrastructure Management Panel
 * Create and configure Azure deployment components, AetherOS styled
 */

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
        return <Cpu className="w-3 h-3" />;
      case 'DATABASE':
        return <Database className="w-3 h-3" />;
      case 'AI':
        return <Zap className="w-3 h-3" />;
      case 'STORAGE':
        return <Archive className="w-3 h-3" />;
      default:
        return <Cloud className="w-3 h-3" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-aether-muted mb-2 flex items-center gap-1.5">
        <Cloud size={14} className="text-blue-400" />
        Azure Infrastructure
      </h3>
      <p className="text-[11px] text-aether-muted mb-4">
        Design and configure cloud deployment architecture
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setActiveTab('services');
            setSelectedService(null);
          }}
          className={`flex-1 flex items-center justify-center capitalize px-2 py-1.5 rounded text-[10px] font-medium transition ${
            activeTab === 'services'
              ? 'bg-aether-accent text-white'
              : 'bg-aether-bg border border-aether-border text-aether-text hover:border-aether-accent/50'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 flex items-center justify-center capitalize px-2 py-1.5 rounded text-[10px] font-medium transition ${
            activeTab === 'templates'
              ? 'bg-aether-accent text-white'
              : 'bg-aether-bg border border-aether-border text-aether-text hover:border-aether-accent/50'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Error State */}
        {error && (
          <div className="p-3 bg-aether-danger/10 border border-aether-danger/30 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-aether-danger flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-aether-danger/90">{error}</div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="p-3 bg-aether-success/10 border border-aether-success/30 rounded-lg flex gap-2">
            <CheckCircle className="w-4 h-4 text-aether-success flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-aether-success/90">
              {activeTab === 'services' ? 'Node created successfully' : 'Template loaded successfully'}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {!selectedService ? (
              <div className="space-y-2">
                {loading && !services.length ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-aether-accent" />
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] uppercase font-semibold text-aether-muted mb-2 tracking-wider">Available Services</p>
                    <div className="space-y-2">
                      {services.map(service => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceSelect(service)}
                          className="w-full p-3 rounded-lg bg-aether-bg border border-aether-border text-left hover:border-aether-accent/50 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">{service.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-[11px] text-aether-text">{service.label}</h3>
                              <p className="text-[10px] text-aether-muted mt-1 leading-relaxed line-clamp-2">{service.description}</p>
                              <div className="flex gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 bg-aether-bg/80 border border-aether-border rounded text-aether-muted">
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
              <div className="space-y-3">
                {/* Service Configuration */}
                <div className="p-3 rounded-lg bg-aether-bg border border-aether-border">
                  <h3 className="font-medium text-xs text-aether-text mb-3">
                    {selectedService.label} Config
                  </h3>

                  {serviceOptions && (
                    <div className="space-y-3">
                      {/* Region Selection */}
                      {serviceOptions.options.regions && (
                        <div>
                          <label className="block text-[10px] font-semibold text-aether-muted mb-1.5 uppercase tracking-wider">
                            Region
                          </label>
                          <select
                            value={config.region || ''}
                            onChange={e => handleConfigChange('region', e.target.value)}
                            className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs text-aether-text outline-none focus:border-aether-accent transition"
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
                          <label className="block text-[10px] font-semibold text-aether-muted mb-1.5 uppercase tracking-wider">
                            Service Tier
                          </label>
                          <select
                            value={config.tier || ''}
                            onChange={e => handleConfigChange('tier', e.target.value)}
                            className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs text-aether-text outline-none focus:border-aether-accent transition"
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
                          <label className="block text-[10px] font-semibold text-aether-muted mb-1.5 uppercase tracking-wider">
                            Runtime
                          </label>
                          <select
                            value={config.runtime || ''}
                            onChange={e => handleConfigChange('runtime', e.target.value)}
                            className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs text-aether-text outline-none focus:border-aether-accent transition"
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
                          <label className="block text-[10px] font-semibold text-aether-muted mb-1.5 uppercase tracking-wider">
                            API Type
                          </label>
                          <select
                            value={config.api || ''}
                            onChange={e => handleConfigChange('api', e.target.value)}
                            className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs text-aether-text outline-none focus:border-aether-accent transition"
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
                          <label className="block text-[10px] font-semibold text-aether-muted mb-1.5 uppercase tracking-wider">
                            Throughput (RU/s)
                          </label>
                          <input
                            type="number"
                            min="400"
                            max="1000000"
                            step="100"
                            value={config.throughput || 400}
                            onChange={e => handleConfigChange('throughput', parseInt(e.target.value))}
                            className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs text-aether-text outline-none focus:border-aether-accent transition font-mono"
                          />
                          <p className="text-[9px] text-aether-muted mt-1">400 - 1,000,000 RU/s</p>
                        </div>
                      )}

                      {/* Instances (App Service) */}
                      {selectedService.type.includes('AppService') && (
                        <div>
                          <label className="block text-[10px] font-semibold text-aether-muted mb-1.5 uppercase tracking-wider">
                            Instances
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={config.instances || 1}
                            onChange={e => handleConfigChange('instances', parseInt(e.target.value))}
                            className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs text-aether-text outline-none focus:border-aether-accent transition font-mono"
                          />
                        </div>
                      )}

                      {/* Quota Tokens (OpenAI) */}
                      {selectedService.type.includes('OpenAI') && (
                        <div>
                          <label className="block text-[10px] font-semibold text-aether-muted mb-1.5 uppercase tracking-wider">
                            Token Quota (per min)
                          </label>
                          <input
                            type="number"
                            min="1000"
                            step="1000"
                            value={config.quotaTokens || 240000}
                            onChange={e => handleConfigChange('quotaTokens', parseInt(e.target.value))}
                            className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs text-aether-text outline-none focus:border-aether-accent transition font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cost Estimate */}
                {costEstimate && (
                  <div className="p-3 rounded-lg bg-aether-success/10 border border-aether-success/30 flex gap-2">
                    <DollarSign className="w-4 h-4 text-aether-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-aether-success/80">Est. Cost</p>
                      <p className="text-sm font-semibold text-aether-success">
                        ${costEstimate.estimate} {costEstimate.currency}
                      </p>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {validation && !validation.valid && (
                  <div className="p-3 rounded-lg bg-aether-danger/10 border border-aether-danger/30">
                    <p className="text-[10px] font-semibold text-aether-danger mb-1 uppercase">Issues</p>
                    <ul className="text-[10px] text-aether-danger/90 space-y-1">
                      {validation.errors.map((err, idx) => (
                        <li key={idx} className="leading-relaxed">• {err}</li>
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
                    className="flex-[0.8] py-2 rounded bg-aether-bg border border-aether-border text-aether-muted text-[11px] font-medium hover:text-aether-text hover:border-aether-accent/50 transition-colors"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleValidate}
                    disabled={loading}
                    className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded bg-aether-accent/20 text-aether-accent text-[11px] font-medium hover:bg-aether-accent/30 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Settings className="w-3 h-3" />
                    )}
                    Validate
                  </button>

                  <button
                    onClick={handleCreateNode}
                    disabled={loading || !validation?.valid}
                    className="flex-[1.2] py-2 flex items-center justify-center gap-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-aether-border disabled:text-aether-muted text-white text-[11px] font-medium transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    Create
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
                className="w-full p-3 rounded-lg bg-aether-bg hover:bg-aether-border/50 border border-aether-border text-left transition-all disabled:opacity-50 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[11px] text-aether-text">{template.name}</h3>
                    <p className="text-[10px] text-aether-muted mt-1 leading-relaxed">{template.description}</p>
                  </div>
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-aether-accent animate-spin flex-shrink-0 mt-1" />
                  ) : (
                    <Plus className="w-4 h-4 text-aether-muted group-hover:text-aether-accent flex-shrink-0 mt-1 transition-colors" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-aether-border flex gap-2 text-[10px] text-aether-muted">
        <span className="text-[#3b82f6]">💡</span>
        Create nodes individually or load predefined templates for common architectures.
      </div>
    </div>
  );
}
