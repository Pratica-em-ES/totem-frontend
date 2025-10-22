const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINT = API_BASE_URL + '/categories';


export const getCategories = async () => {
  try {
    const response = await fetch(API_ENDPOINT);

    if (!response.ok) {
      throw new Error(`Erro ao buscar categorias: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Falha no serviço getCategories:', error);
    throw error;
  }
};
