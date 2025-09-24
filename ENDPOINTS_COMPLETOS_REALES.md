# 📋 **Lista Completa de Endpoints - Revisión Real de Controladores**

## 🔐 **Autenticación (ms-auth)**

### **AuthController** - `/api/v1/auth`

| Endpoint | Método | Descripción | Body Requerido                                                  | Headers | Roles |
|----------|--------|-------------|-----------------------------------------------------------------|---------|-------|
| `/api/v1/auth/login` | POST | Login con username | `{"username": "string", "password": "string"}`                  | - | ALL |
| `/api/v1/auth/login/email` | POST | Login con email | `{"email": "string", "password": "string", "username":"string"}` | - | ALL |
| `/api/v1/auth/validate` | POST | Validar token | -                                                               | `Authorization: Bearer <token>` | ALL |

### **RegisterController** - `/api/v1/auth`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/auth/register/employee` | POST | Registrar empleado | `{"username": "string", "email": "string", "password": "string"}` | - | ALL |
| `/api/v1/auth/register/hr` | POST | Registrar HR | `{"username": "string", "email": "string", "password": "string", "companyId": number}` | - | ALL |

### **TestController** - `/api/v1/test`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/test/health` | GET | Health check | - | - | ALL |
| `/api/v1/test/echo` | POST | Echo test | `{"key": "value"}` | - | ALL |

---

## 📊 **Asistencia (ms-attendance)**

### **AttendanceController** - `/api/v1/attendances`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/attendances/check-in` | POST | Registrar entrada | `{"notes": "string"}` | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/attendances/check-out` | POST | Registrar salida | `{"notes": "string"}` | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/attendances/{id}` | GET | Ver registro específico | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/attendances/my-attendances` | GET | Ver mis asistencias | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/attendances/my-attendances/range` | GET | Ver asistencias por rango | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/attendances/company-attendances` | GET | Ver asistencias empresa | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/attendances/company-attendances/range` | GET | Ver asistencias empresa por rango | - | `Authorization: Bearer <token>` | HR |

**Parámetros de Query:**
- `page`: número de página (default: 0)
- `size`: tamaño de página (default: 10)
- `startDate`: fecha inicio (formato: yyyy-MM-dd)
- `endDate`: fecha fin (formato: yyyy-MM-dd)

### **SecureAttendanceController** - `/api/v1/secure/attendances`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/secure/attendances/check-in` | POST | Registrar entrada (seguro) | `{"notes": "string"}` | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/secure/attendances/check-out` | POST | Registrar salida (seguro) | `{"notes": "string"}` | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/secure/attendances/my-attendances` | GET | Ver mis asistencias (seguro) | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/secure/attendances/my-attendances/range` | GET | Ver asistencias por rango (seguro) | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/secure/attendances/company-attendances` | GET | Ver asistencias empresa (seguro) | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/secure/attendances/company-attendances/range` | GET | Ver asistencias empresa por rango (seguro) | - | `Authorization: Bearer <token>` | HR |

---

## 📝 **Solicitudes (ms-requests)**

### **RequestController** - `/api/v1/requests`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/requests` | POST | Crear solicitud | `{"requestType": "string", "title": "string", "description": "string"}` | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/requests/{id}` | GET | Ver solicitud específica | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/requests/{id}/status` | PUT | Actualizar estado solicitud | `{"status": "string", "reason": "string"}` | `Authorization: Bearer <token>` | HR |
| `/api/v1/requests/my-requests` | GET | Ver mis solicitudes | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/requests/company-requests` | GET | Ver solicitudes empresa | - | `Authorization: Bearer <token>` | HR |

**Valores válidos para RequestType:**
- `CERTIFICATE` - Constancia
- `REIMBURSEMENT` - Reembolso
- `INCIDENT` - Incidencia
- `OTHER` - Otro
- `INFORMATION` - Información
- `VACATIONS` - Vacaciones

**Valores válidos para RequestStatus:**
- `RECEIVED` - Recibido
- `IN_REVIEW` - En Revisión
- `APPROVED` - Aprobado
- `REJECTED` - Rechazado
- `CLOSED` - Cerrado

**Parámetros de Query:**
- `page`: número de página (default: 0)
- `size`: tamaño de página (default: 10)
- `type`: tipo de solicitud (RequestType)
- `status`: estado de solicitud (RequestStatus)

---

## 👥 **Empleados (ms-employees)**

### **EmployeeController** - `/api/v1/employees`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/employees` | GET | Ver todos los empleados | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/employees/{id}` | GET | Ver empleado específico | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/employees/my-profile` | GET | Ver mi perfil | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/employees/company/{companyId}` | GET | Ver empleados de empresa específica | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/employees/company-employees` | GET | Ver empleados de mi empresa | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/employees` | POST | Crear empleado | `{"companyId": number, "departmentId": number, "fullName": "string", "email": "string", "telephone": "string", "position": "string"}` | `Authorization: Bearer <token>` | HR |
| `/api/v1/employees/{id}` | PUT | Actualizar empleado | `{"companyId": number, "departmentId": number, "fullName": "string", "email": "string", "telephone": "string", "position": "string"}` | `Authorization: Bearer <token>` | HR |
| `/api/v1/employees/{id}` | DELETE | Eliminar empleado (soft delete) | - | `Authorization: Bearer <token>` | HR |

### **EmployeeSearchController** - `/api/v1/employees`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/employees/email` | GET | Buscar empleado por email | - | - | INTERNAL |

**Parámetros de Query:**
- `page`: número de página (default: 0)
- `size`: tamaño de página (default: 10)
- `email`: email del empleado (para búsqueda)

---

## 🎓 **Capacitación (ms-training)**

