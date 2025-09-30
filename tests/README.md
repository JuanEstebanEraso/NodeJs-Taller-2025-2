# Pruebas Unitarias - Sistema de Apuestas Deportivas

## Descripción

Este proyecto incluye un conjunto completo de pruebas unitarias para validar la funcionalidad del sistema de apuestas deportivas construido con Node.js, TypeScript y MongoDB.

## Comandos Disponibles

### Ejecutar pruebas
```bash
bun run test
```

### Ejecutar con cobertura de código
```bash
bun run test:coverage
```

## Cobertura de Código

### Cobertura Actual Alcanzada: **89.24%**

#### **Controllers** - 85.71% de cobertura
- **bet.controller.ts**: 97.5%
- **event.controller.ts**: 94.44%
- **user.controller.ts**: 71.92%

#### **Middleware** - 100% de cobertura
- **auth.middleware.ts**: 100%

#### **Models** - 100% de cobertura
- **Bet.ts**: 100%
- **Event.ts**: 100%
- **User.ts**: 100% 

#### **Services** - 90% de cobertura
- **auth.service.ts**: 100%
- **bet.service.ts**: 93.33%
- **event.service.ts**: 78.94%
- **user.service.ts**: 75%

## Tecnologías de Testing

- **Jest**: Framework principal de testing
- **ts-jest**: Preset para TypeScript
- **Mocks Avanzados**: Sistema de mocking robusto para mongoose, bcryptjs y jsonwebtoken
- **Testing en Memoria**: Pruebas unitarias sin dependencias externas

## Tipos de Pruebas Implementadas

### 1. Pruebas de Lógica de Negocio (`business-logic.test.ts`)
- Validación completa de reglas del sistema de apuestas
- Cálculos de ganancias, pérdidas y house edge
- Transiciones de estado de apuestas y eventos
- Verificación de escenarios de negocio complejos

### 2. Pruebas de Validación (`validation.test.ts`)
- Validación de formatos de datos (usernames, emails, etc.)
- Lógica de negocio de apuestas
- Cálculos de ganancias y pérdidas
- Validación de transiciones de estado
- Cálculo de house edge

### 3. Pruebas de Servicios
- **AuthService**: Generación de tokens, hash de contraseñas, login/registro
- **UserService**: CRUD de usuarios, validación de balance
- **EventService**: Gestión de eventos, apertura/cierre
- **BetService**: Creación de apuestas, procesamiento de resultados

### 4. Pruebas de Controladores
- **UserController**: Endpoints de autenticación y gestión de usuarios
- **EventController**: Endpoints de gestión de eventos deportivos
- **BetController**: Endpoints de creación y consulta de apuestas

### 5. Pruebas de Middleware
- **AuthMiddleware**: Verificación de tokens JWT, autorización por roles

### 6. Pruebas de Modelos (Simplificadas)
- **User Model**: Validación de estructura de datos y constraints
- **Event Model**: Validación de odds, estados y lógica de eventos
- **Bet Model**: Validación de relaciones y cálculos de apuestas

## Estructura de Pruebas

```
tests/
├── setup.ts                           # Configuración global de testing
├── unit/
│   ├── controllers/                   # Pruebas de controladores
│   │   ├── user.controller.test.ts
│   │   ├── event.controller.test.ts
│   │   └── bet.controller.test.ts
│   ├── services/                      # Pruebas de servicios
│   │   ├── auth.service.test.ts
│   │   ├── user.service.test.ts
│   │   ├── event.service.test.ts
│   │   └── bet.service.test.ts
│   ├── models/                        # Pruebas de modelos
│   │   ├── user.model.test.ts
│   │   ├── event.model.test.ts
│   │   └── bet.model.test.ts
│   ├── middleware/                    # Pruebas de middleware
│   │   └── auth.middleware.test.ts
│   ├── utils/                         # Pruebas de utilidades
│   │   └── validation.test.ts
│   └── business-logic.test.ts         # Lógica de negocio del sistema
├── utils/
│   └── testHelpers.ts                 # Utilidades para testing
└── __mocks__/                         # Mocks de dependencias
    ├── mongoose.ts
    ├── bcryptjs.ts
    └── jsonwebtoken.ts
```
