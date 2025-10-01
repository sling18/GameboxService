# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# GameBox Service - Sistema de Gestión para Taller de Reparación

Una aplicación web completa para gestionar un taller de servicio técnico de videojuegos, desarrollada con React, TypeScript y configurada para usar Supabase como backend.

## � Documentación del Proyecto

### Guías de Arquitectura
- [📐 ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura completa del sistema
- [✨ BEST_PRACTICES.md](./docs/BEST_PRACTICES.md) - Mejores prácticas aplicadas
- [♻️ REFACTORING_SUMMARY.md](./docs/REFACTORING_SUMMARY.md) - Resumen de refactorización
- [📋 REFACTORING_CHECKLIST.md](./docs/REFACTORING_CHECKLIST.md) - Checklist completo
- [📊 EXECUTIVE_SUMMARY.md](./docs/EXECUTIVE_SUMMARY.md) - Resumen ejecutivo

### Guías de Performance y Optimización
- [📦 BUNDLE_OPTIMIZATION.md](./docs/BUNDLE_OPTIMIZATION.md) - Optimización de bundle y code splitting

### Guías de Debugging
- [🔍 DEBUG_TECHNICIAN_STATS.md](./docs/DEBUG_TECHNICIAN_STATS.md) - Debug de estadísticas de técnicos
- [🎯 TECHNICIAN_STATS_FIX.md](./docs/TECHNICIAN_STATS_FIX.md) - Corrección implementada

## �🚀 Estado Actual - Demostración Funcional

La aplicación está **100% funcional** en modo demostración con datos locales. Puedes probar todas las funcionalidades sin necesidad de configurar Supabase.

### ✅ Funcionalidades Implementadas y Funcionales

#### 🔐 **Sistema de Autenticación**
- Login con diferentes roles (Admin, Recepcionista, Técnico)
- Navegación dinámica según permisos de usuario
- Logout seguro

#### 👑 **Dashboard por Roles**
- **Administrador**: Vista completa con estadísticas generales
- **Recepcionista**: Enfoque en órdenes pendientes y para entrega
- **Técnico**: Vista de reparaciones asignadas y disponibles

#### 📋 **Gestión de Órdenes de Servicio**
- ✅ Ver todas las órdenes organizadas por estado
- ✅ Crear nuevas órdenes de servicio
- ✅ **Sistema de múltiples dispositivos** - Un cliente puede traer varios dispositivos
- ✅ Asignar reparaciones a técnicos
- ✅ Completar reparaciones con notas
- ✅ **Tracking de técnicos** - Se muestra quién completó cada orden
- ✅ Estados: Pendiente → En Progreso → Completada → Entregada
- ✅ **Actualización automática en tiempo real** (15 segundos)
- ✅ **Números de orden únicos** con formato OS-YYYYMMDD-XXXXXX
- ✅ **Indicadores visuales** de última actualización

#### 🖨️ **Sistema de Comanda e Impresión**
- ✅ **Comanda completa** - Documento único con todos los dispositivos del cliente
- ✅ **Stickers individuales** - Etiquetas separadas para marcar cada consola/dispositivo
- ✅ **Vista previa** antes de imprimir
- ✅ **Descarga en PDF** para guardar digitalmente
- ✅ **Formatos optimizados** para impresión térmica y papel normal
- ✅ **Información completa** - Cliente, dispositivos, problemas, números de orden

#### 🔄 **Sistema de Auto-Refresh**
- ✅ **Dashboards dinámicos** - Se actualizan automáticamente cada 15 segundos
- ✅ **Cola de reparaciones** - Sincronización automática para técnicos
- ✅ **Búsqueda de clientes** - Datos siempre actualizados
- ✅ **Indicadores visuales** - Muestra última actualización y próxima
- ✅ **Optimización inteligente** - Solo actualiza cuando el auto-refresh está habilitado

#### 👥 **Gestión de Clientes**
- ✅ Búsqueda de clientes por cédula
- ✅ Registro de nuevos clientes
- ✅ Historial completo de reparaciones por cliente
- ✅ Información de contacto

#### 🔧 **Cola de Reparaciones para Técnicos**
- ✅ Vista de reparaciones disponibles
- ✅ Tomar reparaciones (cambian a "En Progreso")
- ✅ Completar reparaciones con notas detalladas
- ✅ Prioridades visuales (Alta, Media, Baja)

## 🎮 **Credenciales de Demostración**

Al ejecutar la aplicación, puedes usar estas credenciales:

### 👑 **Administrador**
- **Email:** `admin@gameboxservice.com`
- **Contraseña:** `gameboxservice123`
- **Permisos:** Acceso completo a todas las funciones

### 📋 **Recepcionista**  
- **Email:** `recepcion@gameboxservice.com`
- **Contraseña:** `gameboxservice123`
- **Permisos:** Crear órdenes, buscar clientes, marcar entregas

### 🔧 **Técnico**
- **Email:** `tecnico@gameboxservice.com`
- **Contraseña:** `gameboxservice123`  
- **Permisos:** Ver y gestionar reparaciones asignadas

## 🆕 **Funcionalidades Avanzadas**

### 📱 **Sistema de Múltiples Dispositivos**
La aplicación permite manejar clientes que traen varios dispositivos para reparar:

- **Modo Único**: Para un solo dispositivo (comportamiento tradicional)
- **Modo Múltiple**: Para agregar varios dispositivos del mismo cliente
- **Lista Dinámica**: Agregar, duplicar y eliminar dispositivos antes de crear las órdenes
- **Fecha Compartida**: Una fecha estimada común para todos los dispositivos
- **Órdenes Individuales**: Cada dispositivo genera su propia orden con número único

### 🖨️ **Sistema de Comanda e Impresión**
Documentos profesionales para el taller:

#### **Comanda Completa**
- Documento único con todos los dispositivos del cliente
- Información del cliente (nombre, cédula, teléfono)
- Lista detallada de cada dispositivo y problema
- Números de orden individuales
- Estado y técnico asignado

#### **Stickers Individuales**
- Etiquetas separadas para marcar cada consola/dispositivo
- Formato compacto optimizado para etiquetas pequeñas
- Información esencial: cliente, dispositivo, número de orden
- Descripción del problema truncada

#### **Opciones de Impresión**
- **Vista previa** en pantalla antes de imprimir
- **Impresión directa** con ventana emergente
- **Descarga PDF** para guardado digital
- **Formatos optimizados** para impresoras térmicas y papel normal

## 🛠️ **Tecnologías Utilizadas**

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (diseño moderno y responsive)
- **Iconos:** Lucide React
- **Estado:** Context API + Hooks personalizados
- **Routing:** Router personalizado para SPA
- **Backend preparado:** Supabase (PostgreSQL + Auth)

## 🚀 **Cómo Ejecutar**

1. **Clonar e instalar dependencias:**
   ```bash
   git clone <tu-repositorio>
   cd gameboxservtc
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   ```
   http://localhost:5173
   ```

4. **¡Listo!** Usa las credenciales de demostración para probar todas las funcionalidades.

## 📱 **Navegación de la Aplicación**

### **Dashboard Principal**
- Estadísticas según el rol del usuario
- Órdenes recientes
- Acceso rápido a funciones principales

### **Órdenes de Servicio**
- Vista organizada por estados (Pendiente, En Progreso, Completada, Entregada)
- Botón "Nueva Orden" para recepcionistas y admins
- Acciones contextuales para técnicos

### **Búsqueda de Clientes**
- Búsqueda por número de cédula
- Historial completo de reparaciones
- Información de contacto
- Botones de acción para entregas

### **Crear Nueva Orden** (Recepcionistas/Admins)
- Búsqueda automática de cliente por cédula
- Formulario de registro para nuevos clientes
- Detalles completos del dispositivo y problema
- Asignación de prioridades

## 🔄 **Flujo de Trabajo Típico**

### **1. Recepción de Equipo**
1. Recepcionista inicia sesión
2. Crea nueva orden de servicio
3. Busca cliente por cédula (o registra nuevo)
4. **Selecciona modo**: Dispositivo único o múltiples dispositivos
5. **Dispositivo único**: Completa detalles y crea orden
6. **Múltiples dispositivos**: Agrega cada dispositivo a la lista, puede duplicar dispositivos similares
7. **Genera comanda de impresión**:
   - Comanda completa con todos los dispositivos
   - Stickers individuales para marcar cada consola
8. Todas las órdenes entran en cola "Pendiente"

### **2. Asignación y Reparación**
1. Técnico inicia sesión
2. Ve reparaciones disponibles en la cola
3. Toma una reparación (pasa a "En Progreso")
4. Completa la reparación
5. Agrega notas del trabajo realizado
6. Marca como "Completada" - **El sistema registra automáticamente qué técnico la completó**
7. La orden aparece como "Finalizada" con el nombre del técnico visible

### **3. Entrega al Cliente**
1. Recepcionista busca cliente por cédula
2. Ve todas las reparaciones completadas
3. Entrega el equipo al cliente
4. Marca como "Entregada"

## 📊 **Datos de Demostración Incluidos**

La aplicación incluye:
- ✅ **5 clientes** de ejemplo con datos completos
- ✅ **5 órdenes de servicio** en diferentes estados
- ✅ **Historial** de reparaciones realistas
- ✅ **Variedad** de dispositivos (PS5, Xbox, Nintendo Switch, controles)

## 🔮 **Configuración con Supabase Real**

Para usar la aplicación con una base de datos real:

1. **Crear proyecto en [Supabase](https://supabase.com)**
2. **Ejecutar scripts SQL** (incluidos en `/database/setup.sql`)
3. **Configurar variables de entorno** en `.env`:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   ```
4. **Cambiar imports** en componentes:
   - De `AuthContextDemo` a `AuthContext`
   - De `useServiceOrdersDemo` a `useServiceOrders`
   - De `useCustomersDemo` a `useCustomers`

## 🏗️ **Arquitectura del Proyecto**

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes reutilizables (Button, Input, Card)
│   ├── Login.tsx        # Pantalla de autenticación
│   ├── Layout.tsx       # Layout principal con sidebar
│   ├── Dashboard.tsx    # Dashboard por roles con auto-refresh
│   ├── ServiceQueue.tsx # Gestión de órdenes con actualización automática
│   ├── CustomerSearch.tsx # Búsqueda de clientes
│   ├── CreateOrder.tsx  # Formulario nueva orden
│   ├── AutoRefreshIndicator.tsx # Indicador de actualización automática
│   └── PageRenderer.tsx # Router de páginas
├── contexts/            # Contextos React
│   ├── AuthContextDemo.tsx # Auth con datos locales
│   └── RouterContext.tsx   # Navegación SPA
├── hooks/               # Hooks personalizados
│   ├── useServiceOrdersDemo.ts # Gestión órdenes (demo)
│   ├── useCustomersDemo.ts     # Gestión clientes (demo)
│   ├── useServiceOrders.ts     # Gestión órdenes con Supabase
│   ├── useCustomers.ts         # Gestión clientes con Supabase
│   └── useAutoRefresh.ts       # Sistema de actualización automática
├── data/                # Datos de demostración
│   └── demoData.ts      # Clientes y órdenes de ejemplo
├── types/               # Tipos TypeScript
│   └── index.ts         # Definiciones de tipos
└── lib/                 # Configuración
    └── supabase.ts      # Cliente Supabase
```

## 🎨 **Características de Diseño**

- ✅ **Responsive Design** - Funciona en móviles, tablets y desktop
- ✅ **Tema Moderno** - Diseño limpio con Tailwind CSS
- ✅ **Iconografía Consistente** - Iconos de Lucide React
- ✅ **Estados Visuales** - Colores y badges para estados de órdenes
- ✅ **UX Intuitivo** - Navegación clara y acciones obvias
- ✅ **Accesibilidad** - Componentes accesibles y semánticos
- ✅ **Actualización en Tiempo Real** - Indicadores visuales de sincronización

## 🔄 **Sistema de Auto-Refresh**

### **¿Qué es el Auto-Refresh?**
El sistema de auto-refresh mantiene los datos actualizados automáticamente sin necesidad de recargar la página. Ideal para talleres donde múltiples usuarios trabajan simultáneamente.

### **Características:**
- 🕐 **Actualización cada 15 segundos**: Todos los datos se mantienen frescos
- 👀 **Indicadores visuales**: Muestra la última actualización y el estado de sincronización  
- ⚡ **Sin recargas de página**: Experiencia fluida y rápida
- 🎯 **Selectivo**: Cada componente puede elegir si usar auto-refresh o no
- 🛡️ **Robusto**: Maneja errores de red sin afectar la experiencia del usuario

### **Componentes con Auto-Refresh:**
- **Dashboard**: Estadísticas actualizadas para todos los roles
- **Cola de Reparaciones**: Sincronización automática para técnicos
- **Búsqueda de Clientes**: Información siempre al día
- **Gestión de Órdenes**: Estados actualizados en tiempo real

### **Hooks Disponibles:**
```typescript
// Hook general con auto-refresh personalizable
const { data, loading, lastRefresh } = useServiceOrders(true)

// Hooks específicos - todos con 15 segundos
useServiceOrdersAutoRefresh() // 15 segundos
useGeneralAutoRefresh()       // 15 segundos
useAutoRefresh(callback)      // Personalizable (por defecto 15 segundos)
```

## 🚀 **Despliegue en Producción**

### **Vercel (Recomendado)**
1. Conectar repositorio GitHub a Vercel
2. Configurar variables de entorno de Supabase
3. Deploy automático

### **Netlify**
1. Conectar repositorio GitHub a Netlify  
2. Build command: `npm run build`
3. Publish directory: `dist`

## 🗄️ **Configuración de Base de Datos**

Para habilitar todas las funcionalidades (tracking de técnicos, números de serie, observaciones), ejecuta esta migración en el SQL Editor de Supabase:

```sql
-- Migración para agregar campos de serial number y tracking de técnicos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columna de número de serie
ALTER TABLE service_orders 
ADD COLUMN serial_number TEXT;

-- 2. Agregar columna para observaciones
ALTER TABLE service_orders 
ADD COLUMN observations TEXT;

-- 3. Agregar columna para técnico que completó la orden
ALTER TABLE service_orders 
ADD COLUMN completed_by_id UUID REFERENCES profiles(id);

-- 4. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_service_orders_completed_by_id ON service_orders(completed_by_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_serial_number ON service_orders(serial_number);
```

## 🤝 **Próximas Funcionalidades**

- [ ] **Notificaciones push** con Service Workers
- [ ] **Reportes y analíticas** avanzadas
- [ ] **Gestión de inventario** de repuestos
- [ ] **Facturación integrada**
- [ ] **API REST** para integraciones
- [ ] **App móvil** con React Native
- [ ] **WhatsApp integration** para notificaciones
- [ ] **Configuración de intervalos** de auto-refresh por usuario
- [ ] **Websockets** para actualizaciones instantáneas

---

## 🎯 **¿Listo para Producción?**

**¡SÍ!** Esta aplicación está lista para usar en un taller real. Solo necesitas:

1. ✅ **Configurar Supabase** (base de datos gratuita)
2. ✅ **Ejecutar la migración de base de datos** (arriba)
3. ✅ **Cambiar a contextos reales** (líneas ya preparadas)
4. ✅ **Crear usuarios** en la base de datos
5. ✅ **¡Empezar a usar!**

La aplicación ya maneja todos los casos de uso de un taller de reparación de videojuegos y está optimizada para un flujo de trabajo eficiente.

**Desarrollado con ❤️ para talleres de reparación de videojuegos**
    },
  },
])
```
"# GameboxService" 
"# GameboxService" 
