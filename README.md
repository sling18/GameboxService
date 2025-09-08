# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# GameBox Service - Sistema de Gestión para Taller de Reparación

Una aplicación web completa para gestionar un taller de servicio técnico de videojuegos, desarrollada con React, TypeScript y configurada para usar Supabase como backend.

## 🚀 Estado Actual - Demostración Funcional

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
- ✅ Asignar reparaciones a técnicos
- ✅ Completar reparaciones con notas
- ✅ Estados: Pendiente → En Progreso → Completada → Entregada

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
4. Completa detalles del dispositivo y problema
5. Orden entra en cola "Pendiente"

### **2. Asignación y Reparación**
1. Técnico inicia sesión
2. Ve reparaciones disponibles
3. Toma una reparación (pasa a "En Progreso")
4. Completa la reparación
5. Agrega notas del trabajo realizado
6. Marca como "Completada"

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
│   ├── Dashboard.tsx    # Dashboard por roles
│   ├── ServiceQueue.tsx # Gestión de órdenes
│   ├── CustomerSearch.tsx # Búsqueda de clientes
│   ├── CreateOrder.tsx  # Formulario nueva orden
│   └── PageRenderer.tsx # Router de páginas
├── contexts/            # Contextos React
│   ├── AuthContextDemo.tsx # Auth con datos locales
│   └── RouterContext.tsx   # Navegación SPA
├── hooks/               # Hooks personalizados
│   ├── useServiceOrdersDemo.ts # Gestión órdenes (demo)
│   └── useCustomersDemo.ts     # Gestión clientes (demo)
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

## 🚀 **Despliegue en Producción**

### **Vercel (Recomendado)**
1. Conectar repositorio GitHub a Vercel
2. Configurar variables de entorno de Supabase
3. Deploy automático

### **Netlify**
1. Conectar repositorio GitHub a Netlify  
2. Build command: `npm run build`
3. Publish directory: `dist`

## 🤝 **Próximas Funcionalidades**

- [ ] **Notificaciones en tiempo real** con Supabase
- [ ] **Reportes y analíticas** avanzadas
- [ ] **Gestión de inventario** de repuestos
- [ ] **Facturación integrada**
- [ ] **API REST** para integraciones
- [ ] **App móvil** con React Native
- [ ] **WhatsApp integration** para notificaciones

---

## 🎯 **¿Listo para Producción?**

**¡SÍ!** Esta aplicación está lista para usar en un taller real. Solo necesitas:

1. ✅ **Configurar Supabase** (base de datos gratuita)
2. ✅ **Cambiar a contextos reales** (líneas ya preparadas)
3. ✅ **Crear usuarios** en la base de datos
4. ✅ **¡Empezar a usar!**

La aplicación ya maneja todos los casos de uso de un taller de reparación de videojuegos y está optimizada para un flujo de trabajo eficiente.

**Desarrollado con ❤️ para talleres de reparación de videojuegos**

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
"# GameboxService" 
"# GameboxService" 
