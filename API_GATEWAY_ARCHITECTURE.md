# 🚀 API Gateway para Modernización IBM i - Arquitectura Completa

## 📋 Resumen Ejecutivo

Este proyecto demuestra un **API Gateway empresarial** que actúa como capa de abstracción entre sistemas legacy IBM i y aplicaciones modernas. Ideal para portfolios de modernización de core bancario/consultoras.

### 🎯 Valor para Consultoras/Bancos

- **Modernización Gradual**: Permite migrar servicios sin reescribir todo el sistema
- **Versionado de APIs**: Mantiene compatibilidad con clientes antiguos (v1) mientras evoluciona (v2)
- **Seguridad Empresarial**: JWT, API Keys, rate limiting por cliente
- **Observabilidad**: Métricas, logs, auditoría completa
- **Transformación de Datos**: Convierte formatos legacy (EBCDIC) a JSON moderno

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │  API Tester  │  │  Monitoring  │          │
│  │  Monitoreo   │  │  Swagger UI  │  │  Analytics   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Node.js)                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CAPA DE SEGURIDAD                              │ │
│  │  • JWT Validation    • API Key Auth    • Rate Limiting     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CAPA DE VERSIONADO                             │ │
│  │  • /api/v1/*  (Legacy Compatible)                          │ │
│  │  • /api/v2/*  (Modern Features)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CAPA DE TRANSFORMACIÓN                         │ │
│  │  • EBCDIC → UTF-8    • Fixed → JSON    • Validation       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CAPA DE CACHÉ (Redis)                          │ │
│  │  • Cache Hit/Miss    • TTL Config    • Invalidation        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CAPA DE LOGGING & AUDITORÍA                    │ │
│  │  • Request/Response  • Performance    • Errors             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IBM i (PUB400.COM)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  DB2 Tables  │  │  Programs    │  │  Data Queues │          │
│  │  (ODBC)      │  │  (RPG/COBOL) │  │  (Messages)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
ibmi-api-gateway/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # ODBC connection pool
│   │   │   ├── redis.js             # Redis cache config
│   │   │   └── swagger.js           # OpenAPI spec
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT & API Key validation
│   │   │   ├── rateLimit.js         # Rate limiting por cliente
│   │   │   ├── cache.js             # Redis caching layer
│   │   │   ├── logger.js            # Winston logging
│   │   │   ├── metrics.js           # Prometheus metrics
│   │   │   ├── transformer.js       # Data transformation
│   │   │   └── validator.js         # Request validation
│   │   ├── routes/
│   │   │   ├── v1/
│   │   │   │   ├── customers.js     # Legacy API v1
│   │   │   │   ├── employees.js
│   │   │   │   └── index.js
│   │   │   ├── v2/
│   │   │   │   ├── customers.js     # Modern API v2
│   │   │   │   ├── employees.js
│   │   │   │   └── index.js
│   │   │   ├── admin.js             # Admin endpoints
│   │   │   └── health.js            # Health checks
│   │   ├── services/
│   │   │   ├── ibmi.service.js      # IBM i operations
│   │   │   ├── cache.service.js     # Cache operations
│   │   │   └── audit.service.js     # Audit logging
│   │   ├── utils/
│   │   │   ├── ebcdic.js            # EBCDIC conversion
│   │   │   ├── errors.js            # Custom errors
│   │   │   └── helpers.js           # Utility functions
│   │   ├── models/
│   │   │   ├── Customer.js          # Data models
│   │   │   └── Employee.js
│   │   └── app.js                   # Express app setup
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── MetricsCard.jsx
│   │   │   │   ├── LatencyChart.jsx
│   │   │   │   ├── ErrorRateChart.jsx
│   │   │   │   └── RequestsChart.jsx
│   │   │   ├── ApiTester/
│   │   │   │   ├── EndpointSelector.jsx
│   │   │   │   ├── RequestBuilder.jsx
│   │   │   │   └── ResponseViewer.jsx
│   │   │   ├── Monitoring/
│   │   │   │   ├── LogViewer.jsx
│   │   │   │   ├── AuditTrail.jsx
│   │   │   │   └── AlertsPanel.jsx
│   │   │   └── Admin/
│   │   │       ├── ApiKeyManager.jsx
│   │   │       ├── RateLimitConfig.jsx
│   │   │       └── CacheManager.jsx
│   │   ├── hooks/
│   │   │   ├── useMetrics.js
│   │   │   ├── useWebSocket.js
│   │   │   └── useApiTester.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── MODERNIZATION_PATTERNS.md
└── README.md
```

---

## 🔑 Características Principales

### 1. **Sistema de Versionado de APIs**

#### API v1 (Legacy Compatible)
```javascript
// GET /api/v1/customers
// Respuesta en formato legacy (compatible con sistemas antiguos)
{
  "CUSNUM": 123,
  "LSTNAM": "SMITH",
  "INIT": "JR",
  "BALDUE": 1500.00
}
```

#### API v2 (Modern)
```javascript
// GET /api/v2/customers
// Respuesta moderna con metadata y HATEOAS
{
  "data": {
    "id": 123,
    "lastName": "Smith",
    "initials": "JR",
    "balance": 1500.00,
    "lastModified": "2026-02-16T17:00:00Z"
  },
  "meta": {
    "version": "2.0",
    "cached": false,
    "responseTime": "45ms"
  },
  "links": {
    "self": "/api/v2/customers/123",
    "transactions": "/api/v2/customers/123/transactions"
  }
}
```

### 2. **Autenticación Multi-Nivel**

```javascript
// JWT para usuarios
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// API Keys para sistemas
X-API-Key: gw_live_abc123xyz789...
X-Client-ID: banking-app-prod
```

### 3. **Rate Limiting Inteligente**

```javascript
// Por cliente/API Key
{
  "clientId": "banking-app-prod",
  "limits": {
    "requests": 1000,
    "window": "1h",
    "burst": 50
  }
}

// Headers de respuesta
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1708099200
```

### 4. **Transformación de Datos**

```javascript
// EBCDIC → UTF-8
// Fixed-width → JSON
// Packed Decimal → Number

// Antes (IBM i)
"SMITH     JR  000001500"

// Después (JSON)
{
  "lastName": "Smith",
  "initials": "JR",
  "balance": 1500.00
}
```

### 5. **Caché con Redis**

```javascript
// Estrategias de caché
- Cache-Aside (Lazy Loading)
- Write-Through
- TTL configurable por endpoint
- Invalidación selectiva

// Headers
Cache-Control: max-age=300
X-Cache: HIT
X-Cache-Age: 45s
```

### 6. **Logging y Auditoría**

```javascript
// Estructura de log
{
  "timestamp": "2026-02-16T17:00:00.000Z",
  "level": "info",
  "requestId": "req-abc123",
  "method": "GET",
  "path": "/api/v2/customers/123",
  "clientId": "banking-app-prod",
  "userId": "user@example.com",
  "statusCode": 200,
  "responseTime": 45,
  "cached": false,
  "ibmiQuery": "SELECT * FROM QCUSTCDT WHERE CUSNUM=?",
  "ibmiTime": 38
}
```

### 7. **Métricas y Monitoreo**

```javascript
// Prometheus metrics
gateway_requests_total{method="GET",path="/api/v2/customers",status="200"}
gateway_request_duration_seconds{quantile="0.95"}
gateway_cache_hit_ratio
gateway_ibmi_connection_pool_size
gateway_rate_limit_exceeded_total
```

---

## 🎨 Dashboard de Monitoreo (React)

### Componentes Principales

1. **Métricas en Tiempo Real**
   - Requests/segundo
   - Latencia promedio (p50, p95, p99)
   - Tasa de error
   - Cache hit ratio

2. **Gráficos Interactivos**
   - Línea de tiempo de requests
   - Distribución de latencia
   - Top endpoints más usados
   - Errores por tipo

3. **API Tester Integrado**
   - Selector de endpoints
   - Constructor de requests
   - Visualizador de respuestas
   - Historial de pruebas

4. **Administración**
   - Gestión de API Keys
   - Configuración de rate limits
   - Invalidación de caché
   - Visualización de logs

---

## 🔐 Seguridad Empresarial

### Capas de Seguridad

1. **Autenticación**
   - JWT con refresh tokens
   - API Keys con rotación automática
   - OAuth 2.0 (opcional)

2. **Autorización**
   - RBAC (Role-Based Access Control)
   - Permisos granulares por endpoint
   - Scopes de API Keys

3. **Protección**
   - Rate limiting por cliente
   - IP whitelisting
   - Request validation (Joi/Zod)
   - SQL injection prevention
   - XSS protection

4. **Auditoría**
   - Log de todas las operaciones
   - Trazabilidad completa
   - Alertas de seguridad
   - Compliance reports

---

## 📊 Casos de Uso Empresariales

### 1. **Migración Gradual**
```
Fase 1: Gateway delega todo a IBM i
Fase 2: Algunos endpoints migran a microservicios
Fase 3: IBM i solo para datos críticos
Fase 4: IBM i como backup/audit
```

### 2. **Multi-Canal**
```
Mobile App → API v2 (JSON moderno)
Legacy System → API v1 (formato original)
Web App → API v2 (REST + HATEOAS)
```

### 3. **Integración con Terceros**
```
Partner A → API Key con límite 10k/día
Partner B → API Key con límite 50k/día
Internal → JWT sin límites
```

---

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js 20+** - Runtime
- **Express 5** - Framework web
- **ODBC** - Conexión IBM i
- **Redis** - Caché y sesiones
- **Winston** - Logging
- **Prometheus** - Métricas
- **JWT** - Autenticación
- **Joi/Zod** - Validación
- **Swagger/OpenAPI** - Documentación

### Frontend
- **React 19** - UI Framework
- **Vite** - Build tool
- **Recharts** - Gráficos
- **Axios** - HTTP client
- **React Query** - Data fetching
- **Tailwind CSS** - Estilos
- **Monaco Editor** - Code editor (API Tester)

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación local
- **GitHub Actions** - CI/CD
- **Jest** - Testing
- **Supertest** - API testing

---

## 📈 Métricas de Éxito

### Performance
- Latencia p95 < 100ms
- Cache hit ratio > 80%
- Throughput > 1000 req/s

### Confiabilidad
- Uptime > 99.9%
- Error rate < 0.1%
- MTTR < 5 minutos

### Seguridad
- 0 vulnerabilidades críticas
- 100% requests autenticados
- Auditoría completa

---

## 🎓 Aprendizajes Clave

Este proyecto demuestra:

1. **Arquitectura Empresarial**: Patrones de API Gateway reales
2. **Modernización Legacy**: Estrategias de migración gradual
3. **Observabilidad**: Logging, métricas, trazabilidad
4. **Seguridad**: Autenticación, autorización, rate limiting
5. **Performance**: Caché, optimización, escalabilidad
6. **DevOps**: CI/CD, testing, containerización

---

## 📝 Próximos Pasos

1. ✅ Diseñar arquitectura completa
2. 🔄 Crear estructura de directorios
3. 🔄 Implementar versionado de APIs
4. 🔄 Desarrollar middleware de seguridad
5. 🔄 Integrar Redis para caché
6. 🔄 Crear dashboard de monitoreo
7. 🔄 Implementar Swagger/OpenAPI
8. 🔄 Agregar tests completos
9. 🔄 Documentar patrones de modernización
10. 🔄 Deploy en producción

---

## 🤝 Valor para Portfolio

Este proyecto es **ideal para mostrar a consultoras y bancos** porque:

- ✅ Resuelve un problema real de modernización
- ✅ Usa tecnologías empresariales (JWT, Redis, Prometheus)
- ✅ Demuestra pensamiento arquitectónico
- ✅ Incluye seguridad y observabilidad
- ✅ Tiene documentación profesional
- ✅ Es escalable y mantenible

---

**Desarrollado por**: Mariano Franco  
**Tecnologías**: React, Node.js, IBM i, Redis, Docker  
**Propósito**: Demostración de modernización de sistemas legacy