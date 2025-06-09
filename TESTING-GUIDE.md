# 🎮 GUÍA COMPLETA DE TESTING - Super Lotería Neón

## 🚀 **PROCEDIMIENTO PASO A PASO**

### **Preparación**
1. Asegúrate de que el servidor esté corriendo:
   ```bash
   npm run dev
   ```
   ✅ **Verificar**: http://localhost:3000 debe estar disponible

### **Paso 1: Conectar y Configurar**
1. **Abrir**: http://localhost:3000
2. **Conectar wallet** (cualquier wallet compatible con Mantle)
3. **Seleccionar una ONG** (ej: "Cuidado de Ancianos", "UNICEF", etc.)

### **Paso 2: Seleccionar Números para Testing**
Para el testing, vamos a usar números específicos:

**Números de Ejemplo para Testing:**
- **Para Victoria**: `1234` 
- **Para Derrota**: `9876`
- **Para Testing Mixto**: `5555`

4. **Ingresar 4 números** en la interfaz (ej: `1234`)
5. **Hacer clic en "JUGAR"** para colocar la apuesta

---

## 🎯 **PANEL DE TESTING AVANZADO (NUEVO)**

Después de colocar la apuesta, verás el **Panel de Testing Avanzado** en la parte inferior:

### **Opciones de Testing:**

#### 🎲 **Modo Aleatorio**
- Genera números ganadores al azar
- Simula el comportamiento normal del juego
- **Uso**: Para testing general

#### 🏆 **Modo Forzar Victoria**
- **Automáticamente usa tus números como ganadores**
- Garantiza que ganes el sorteo
- **Perfecto para**: Testear el sistema de premios y sonidos de victoria

#### 💔 **Modo Forzar Derrota**
- Usa números opuestos a los tuyos
- Garantiza que pierdas el sorteo
- **Perfecto para**: Testear mensajes de derrota y sonidos

#### 🎯 **Modo Números Específicos**
- Te permite ingresar exactamente qué números deben ganar
- **Control total** sobre el resultado
- **Perfecto para**: Testing de casos específicos

---

## 🧪 **EJEMPLOS DE TESTING PRÁCTICOS**

### **Escenario 1: Testing de Victoria**
```
1. Juega números: 1234
2. Selecciona "🏆 Forzar Victoria"
3. Clic en "Ejecutar Sorteo Controlado"
4. Resultado: Números ganadores = 1234
5. ✅ Verificar: Sonido de victoria, mensaje de premio
```

### **Escenario 2: Testing de Derrota**
```
1. Juega números: 1234
2. Selecciona "💔 Forzar Derrota"
3. Clic en "Ejecutar Sorteo Controlado"  
4. Resultado: Números ganadores = 8765 (opuestos)
5. ✅ Verificar: Sonido de derrota, sin premios
```

### **Escenario 3: Testing de Victoria Parcial**
```
1. Juega números: 1234
2. Selecciona "🎯 Específicos"
3. Ingresa números: 1235 (3 coincidencias)
4. Clic en "Ejecutar Sorteo Controlado"
5. ✅ Verificar: Ganas con 3 coincidencias
```

### **Escenario 4: Testing de Diferentes Niveles de Premio**
```
Puedes testear diferentes niveles:
- 4 coincidencias: 1234 vs 1234 (Premio máximo)
- 3 coincidencias: 1234 vs 1235 (Premio medio)
- 2 coincidencias: 1234 vs 1256 (Sin premio)
```

---

## 📊 **QUÉ VERIFICAR EN CADA TEST**

### **Frontend (Visual)**
- ✅ Números ganadores mostrados correctamente
- ✅ Mensaje de victoria/derrota apropiado
- ✅ Sonidos correctos (victoria/derrota)
- ✅ Animaciones y efectos visuales

### **Backend (Logs del Terminal)**
- ✅ Apuesta registrada en base de datos
- ✅ Números ganadores generados/especificados
- ✅ Ganadores detectados correctamente
- ✅ Premios calculados y distribuidos
- ✅ Estadísticas de usuario actualizadas

### **Base de Datos (Opcional - Prisma Studio)**
```bash
npm run db:studio
```
- ✅ Tabla `game_sessions`: Nueva entrada con resultados
- ✅ Tabla `users`: Participaciones incrementadas
- ✅ Tabla `approved_ongs`: Fondos incrementados

---

## 🔍 **DEBUGGING Y VERIFICACIÓN**

### **Ver Logs en Tiempo Real**
En la terminal donde corre `npm run dev`, verás:
```
🎰 [API] Processing bet: { userId: '0x...', selectedNumbers: [1,2,3,4] }
🎲 [MOCK] Drawing numbers... { specificNumbers: [1,2,3,4] }
🎯 [MOCK] Winning numbers: [1,2,3,4]
👑 [MOCK] Winners found: 1
✅ [ADMIN] Draw executed successfully
```

### **Mensajes en la Interfaz**
- ✅ **Victoria**: "✅ Sorteo ejecutado: 1234. 1 ganador(es)"
- ✅ **Derrota**: "✅ Sorteo ejecutado: 8765. 0 ganador(es)"
- ❌ **Error**: "❌ Error en sorteo: [descripción]"

---

## 🎉 **FLUJO COMPLETO RECOMENDADO**

### **Test Básico (5 minutos)**
1. Conectar wallet
2. Seleccionar ONG
3. Jugar números `1234`
4. Usar "🏆 Forzar Victoria"
5. Verificar que ganas

### **Test Completo (15 minutos)**
1. **Test de Victoria** (como arriba)
2. **Test de Derrota** (con "💔 Forzar Derrota")
3. **Test de Números Específicos** (probar `1235` para 3 coincidencias)
4. **Test Aleatorio** (comportamiento normal)
5. **Verificar logs** en terminal
6. **Opcional**: Revisar base de datos

---

## 🎯 **CASOS ESPECIALES PARA TESTEAR**

### **Testing de Múltiples Apuestas**
1. Haz varias apuestas con números diferentes
2. Usa números específicos que coincidan con algunas
3. Verifica que solo los ganadores correctos reciben premios

### **Testing de Pool de Premios**
1. Haz múltiples apuestas para aumentar el pool
2. Ejecuta sorteo con ganadores
3. Verifica distribución: 80% pool, 15% ONG, 5% plataforma

### **Testing de ONGs Diferentes**
1. Haz apuestas para diferentes ONGs
2. Verifica que cada ONG reciba su parte correspondiente

---

¡Con este sistema tienes **control completo** sobre todos los aspectos del juego para testing! 🚀
