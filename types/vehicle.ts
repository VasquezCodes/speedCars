export interface Vehicle {
  id?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  type: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  images: string[];
  description: string;
  slug: string;
  createdAt?: any;
  status?: string; // e.g. 'Disponible', 'Reservado', 'Vendido', 'Retirado'
  isFeatured?: boolean;
  condition?: string;
  bodyStyle?: string;
  features?: string[];
}
