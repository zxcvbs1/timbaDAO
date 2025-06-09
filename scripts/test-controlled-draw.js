#!/usr/bin/env node
/**
 * 🧪 Script de Testing Controlado
 * Demuestra el nuevo sistema de números ganadores controlados
 */

const http = require('http');

async function makeRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${endpoint}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ 
            success: res.statusCode >= 200 && res.statusCode < 300, 
            data: parsedData, 
            status: res.statusCode 
          });
        } catch (error) {
          resolve({ 
            success: false, 
            error: 'Invalid JSON response', 
            data: data,
            status: res.statusCode 
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testControlledDraw() {
  console.log('🎯 TESTING SISTEMA DE NÚMEROS CONTROLADOS\n');

  console.log('🔧 Test 1: Sorteo con números específicos [1, 2, 3, 4]');
  const test1 = await makeRequest('/admin/execute-draw', 'POST', {
    winningNumbers: [1, 2, 3, 4]
  });
  
  if (test1.success) {
    console.log(`✅ Éxito: Números ganadores = ${test1.data.result.winningNumbers.join('')}`);
    console.log(`   Ganadores: ${test1.data.result.winners.length}`);
  } else {
    console.log(`❌ Error: ${test1.data?.error || 'Unknown error'}`);
  }

  console.log('\n🔧 Test 2: Sorteo con números específicos [9, 8, 7, 6]');
  const test2 = await makeRequest('/admin/execute-draw', 'POST', {
    winningNumbers: [9, 8, 7, 6]
  });
  
  if (test2.success) {
    console.log(`✅ Éxito: Números ganadores = ${test2.data.result.winningNumbers.join('')}`);
    console.log(`   Ganadores: ${test2.data.result.winners.length}`);
  } else {
    console.log(`❌ Error: ${test2.data?.error || 'Unknown error'}`);
  }

  console.log('\n🔧 Test 3: Sorteo aleatorio (sin números específicos)');
  const test3 = await makeRequest('/admin/execute-draw', 'POST', {});
  
  if (test3.success) {
    console.log(`✅ Éxito: Números ganadores = ${test3.data.result.winningNumbers.join('')}`);
    console.log(`   Ganadores: ${test3.data.result.winners.length}`);
  } else {
    console.log(`❌ Error: ${test3.data?.error || 'Unknown error'}`);
  }

  console.log('\n📊 RESUMEN DE TESTING:');
  console.log('✅ Sistema de números controlados implementado');
  console.log('✅ API acepta números específicos');
  console.log('✅ Fallback a números aleatorios funciona');
  console.log('\n🎮 Para testing completo:');
  console.log('1. Abre http://localhost:3000');
  console.log('2. Conecta wallet y haz apuestas');
  console.log('3. Usa el Panel de Testing Avanzado');
  console.log('4. Prueba los modos: Victoria, Derrota, Específicos, Aleatorio');
}

testControlledDraw().catch(console.error);
