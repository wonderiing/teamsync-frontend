# 🚀 TeamSync Frontend - Proyecto Final IDS

Sistema completo de gestión de recursos humanos construido con **Next.js 14**, **TypeScript**, **Tailwind CSS** y **shadcn/ui**.

## 📋 Características Principales

### 🔐 **Autenticación y Autorización**
- ✅ Login con email/username y contraseña
- ✅ Registro de empleados y personal de RRHH
- ✅ Sistema de roles: `ADMIN`, `HR`, `EMPLOYEE`
- ✅ Tokens JWT con validación automática
- ✅ Protección de rutas por rol

### 📊 **Dashboard Inteligente**
- ✅ Dashboard personalizado por rol
- ✅ Estadísticas en tiempo real
- ✅ Accesos rápidos a funciones principales
- ✅ Información contextual según permisos

### ⏰ **Gestión de Asistencias**
- ✅ Check-in/Check-out con notas
- ✅ Cálculo automático de horas trabajadas
- ✅ Soporte para turnos que cruzan medianoche
- ✅ Historial personal y de empresa
- ✅ Estadísticas semanales y mensuales

### 📝 **Sistema de Solicitudes**
- ✅ Creación de solicitudes por empleados
- ✅ Gestión y aprobación por RRHH
- ✅ Tipos: Vacaciones, Reembolsos, Certificados, etc.
- ✅ Estados: Recibido, En Revisión, Aprobado, Rechazado
- ✅ Seguimiento en tiempo real

### 👥 **Gestión de Empleados**
- ✅ CRUD completo de empleados
- ✅ Información detallada: contacto, departamento, posición
- ✅ Búsqueda y filtrado avanzado
- ✅ Gestión de estados activo/inactivo

### 🎓 **Capacitación**
- ✅ Creación y gestión de tutoriales
- ✅ Categorización por temas
- ✅ URLs de videos y duración
- ✅ Acceso según rol de usuario

### 🏢 **Gestión de Departamentos**
- ✅ Creación y administración de departamentos
- ✅ Asignación automática por empresa
- ✅ Solo para usuarios ADMIN

### 🎨 **UI/UX Moderna**
- ✅ Diseño dark theme elegante
- ✅ Animaciones de éxito para todas las operaciones
- ✅ Componentes reutilizables con shadcn/ui
- ✅ Responsive design para todos los dispositivos
- ✅ Toast notifications informativas

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utilitario
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Iconos vectoriales
- **React Hook Form** - Manejo de formularios

### **Backend (Microservicios)**
- **Java Spring Boot** - Microservicios
- **JWT** - Autenticación y autorización
- **MySQL** - Base de datos
- **API Gateway** - Puerto 8090

### **Herramientas de Desarrollo**
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeScript** - Verificación de tipos

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Backend de microservicios ejecutándose en puerto 8090

### **1. Clonar el Repositorio**
```bash
git clone <repository-url>
cd worky-app
```

### **2. Instalar Dependencias**
```bash
npm install
# o
yarn install
```

### **3. Configurar Variables de Entorno**
Crear archivo `.env.local` en la raíz del proyecto:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8090/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=Worky App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **4. Ejecutar el Proyecto**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en: `http://localhost:3000`

### **5. Ejecutar el Backend**
Asegúrate de que los microservicios estén ejecutándose en:
- **API Gateway**: `http://localhost:8090`
- **ms-auth**: Autenticación
- **ms-attendance**: Asistencias
- **ms-requests**: Solicitudes
- **ms-employees**: Empleados
- **ms-training**: Capacitación
- **ms-companies**: Empresas y Departamentos

## 📁 Estructura del Proyecto

```
worky-app/
├── app/                          # App Router (Next.js 14)
│   ├── attendance/              # Página de asistencias
│   ├── departments/             # Página de departamentos
│   ├── employees/               # Página de empleados
│   ├── requests/                # Página de solicitudes
│   ├── settings/                # Página de configuración
│   ├── training/                # Página de capacitación
│   ├── dashboard/               # Dashboard principal
│   ├── auth/                    # Páginas de autenticación
│   └── globals.css              # Estilos globales
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── auth/                    # Componentes de autenticación
│   ├── attendance/              # Componentes de asistencias
│   ├── dashboard/               # Componentes del dashboard
│   ├── departments/             # Componentes de departamentos
│   ├── employees/               # Componentes de empleados
│   ├── requests/                # Componentes de solicitudes
│   └── training/                # Componentes de capacitación
├── hooks/                       # Custom hooks
│   ├── use-auth.ts             # Hook de autenticación
│   └── use-toast.ts            # Hook de notificaciones
├── lib/                         # Servicios y utilidades
│   ├── auth.ts                 # Servicio de autenticación
│   ├── attendance.ts           # Servicio de asistencias
│   ├── requests.ts             # Servicio de solicitudes
│   ├── employees.ts            # Servicio de empleados
│   ├── training.ts             # Servicio de capacitación
│   ├── departments.ts          # Servicio de departamentos
│   ├── companies.ts            # Servicio de empresas
│   ├── logger.ts               # Sistema de logging
│   └── date-utils.ts           # Utilidades de fecha
├── types/                       # Definiciones de tipos
└── public/                      # Archivos estáticos
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en modo producción
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```


