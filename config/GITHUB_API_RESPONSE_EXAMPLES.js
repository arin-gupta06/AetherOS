/**
 * GitHub Architecture Inference - Example API Responses
 * Reference file showing what to expect from the /api/github/analyze-repo endpoint
 */

// ============================================================================
// EXAMPLE 1: React Repository (Frontend-only)
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "repoUrl": "https://github.com/facebook/react"
}

// RESPONSE: 200 OK
{
  "status": "success",
  "repository": {
    "owner": "facebook",
    "repo": "react",
    "url": "https://github.com/facebook/react"
  },
  "detectedServices": {
    "frontend": {
      "type": "Frontend",
      "name": "Frontend Application",
      "directory": "packages",
      "framework": "React"
    },
    "backend": null,
    "database": null,
    "workers": [],
    "caches": [],
    "messageQueue": null,
    "other": []
  },
  "architecture": {
    "nodes": [
      {
        "id": "service-0",
        "data": {
          "label": "Frontend",
          "type": "Frontend",
          "service": {
            "type": "Frontend",
            "name": "Frontend Application",
            "directory": "packages",
            "framework": "React"
          }
        },
        "position": {
          "x": 284.5,
          "y": 123.7
        }
      }
    ],
    "edges": []
  },
  "timestamp": "2026-03-13T10:30:45.123Z"
}

// ============================================================================
// EXAMPLE 2: Express API Repository (Backend-only)
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "repoUrl": "https://github.com/expressjs/express"
}

// RESPONSE: 200 OK
{
  "status": "success",
  "repository": {
    "owner": "expressjs",
    "repo": "express",
    "url": "https://github.com/expressjs/express"
  },
  "detectedServices": {
    "frontend": null,
    "backend": {
      "type": "Backend",
      "name": "Backend API",
      "runtime": "Node.js",
      "framework": "Express"
    },
    "database": null,
    "workers": [],
    "caches": [],
    "messageQueue": null,
    "other": []
  },
  "architecture": {
    "nodes": [
      {
        "id": "service-0",
        "data": {
          "label": "API Backend",
          "type": "Service",
          "service": {
            "type": "Backend",
            "name": "Backend API",
            "runtime": "Node.js",
            "framework": "Express"
          }
        },
        "position": {
          "x": 150.2,
          "y": 200.5
        }
      }
    ],
    "edges": []
  },
  "timestamp": "2026-03-13T10:31:20.456Z"
}

// ============================================================================
// EXAMPLE 3: Flask Application (Python Backend)
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "repoUrl": "https://github.com/pallets/flask"
}

// RESPONSE: 200 OK
{
  "status": "success",
  "repository": {
    "owner": "pallets",
    "repo": "flask",
    "url": "https://github.com/pallets/flask"
  },
  "detectedServices": {
    "frontend": null,
    "backend": {
      "type": "Backend",
      "name": "Backend API",
      "runtime": "Python",
      "framework": "Flask"
    },
    "database": null,
    "workers": [],
    "caches": [],
    "messageQueue": null,
    "other": []
  },
  "architecture": {
    "nodes": [
      {
        "id": "service-0",
        "data": {
          "label": "API Backend",
          "type": "Service",
          "service": {
            "type": "Backend",
            "name": "Backend API",
            "runtime": "Python",
            "framework": "Flask"
          }
        },
        "position": {
          "x": 234.1,
          "y": 180.9
        }
      }
    ],
    "edges": []
  },
  "timestamp": "2026-03-13T10:32:01.789Z"
}

// ============================================================================
// EXAMPLE 4: MERN Full-Stack Application (Complex Architecture)
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "repoUrl": "https://github.com/user/mern-stack-example"
}

