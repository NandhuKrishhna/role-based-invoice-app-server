export function deriveFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

