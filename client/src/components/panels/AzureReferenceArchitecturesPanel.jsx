/**
 * Azure Reference Architectures Panel
 * UI component for browsing and importing Azure reference architectures
 */

import React, { useState, useEffect } from 'react';
import { Building2, AlertCircle, Loader } from 'lucide-react';
import { getAzureReferenceArchitectures, getAzureReferenceArchitecture } from '../lib/azureApi';

export default function AzureReferenceArchitecturesPanel({ onImportArchitecture }) {
  const [architectures, setArchitectures] = useState([]);
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArchitectures();
  }, []);

  const loadArchitectures = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAzureReferenceArchitectures();
      if (result.architectures) {
        const archs = Object.entries(result.architectures).map(([id, arch]) => ({
          id,
          ...arch,
        }));
        setArchitectures(archs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArchitecture = async (id) => {
    try {
      const result = await getAzureReferenceArchitecture(id);
      setSelectedArchitecture(result.architecture);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImport = () => {
    if (selectedArchitecture && onImportArchitecture) {
      onImportArchitecture({
        nodes: selectedArchitecture.nodes,
        edges: selectedArchitecture.edges,
        name: selectedArchitecture.name,
        description: selectedArchitecture.description,
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Enterprise: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      Standard: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      StartUp: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    };
    return colors[category] || colors.Standard;
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      Medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[complexity] || colors.Medium;
  };

  return (
    <div className="w-full h-full flex gap-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* List Panel */}
      <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-azure-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Reference Architectures
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Pre-built Azure patterns and templates
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader className="w-5 h-5 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400 flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {!loading &&
            architectures.map((arch) => (
              <button
                key={arch.id}
                onClick={() => handleSelectArchitecture(arch.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedArchitecture?.id === arch.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                  {arch.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                  {arch.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(arch.category)}`}>
                    {arch.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getComplexityColor(arch.complexity)}`}>
                    {arch.complexity}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Details Panel */}
      <div className="w-2/3 flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg m-3">
        {selectedArchitecture ? (
          <>
            {/* Header */}
            <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {selectedArchitecture.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {selectedArchitecture.description}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Components */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Components</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedArchitecture.nodes?.map((node) => (
                    <div
                      key={node.id}
                      className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        {node.label}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {node.azure}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {selectedArchitecture.benefits?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {selectedArchitecture.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-green-600 flex-shrink-0 mt-1">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estimated Cost */}
              {selectedArchitecture.estimatedMonthlyDollars && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                    Estimated Monthly Cost
                  </p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-400 mt-1">
                    {selectedArchitecture.estimatedMonthlyDollars}
                  </p>
                </div>
              )}

              {/* Connections */}
              {selectedArchitecture.edges?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Connections</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {selectedArchitecture.edges.length} service integrations
                  </p>
                  <div className="space-y-1">
                    {selectedArchitecture.edges.slice(0, 5).map((edge, i) => (
                      <p key={i} className="text-xs text-slate-600 dark:text-slate-400">
                        {edge.source} → {edge.target}
                      </p>
                    ))}
                    {selectedArchitecture.edges.length > 5 && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                        +{selectedArchitecture.edges.length - 5} more connections
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <button
                onClick={handleImport}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Import Architecture
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select an architecture to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
