## Integrantes 
 - Juan Esteban Eraso - A00399655
 - Alejandro Mejía - A00399937
 - Carlos Sanchez - A00404134
 - Nicolas Cardona - A00373470

# Sports Betting API - NodeJs-Taller-2025-2

Una aplicación backend robusta para un sistema de apuestas deportivas desarrollada con **Node.js**, **TypeScript** y **MongoDB**. La aplicación implementa un sistema completo de autenticación JWT, autorización basada en roles y operaciones CRUD para usuarios, eventos deportivos y apuestas.

## Características

### Funcionalidades Principales
- **Sistema de Autenticación JWT** completo con registro y login
- **Autorización basada en roles** (Admin y Jugador)
- **Gestión de Usuarios** con operaciones CRUD completas
- **Gestión de Eventos Deportivos** con estados y cuotas dinámicas
- **Sistema de Apuestas** con validaciones y procesamiento automático
- **Gestión de Saldos** con verificaciones de fondos suficientes
- **Estadísticas de Apuestas** para jugadores y administradores

### Características Técnicas
- **TypeScript** para tipado fuerte y mejor desarrollo
- **Arquitectura en Capas** (Controllers, Services, Models)
- **Validación de Datos** robusta en todos los endpoints
- **Manejo de Errores** centralizado y consistente
- **Testing Unitario** con Jest y cobertura del **82.7%**

## Instalación

### Prerrequisitos
- **Node.js** (v18 o superior) o **Bun**
- **MongoDB** (local o MongoDB Atlas)
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd NodeJs-Taller-2025-2
```

2. **Instalar dependencias**
```bash
bun install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Configurar MongoDB**


## Uso

### Ejecución
```bash
bun run dev
```

### Testing
```bash
# Ejecutar todos los tests
bun test

# Tests con cobertura
bun run test:coverage

# Tests funcionales específicos
bun run test:functional
```

## Testing

### Tipos de Tests

#### Tests Unitarios Jest (220 tests)
- **Controllers** - 47 tests
- **Services** - 76 tests  
- **Middleware** - 13 tests
- **Models** - 26 tests
- **Utilities** - 24 tests
- **Business Logic** - 34 tests

#### Tests de Integración (Postman)
- Validación de **flujos end-to-end**
- Tests de **autenticación y autorización**
- Verificación de **roles y permisos**

### Ejecutar Tests

```bash
# Tests unitarios
bun run test

# Tests con cobertura
bun run test:coverage
```

### Roles y Permisos

#### **Admin (Administrador)**
- Gestión completa de usuarios
- Crear, actualizar y eliminar eventos
- Cerrar eventos y definir resultados
- Ver y gestionar todas las apuestas
- Procesar apuestas y actualizar saldos
- No puede realizar apuestas

#### **Player (Jugador)**
- Ver su perfil y actualizar información básica
- Ver eventos abiertos y sus detalles
- Realizar apuestas en eventos abiertos
- Ver historial y estadísticas de sus apuestas
- Consultar su saldo actual
- No puede gestionar otros usuarios
- No puede crear o modificar eventos


## Flujo de la Aplicación

### 1. Registro y Autenticación
```
Usuario → Registro → JWT Token → Acceso a API
```

### 2. Gestión de Eventos
```
Admin → Crear Evento → Evento Abierto → Jugadores pueden apostar
```

### 3. Proceso de Apuestas
```
Jugador → Ve Eventos → Selecciona Evento → Realiza Apuesta → 
Descuenta Saldo → Apuesta Pendiente
```

### 4. Cierre y Procesamiento
```
Admin → Cierra Evento → Define Resultado → Procesa Apuestas → 
Actualiza Saldos → Apuestas Resueltas
```
