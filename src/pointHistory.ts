export interface PointTransaction {
  id: string;
  userId: string;
  teacherId: string;
  pointsChange: number;
  reason: string;
  createdAt: string;
}

export function loadPointTransactions(): PointTransaction[] {
  try {
    const data = localStorage.getItem('pointTransactions');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePointTransactions(transactions: PointTransaction[]) {
  localStorage.setItem('pointTransactions', JSON.stringify(transactions));
}
