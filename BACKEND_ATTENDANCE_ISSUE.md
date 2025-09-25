# 🚨 Problema Identificado en el Backend - Asistencias

## **Problema Principal**

El endpoint `/api/v1/attendances/my-attendances` está devolviendo asistencias incorrectas para usuarios HR/ADMIN.

### **Síntomas:**
1. **Usuario HR** con token JWT que contiene `employeeId: 3` está viendo asistencias del empleado con ID 3
2. **El endpoint debería devolver las asistencias del usuario HR**, no las de otro empleado
3. **El endpoint de empresa** funciona correctamente y devuelve todas las asistencias

### **Análisis del Token JWT:**
```json
{
  "companyId": 3,
  "role": "HR", 
  "employeeId": 3,
  "sub": "Pepe rh"
}
```

### **Comportamiento Esperado vs Actual:**

| Rol | Endpoint | Comportamiento Esperado | Comportamiento Actual |
|-----|----------|------------------------|----------------------|
| EMPLOYEE | `/my-attendances` | ✅ Sus propias asistencias | ✅ Funciona correctamente |
| HR | `/my-attendances` | ❌ Sus propias asistencias | ❌ Asistencias del empleado con ID 3 |
| HR | `/company-attendances` | ✅ Todas las asistencias de la empresa | ✅ Funciona correctamente |

## **Solución Temporal Implementada**

### **Frontend Workaround:**
1. **Para usuarios HR/ADMIN en modo "Mis asistencias"**:
   - Usar endpoint `/company-attendances` 
   - Filtrar resultados por `employeeId` del usuario actual
   - Esto asegura que solo vean sus propias asistencias

2. **Para usuarios HR/ADMIN en modo "Empresa"**:
   - Usar endpoint `/company-attendances` normalmente
   - Mostrar todas las asistencias sin filtrar

### **Código Implementado:**
```typescript
// En AttendanceHistory y AttendanceTracker
if (user?.role === "HR" || user?.role === "ADMIN") {
  // Usar endpoint de empresa pero filtrar por su ID
  const response = await AttendanceService.getCompanyAttendancesByRange(...)
  
  // Filtrar solo las asistencias del usuario actual
  if (user.employeeId) {
    response.content = response.content.filter(record => record.employeeId === user.employeeId)
  }
}
```

## **Solución Definitiva Requerida en Backend**

### **Problema en el Backend:**
El endpoint `/api/v1/attendances/my-attendances` está interpretando incorrectamente el token JWT para usuarios HR/ADMIN.

### **Posibles Causas:**
1. **Lógica de autenticación incorrecta**: El backend está usando `employeeId` del token en lugar del ID del usuario HR
2. **Mapeo de roles**: El backend no está diferenciando correctamente entre roles HR y EMPLOYEE
3. **Base de datos**: Puede haber un problema en cómo se almacenan o consultan las asistencias de usuarios HR

### **Solución Requerida:**
1. **Revisar la lógica del endpoint** `/api/v1/attendances/my-attendances`
2. **Asegurar que usuarios HR/ADMIN** vean sus propias asistencias, no las de otros empleados
3. **Verificar el mapeo de usuarios** en la base de datos
4. **Actualizar la documentación** de endpoints si es necesario

## **Testing**

### **Casos de Prueba:**
1. **Usuario EMPLOYEE** → `/my-attendances` → Debe ver solo sus asistencias ✅
2. **Usuario HR** → `/my-attendances` → Debe ver solo sus asistencias ❌ (workaround aplicado)
3. **Usuario HR** → `/company-attendances` → Debe ver todas las asistencias ✅
4. **Usuario ADMIN** → `/my-attendances` → Debe ver solo sus asistencias ❌ (workaround aplicado)
5. **Usuario ADMIN** → `/company-attendances` → Debe ver todas las asistencias ✅

## **Notas Adicionales**

- **El workaround es funcional** pero no es la solución ideal
- **Puede impactar performance** ya que se cargan más datos de los necesarios
- **La paginación puede verse afectada** por el filtrado en el frontend
- **Se recomienda arreglar el backend** lo antes posible

---

**Fecha:** 2025-01-24  
**Estado:** Workaround implementado, problema del backend pendiente de resolución
