import type { CompanyDTO } from '../models/CompanyDTO';

const API_BASE_URL = import.meta.env.VITE_BACK_API_BASE_URL;

export class CompanyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/companies`;
  }

  async getAllCompanies(): Promise<CompanyDTO[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const companies: CompanyDTO[] = await response.json();
      return companies;
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      throw new Error(`Falha ao carregar empresas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

export const companyService = new CompanyService();