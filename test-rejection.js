// Script para demostrar qué pasa cuando una propuesta es rechazada
const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function simulateProposalRejection() {
  console.log('🔍 [TEST] Simulando rechazo de propuesta...\n');
  
  // Obtener la propuesta actual
  const proposalId = 'cmbppvb7w000rv9gkf0spppfe';
  const proposal = await prisma.oNGProposal.findUnique({
    where: { id: proposalId }
  });
  
  if (!proposal) {
    console.log('❌ Propuesta no encontrada');
    return;
  }
  
  console.log('📊 ESTADO ACTUAL:');
  console.log(`   Nombre: ${proposal.name}`);
  console.log(`   Votos A Favor: ${proposal.votesFor}`);
  console.log(`   Votos En Contra: ${proposal.votesAgainst}`);
  console.log(`   Total Votos: ${proposal.votesFor + proposal.votesAgainst}`);
  console.log(`   Estado: ${proposal.status}\n`);
  
  // Calcular el resultado según las reglas
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const requiredVotes = 5; // minVotesForApproval
  const approvalThreshold = 60; // approvalThreshold
  
  let newStatus;
  let reason;
  
  if (totalVotes < requiredVotes) {
    newStatus = 'REJECTED';
    reason = `Insuficientes votos (${totalVotes}/${requiredVotes})`;
  } else {
    const approvalPercentage = (proposal.votesFor / totalVotes) * 100;
    if (approvalPercentage >= approvalThreshold) {
      newStatus = 'APPROVED';
      reason = `Aprobada con ${approvalPercentage.toFixed(1)}% de aprobación`;
    } else {
      newStatus = 'REJECTED';
      reason = `Rechazada: ${approvalPercentage.toFixed(1)}% de aprobación (necesita ${approvalThreshold}%)`;
    }
  }
  
  console.log('🎯 ANÁLISIS DE RESULTADO:');
  console.log(`   Votos totales: ${totalVotes} (mínimo: ${requiredVotes})`);
  console.log(`   Porcentaje a favor: ${((proposal.votesFor / totalVotes) * 100).toFixed(1)}%`);
  console.log(`   Umbral requerido: ${approvalThreshold}%`);
  console.log(`   🏆 RESULTADO: ${newStatus}`);
  console.log(`   📝 Razón: ${reason}\n`);
  
  // Simular la actualización (sin ejecutar realmente)
  console.log('🔮 SIMULACIÓN DE FINALIZACIÓN:');
  
  if (newStatus === 'APPROVED') {
    console.log('   ✅ La ONG sería aprobada y agregada al sistema');
    console.log(`   🏪 Nueva ONG disponible: "${proposal.name}"`);
    console.log(`   💰 Wallet de donaciones: ${proposal.proposedWalletAddress}`);
  } else {
    console.log('   ❌ La ONG sería rechazada');
    console.log('   🗑️ La propuesta se marca como REJECTED');
    console.log('   💔 La ONG NO se agrega al sistema');
    console.log('   🔄 Los usuarios pueden proponer nuevamente en el futuro');
  }
  
  console.log('\n✨ FIN DE LA SIMULACIÓN');
}

simulateProposalRejection()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
