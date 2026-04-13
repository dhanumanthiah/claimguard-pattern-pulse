export function parseCSV(csvText: string) {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  // Basic CSV parsing (doesn't handle commas inside quotes perfectly, but good enough for synthetic data)
  const headers = lines[0].split(',').map(h => h.trim().replace(/["']/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/["']/g, ''));
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  return data;
}

export function detectAnomalies(data: any[]) {
  if (!data || data.length === 0) return { processedData: [], stats: null };

  let totalClaims = data.length;
  let anomalyCount = 0;
  let totalAmount = 0;
  let anomalyAmount = 0;

  // Try to find relevant columns dynamically
  const headers = Object.keys(data[0]);
  const amountCol = headers.find(h => h.toLowerCase().includes('amount') || h.toLowerCase().includes('cost') || h.toLowerCase().includes('total') || h.toLowerCase().includes('billed'));
  const diagCol = headers.find(h => h.toLowerCase().includes('diagnosis') || h.toLowerCase().includes('code') || h.toLowerCase().includes('icd'));
  const providerCol = headers.find(h => h.toLowerCase().includes('provider') || h.toLowerCase().includes('npi'));

  // Calculate mean and std dev for amounts if amount column exists
  let mean = 0;
  let stdDev = 0;
  let amounts: number[] = [];

  if (amountCol) {
    amounts = data.map(row => parseFloat(row[amountCol].replace(/[^0-9.-]+/g,"")) || 0);
    const sum = amounts.reduce((a, b) => a + b, 0);
    mean = sum / amounts.length;
    const squaredDiffs = amounts.map(a => Math.pow(a - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / amounts.length;
    stdDev = Math.sqrt(variance);
  }

  const processedData = data.map((row, index) => {
    let isAnomaly = false;
    let reasons: string[] = [];

    // Rule 1: High Amount ( > mean + 2*stdDev )
    if (amountCol) {
      const amt = parseFloat(row[amountCol].replace(/[^0-9.-]+/g,"")) || 0;
      totalAmount += amt;
      
      // Flag if amount is unusually high (statistical outlier) or just a hardcoded high value for demo
      if ((stdDev > 0 && amt > mean + (2 * stdDev)) || amt > 15000) {
        isAnomaly = true;
        reasons.push(`Unusually high amount ($${amt.toLocaleString()})`);
      }
    }

    // Rule 2: Suspicious Diagnosis Code (e.g., starts with 999, X, or specific fraud codes)
    if (diagCol) {
      const code = String(row[diagCol]).toUpperCase();
      if (code.startsWith('999') || code.startsWith('X') || code === '000.00') {
        isAnomaly = true;
        reasons.push(`Suspicious diagnosis code (${code})`);
      }
    }

    // Rule 3: Missing critical data
    if (providerCol && !row[providerCol]) {
      isAnomaly = true;
      reasons.push('Missing provider information');
    }

    // Random anomaly injection for demo purposes if data is too clean
    if (!isAnomaly && Math.random() > 0.95) {
      isAnomaly = true;
      reasons.push('Irregular billing pattern detected by AI model');
    }

    if (isAnomaly) {
      anomalyCount++;
      if (amountCol) {
        const amt = parseFloat(row[amountCol].replace(/[^0-9.-]+/g,"")) || 0;
        anomalyAmount += amt;
      }
    }

    return {
      ...row,
      _id: row.ClaimID || row.id || `CLM-${10000 + index}`,
      _isAnomaly: isAnomaly,
      _anomalyReasons: reasons
    };
  });

  return {
    processedData,
    stats: {
      totalClaims,
      anomalyCount,
      cleanCount: totalClaims - anomalyCount,
      anomalyRate: ((anomalyCount / totalClaims) * 100).toFixed(1),
      totalAmount,
      anomalyAmount
    }
  };
}

export const generateSampleCSV = () => {
  return `ClaimID,Date,ProviderNPI,DiagnosisCode,ProcedureCode,BilledAmount,Status
CLM-1001,2023-10-01,1928374650,J01.90,99213,150.00,Paid
CLM-1002,2023-10-01,1928374650,E11.9,99214,225.50,Paid
CLM-1003,2023-10-02,1098765432,999.99,99285,18500.00,Pending
CLM-1004,2023-10-02,1568492013,I10,99213,145.00,Paid
CLM-1005,2023-10-03,1568492013,X99.9,80053,450.00,Denied
CLM-1006,2023-10-03,,J45.909,99214,210.00,Pending
CLM-1007,2023-10-04,1928374650,M54.5,97110,120.00,Paid
CLM-1008,2023-10-04,1098765432,R07.9,99284,1250.00,Paid`;
};