// RESPONSE: 200 OK
{
  "status": "success",
  "repository": {
    "owner": "user",
    "repo": "mern-stack-example",
    "url": "https://github.com/user/mern-stack-example"
  },
  "detectedServices": {
    "frontend": {
      "type": "Frontend",
      "name": "Frontend Application",
      "directory": "client",
      "framework": "React"
    },
    "backend": {
      "type": "Backend",
      "name": "Backend API",
      "runtime": "Node.js",
      "framework": "Express"
    },
    "database": {
      "type": "Database",
      "name": "Database",
      "databases": [
        "MongoDB",
        "Redis"
      ]
    },
    "workers": [],
    "caches": [
      {
        "type": "Cache",
        "name": "Redis"
      }
    ],
    "messageQueue": null,
    "other": []
  },
  "architecture": {
    "nodes": [
      {
        "id": "service-0",
        "data": {
          "label": "Frontend",
          "type": "Frontend",
          "service": {
            "type": "Frontend",
            "name": "Frontend Application",
            "directory": "client",
            "framework": "React"
          }
        },
        "position": {
          "x": 100.5,
          "y": 50.2
        }
      },
      {
        "id": "service-1",
        "data": {
          "label": "API Backend",
          "type": "Service",
          "service": {
            "type": "Backend",
            "name": "Backend API",
            "runtime": "Node.js",
            "framework": "Express"
          }
        },
        "position": {
          "x": 100.5,
          "y": 200.8
        }
      },
      {
        "id": "service-2",
        "data": {
          "label": "MongoDB",
          "type": "Database",
          "service": {
            "type": "Database",
            "name": "Database",
            "databases": [
              "MongoDB",
              "Redis"
            ]
          }
        },
        "position": {
          "x": 300.2,
          "y": 250.5
        }
      },
      {
        "id": "service-3",
        "data": {
          "label": "Redis",
          "type": "Cache",
          "service": {
            "type": "Cache",
            "name": "Redis"
          }
        },
        "position": {
          "x": 300.2,
          "y": 150.9
        }
      }
    ],
    "edges": [
      {
        "source": "service-0",
        "target": "service-1",
        "animated": true
      },
      {
        "source": "service-1",
        "target": "service-2",
        "animated": true
      },
      {
        "source": "service-1",
        "target": "service-3",
        "animated": true
      }
    ]
  },
  "timestamp": "2026-03-13T10:33:15.234Z"
}

// ============================================================================
// EXAMPLE 5: Microservices with Docker Compose (Complex Multi-Service)
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "repoUrl": "https://github.com/microservices/ecommerce"
}

// RESPONSE: 200 OK
{
  "status": "success",
  "repository": {
    "owner": "microservices",
    "repo": "ecommerce",
    "url": "https://github.com/microservices/ecommerce"
  },
  "detectedServices": {
    "frontend": {
      "type": "Frontend",
      "name": "Frontend Application",
      "directory": "webapp",
      "framework": "React"
    },
    "backend": {
      "type": "Backend",
      "name": "Backend API",
      "runtime": "Node.js",
      "framework": "Express"
    },
    "database": {
      "type": "Database",
      "name": "PostgreSQL",
      "databases": [
        "PostgreSQL",
        "MongoDB",
        "Redis"
      ]
    },
    "workers": [
      {
        "type": "Worker",
        "name": "Background Worker",
        "directory": "workers"
      }
    ],
    "caches": [
      {
        "type": "Cache",
        "name": "Redis"
      }
    ],
    "messageQueue": {
      "type": "MessageQueue",
      "name": "RabbitMQ"
    },
    "other": []
  },
  "architecture": {
    "nodes": [
      {
        "id": "service-0",
        "data": {
          "label": "Frontend",
          "type": "Frontend",
          "service": {
            "type": "Frontend",
            "name": "Frontend Application",
            "directory": "webapp",
            "framework": "React"
          }
        },
        "position": {
          "x": 150,
          "y": 50
        }
      },
      {
        "id": "service-1",
        "data": {
          "label": "API Backend",
          "type": "Service",
          "service": {
            "type": "Backend",
            "name": "Backend API",
            "runtime": "Node.js",
            "framework": "Express"
          }
        },
        "position": {
          "x": 150,
          "y": 200
        }
      },
      {
        "id": "service-2",
        "data": {
          "label": "PostgreSQL",
          "type": "Database",
          "service": {
            "type": "Database",
            "name": "PostgreSQL",
            "databases": [
              "PostgreSQL",
              "MongoDB",
              "Redis"
            ]
          }
        },
        "position": {
          "x": 50,
          "y": 350
        }
      },
      {
        "id": "service-3",
        "data": {
          "label": "Redis",
          "type": "Cache",
          "service": {
            "type": "Cache",
            "name": "Redis"
          }
        },
        "position": {
          "x": 250,
          "y": 350
        }
      },
      {
        "id": "service-4",
        "data": {
          "label": "RabbitMQ",
          "type": "MessageQueue",
          "service": {
            "type": "MessageQueue",
            "name": "RabbitMQ"
          }
        },
        "position": {
          "x": 350,
          "y": 200
        }
      },
      {
        "id": "service-5",
        "data": {
          "label": "Background Worker",
          "type": "Worker",
          "service": {
            "type": "Worker",
            "name": "Background Worker",
            "directory": "workers"
          }
        },
        "position": {
          "x": 350,
          "y": 300
        }
      }
    ],
    "edges": [
      {
        "source": "service-0",
        "target": "service-1",
        "animated": true
      },
      {
        "source": "service-1",
        "target": "service-2",
        "animated": true
      },
      {
        "source": "service-1",
        "target": "service-3",
        "animated": true
      },
      {
        "source": "service-1",
        "target": "service-4",
        "animated": true
      },
      {
        "source": "service-4",
        "target": "service-5",
        "animated": true
      }
    ]
  },
  "timestamp": "2026-03-13T10:34:52.891Z"
}

