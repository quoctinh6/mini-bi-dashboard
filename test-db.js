const prisma = require('./backend/config/prisma');

async function test() {
  try {
    console.log('--- Database Connection Test ---');
    console.log('Checking for Kernel404 model...');
    console.log('Type of prisma.kernel404:', typeof prisma.kernel404);
    
    if (typeof prisma.kernel404 === 'undefined') {
      console.log('Checking for prisma.Kernel404 (original case)...');
      console.log('Type of prisma.Kernel404:', typeof prisma.Kernel404);
    }
    
    const count = await prisma.kernel404.count();
    console.log('Count of kernel404 transactions:', count);
    
    const result = await prisma.kernel404.aggregate({
      _sum: { revenue: true },
    });
    console.log('Aggregate Revenue Result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('Test Failed:', error);
    process.exit(1);
  }
}

test();
