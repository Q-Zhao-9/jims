export interface Employer {
  id: string;
  name: string;
  websiteUrl: string | null;
  notes: string | null;
  createdAt?: string;
}

export function employerById(
  employers: Employer[],
  id: string,
): Employer | undefined {
  return employers.find((e) => e.id === id);
}

export function employerName(employers: Employer[], id: string): string {
  return employerById(employers, id)?.name ?? id;
}
