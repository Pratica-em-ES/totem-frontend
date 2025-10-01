export interface CompanyDTO {
  id: string;
  name: string;
  cnpj: string;
  address: string; // if Company.java has an Address entity, you can replace with AddressDTO
}