### **TrainingController** - `/api/v1/tutorials`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/tutorials` | POST | Crear tutorial | `{"idCompany": number, "title": "string", "description": "string", "durationMinutes": number, "tutorialUrl": "string", "category": "string"}` | `Authorization: Bearer <token>` | HR |
| `/api/v1/tutorials` | GET | Ver todos los tutoriales | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/tutorials/company/{companyId}` | GET | Ver tutoriales de empresa específica | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/tutorials/my-company` | GET | Ver tutoriales de mi empresa | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/tutorials/category/{category}` | GET | Buscar por categoría | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/tutorials/{id}` | GET | Ver tutorial específico | - | `Authorization: Bearer <token>` | EMPLOYEE |
| `/api/v1/tutorials/{id}` | PUT | Actualizar tutorial | `{"idCompany": number, "title": "string", "description": "string", "durationMinutes": number, "tutorialUrl": "string", "category": "string"}` | `Authorization: Bearer <token>` | HR |
| `/api/v1/tutorials/{id}` | DELETE | Eliminar tutorial | - | `Authorization: Bearer <token>` | HR |
| `/api/v1/tutorials/search` | GET | Buscar tutoriales | - | `Authorization: Bearer <token>` | EMPLOYEE |

**Parámetros de Query:**
- `page`: número de página (default: 0)
- `size`: tamaño de página (default: 10)
- `query`: término de búsqueda (para search)

---

## 🏢 **Empresas (ms-companies)**

### **CompanyController** - `/api/v1/companies`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/companies` | GET | Ver todas las empresas | - | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/companies/{id}` | GET | Ver empresa específica | - | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/companies` | POST | Crear empresa | `{"fullName": "string", "rfc": "string", "address": "string", "email": "string", "telephone": "string"}` | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/companies/{id}` | PUT | Actualizar empresa | `{"fullName": "string", "rfc": "string", "address": "string", "email": "string", "telephone": "string"}` | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/companies/{id}` | DELETE | Eliminar empresa (soft delete) | - | `Authorization: Bearer <token>` | ADMIN |

### **DepartmentController** - `/api/v1/departments`

| Endpoint | Método | Descripción | Body Requerido | Headers | Roles |
|----------|--------|-------------|----------------|---------|-------|
| `/api/v1/departments` | GET | Ver todos los departamentos | - | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/departments/company/{companyId}` | GET | Ver departamentos de empresa | - | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/departments/{id}` | GET | Ver departamento específico | - | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/departments` | POST | Crear departamento | `{"fullName": "string", "companyId": number}` | `Authorization: Bearer <token>` | ADMIN |
| `/api/v1/departments/{id}` | DELETE | Eliminar departamento | - | `Authorization: Bearer <token>` | ADMIN |

**Parámetros de Query:**
- `page`: número de página (default: 0)
- `size`: tamaño de página (default: 10)

---

## 🔒 **Matriz de Permisos por Rol**

### **EMPLOYEE (Empleado)**
- ✅ Autenticación (login, register)
- ✅ Asistencia personal (check-in, check-out, ver mis asistencias)
- ✅ Solicitudes personales (crear, ver mis solicitudes)
- ✅ Ver tutoriales (todos, por categoría, búsqueda)
- ✅ Ver mi perfil

### **HR (Recursos Humanos)**
- ✅ Todo lo de EMPLOYEE +
- ✅ Ver asistencias de toda la empresa
- ✅ Gestionar solicitudes (aprobar/rechazar)
- ✅ Gestionar empleados (CRUD)
- ✅ Gestionar tutoriales (CRUD)

### **ADMIN (Administrador)**
- ✅ Todo lo de EMPLOYEE y HR +
- ✅ Gestionar empresas (CRUD)
- ✅ Gestionar departamentos (CRUD)

---

## 📝 **Información Importante**

### **Autenticación**
- **Gateway**: Puerto 8090 - todos los requests van a través del gateway
- **Headers requeridos**: `Authorization: Bearer <token>` (excepto endpoints de auth)
- **Token JWT**: Se extrae automáticamente del header Authorization

### **Paginación**
- **Parámetros**: `page` (default: 0), `size` (default: 10)
- **Formato**: `?page=0&size=10`

### **Filtros**
- **Asistencias**: Por rango de fechas (`startDate`, `endDate`)
- **Solicitudes**: Por tipo (`type`) y estado (`status`)
- **Tutoriales**: Por categoría y búsqueda de texto

### **Validaciones**
- **IDs**: Deben ser números positivos (≥1)
- **Emails**: Formato válido de email
- **Strings**: Longitud máxima según el campo
- **Enums**: Valores específicos según las listas proporcionadas

### **Soft Delete**
- Los endpoints DELETE realizan eliminación lógica (marcan como inactivo)
- No eliminan físicamente los registros de la base de datos

**Total de endpoints**: **42 endpoints** distribuidos en **6 microservicios**

---

## 🚀 **Ejemplos de Uso**

### **1. Login**
```bash
POST http://localhost:8090/api/v1/auth/login/email
Content-Type: application/json

{
    "email": "empleado@empresa.com",
    "password": "password123"
}
```

### **2. Check-in**
```bash
POST http://localhost:8090/api/v1/attendances/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
    "notes": "Entrada desde casa"
}
```

### **3. Crear Solicitud**
```bash
POST http://localhost:8090/api/v1/requests
Authorization: Bearer <token>
Content-Type: application/json

{
    "requestType": "VACATIONS",
    "title": "Solicitud de vacaciones",
    "description": "Necesito tomar vacaciones del 20 al 30 de diciembre"
}
```

### **4. Aprobar Solicitud**
```bash
PUT http://localhost:8090/api/v1/requests/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
    "status": "APPROVED",
    "reason": "Solicitud aprobada por recursos humanos"
}
```
