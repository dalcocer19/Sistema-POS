# Sistema POS (Punto de Venta)

Un sistema moderno de punto de venta desarrollado con **Laravel 13**, **React 19**, **Inertia.js v3** y **Tailwind CSS v4**. Diseñado para gestionar productos, inventario, categorías y ventas con soporte multiequipo y autenticación segura.

## 🚀 Características Principales

- **Gestión de Productos**: Crear, actualizar y desactivar productos con SKU, código de barras y precios
- **Control de Inventario**: Movimientos de inventario y alertas de stock bajo
- **Categorización**: Organizar productos por categorías
- **Sistema de Ventas**: Interfaz POS intuitiva para realizar ventas
- **Historial de Ventas**: Registro completo de todas las transacciones
- **Soporte Multiequipo**: Gestión de múltiples equipos/sucursales
- **Dashboard Analítico**: Métricas en tiempo real de ventas y productos
- **Autorización Basada en Roles**: Control de acceso granular mediante Gates
- **Autenticación Segura**: Con verificación de email y autenticación de equipos
- **Interfaz Responsiva**: Componentes Radix UI con Tailwind CSS v4

## 🛠️ Stack Tecnológico

### Backend
- **PHP 8.3**
- **Laravel 13** - Framework web
- **Inertia.js v3** - Puente entre backend y frontend
- **Laravel Fortify** - Autenticación
- **Laravel Wayfinder** - Generación TypeScript de rutas
- **SQLite** (por defecto) - Base de datos

### Frontend
- **React 19** - Biblioteca UI
- **Inertia.js React v3** - Cliente de Inertia
- **TypeScript 5.7** - Tipado estático
- **Tailwind CSS v4** - Framework CSS
- **Radix UI** - Componentes accesibles y sin estilos
- **Vite** - Bundler moderno
- **Lucide React** - Iconos

### Desarrollo & Testing
- **Pest 4.7** - Framework de testing
- **PHPStan / Larastan** - Análisis estático
- **Laravel Pint** - Formateador de código PHP
- **Node.js** - Runtime JavaScript

## 📋 Requisitos Previos

- PHP 8.3+
- Node.js 18+ (con npm)
- Composer
- SQLite 3 (opcional, para desarrollo)

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd sistema-pos
```

### 2. Instalación Automática
```bash
composer run setup
```

Este comando ejecutará automáticamente:
- `composer install` - Instala dependencias PHP
- Copia `.env.example` a `.env`
- Genera clave de aplicación
- Ejecuta migraciones de base de datos
- `npm install` - Instala dependencias JavaScript
- `npm run build` - Compila assets

### 3. Configuración Manual (Alternativa)

Si prefieres hacer la instalación paso a paso:

```bash
# Instalar dependencias PHP
composer install

# Configurar archivo .env
cp .env.example .env
php artisan key:generate

# Crear base de datos SQLite
touch database/database.sqlite

# Ejecutar migraciones
php artisan migrate

# Instalar dependencias Node
npm install

# Compilar assets
npm run build
```

## 🏃 Ejecución

### Modo Desarrollo
```bash
composer run dev
```

Este comando inicia concurrentemente:
- Servidor Laravel en `http://localhost:8000`
- Dev server de Vite para HMR
- Watcher de cambios

Luego accede a `http://localhost:8000` en tu navegador.

### Modo Producción
```bash
npm run build
php artisan serve
```

## 📁 Estructura del Proyecto

```
sistema-pos/
├── app/
│   ├── Actions/              # Acciones de negocio reutilizables
│   ├── Http/
│   │   ├── Controllers/      # Controladores agrupados por dominio
│   │   │   ├── DashboardController.php
│   │   │   ├── POS/
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── InventoryController.php
│   │   │   │   └── SaleController.php
│   │   │   └── Teams/
│   │   ├── Requests/        # Form Requests validados
│   │   └── Middleware/      # Middleware personalizado
│   ├── Models/              # Modelos Eloquent
│   └── Policies/            # Políticas de autorización
├── database/
│   ├── migrations/          # Migraciones de BD
│   ├── factories/           # Factories para testing
│   └── seeders/            # Seeders de datos
├── resources/
│   ├── js/
│   │   ├── pages/          # Componentes de página (Inertia)
│   │   ├── components/     # Componentes reutilizables
│   │   └── actions/        # Funciones TypeScript de rutas (Wayfinder)
│   └── css/                # Estilos globales
├── routes/
│   ├── web.php             # Rutas web
│   └── settings.php        # Rutas de configuración
├── tests/                  # Tests con Pest
├── config/                 # Archivos de configuración
└── public/                 # Assets públicos compilados
```