// ============================================================================
// ERROR EXAMPLE 1: Invalid URL
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "repoUrl": "invalid-url"
}

// RESPONSE: 400 Bad Request
{
  "status": "error",
  "message": "Invalid GitHub URL format. Expected: https://github.com/owner/repo"
}

// ============================================================================
// ERROR EXAMPLE 2: Missing Parameter
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "somethingElse": "value"
}

// RESPONSE: 400 Bad Request
{
  "error": "Missing required field: repoUrl"
}

// ============================================================================
// ERROR EXAMPLE 3: Repository Not Found
// ============================================================================

// REQUEST:
POST /api/github/analyze-repo
{
  "repoUrl": "https://github.com/nonexistent/repository-that-does-not-exist-12345"
}

// RESPONSE: 400 Bad Request
{
  "status": "error",
  "message": "Not Found (404) - Repository does not exist or is not accessible"
}

// ============================================================================
// NODE STRUCTURE DETAILS
// ============================================================================

{
  "id": "service-0",                    // Unique identifier
  "data": {
    "label": "Service Name",            // Display label in React Flow
    "type": "Frontend|Backend|Database|Cache|MessageQueue|Worker",
    "service": {
      // Original service detection object
      "type": "Frontend",
      "name": "Frontend Application",
      "framework": "React",
      // ... other service-specific fields
    }
  },
  "position": {
    "x": 150.5,                        // Random X position
    "y": 200.9                         // Random Y position
  }
}

// ============================================================================
// EDGE STRUCTURE DETAILS
// ============================================================================

{
  "source": "service-0",        // Source node ID
  "target": "service-1",        // Target node ID
  "animated": true              // Visual animation flag
}

// ============================================================================
// SERVICE TYPE MAPPING
// ============================================================================

Service Types          Detected From                      Color (Optional)
──────────────────────────────────────────────────────────────────────────
Frontend              React/Vue/Angular/Svelte libs      Amber (#FBBF24)
Backend (Service)     Express/FastAPI/Spring/Django      Blue (#60A5FA)
Database              docker-compose, package files      Green (#4ADE80)
Cache                 Redis, Memcached services          Cyan (#22D3EE)
MessageQueue          RabbitMQ, Kafka services           Purple (#A78BFA)
Worker                workers/ directory, Celery         Orange (#FB923C)