## 🔐 Modelos Principales

### Product
- Atributos: name, sku, barcode, sale_price, cost_price, stock, minimum_stock, is_active
- Relaciones: team, category, inventoryMovements, saleItems

### Category
- Atributos: name, description, team_id
- Relaciones: team, products

### Sale
- Atributos: total, sold_at, team_id, user_id
- Relaciones: team, user, items

### InventoryMovement
- Registro de cambios de stock
- Relaciones: product, team, user

## 🛣️ Rutas Principales

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/dashboard` | GET | Dashboard principal |
| `/products` | GET | Listar productos |
| `/products` | POST | Crear producto |
| `/products/{product}` | PATCH | Actualizar producto |
| `/products/{product}` | DELETE | Desactivar producto |
| `/categories` | GET | Listar categorías |
| `/categories` | POST | Crear categoría |
| `/inventory` | GET | Ver inventario |
| `/inventory/movements` | POST | Registrar movimiento |
| `/pos` | GET | Interfaz de ventas |
| `/sales` | GET | Historial de ventas |
| `/sales` | POST | Crear venta |
| `/sales/{sale}` | GET | Ver detalles de venta |

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
php artisan test

# Tests específicos
php artisan test --filter=ProductTest

# Con salida compacta
php artisan test --compact
```

### Verificación de Calidad
```bash
# Verificar código PHP
composer run lint:check

# Análisis estático (PHPStan)
composer run types:check

# Verificación completa (lint + types + tests)
composer run test
```

### CI/CD
```bash
composer run ci:check
```

## 🎨 Frontend

### Compilar Assets
```bash
# Desarrollo con hot reload
npm run dev

# Compilación optimizada
npm run build

# Verificación de tipos TypeScript
npm run types:check

# Lint y fix automático
npm run check:fix
```

### Componentes

Los componentes React se encuentran en `resources/js/`:
- **Pages**: Componentes de página en `pages/` (renderizados por Inertia)
- **Components**: Componentes reutilizables basados en Radix UI + Tailwind CSS
- **Actions**: Funciones TypeScript generadas por Wayfinder para rutas tipadas

## 🔧 Configuración

### Variables de Entorno (.env)

```env
APP_NAME=SistemaPOS
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de datos
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

# Sesión
SESSION_DRIVER=database

# Cache
CACHE_STORE=database

# Queue
QUEUE_CONNECTION=database
```

Para usar MySQL en lugar de SQLite:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sistema_pos
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
```

## 📊 Dashboard

El dashboard proporciona:
- **Ventas de Hoy**: Cantidad y monto total
- **Productos Activos**: Total de productos disponibles
- **Productos con Stock Bajo**: Alertas de inventario
- **Ventas Recientes**: Últimas 5 transacciones

## 🔒 Autorización

El sistema utiliza **Policies** para autorización:
- `ProductPolicy`: Autoriza acciones sobre productos
- `SalePolicy`: Autoriza acciones sobre ventas
- `InventoryPolicy`: Autoriza movimientos de inventario

Solo los miembros del equipo pueden acceder a sus datos.

## 📦 Comandos Útiles

```bash
# Generar rutas TypeScript (Wayfinder)
php artisan routes:generate

# Crear modelo, migration, factory y seeder
php artisan make:model Product -mfs

# Crear controlador
php artisan make:controller POS/ProductController

# Crear test
php artisan make:test ProductTest

# Crear policy
php artisan make:policy ProductPolicy --model=Product

# Optimizar aplicación
php artisan optimize

# Limpiar cache
php artisan cache:clear
php artisan config:clear
```

## 🐛 Solución de Problemas

### Error: "Unable to locate file in Vite manifest"
```bash
npm run build
# o
npm run dev
```

### Base de datos no sincronizada
```bash
php artisan migrate:fresh --seed
```

### Cambios en frontend no se reflejan
```bash
npm run dev
```

### Limpiar todo y reiniciar
```bash
composer run setup
```

## 📝 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 👥 Contribuidores

Este proyecto fue desarrollado como un sistema POS moderno con las mejores prácticas de Laravel y React.

## 📞 Soporte

Para reportar bugs o sugerir mejoras, por favor abre un issue en el repositorio.

---

**Última actualización**: Septiembre 2026






