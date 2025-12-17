export interface Client {
  id: string;
  name: string;
  phone: string;
  pet_name: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Appointment {
  id: string;
  client_id?: string;
  client_name: string;
  pet_name: string;
  service: string;
  price: number;
  date: string;
  is_paid: boolean;
}

export enum ViewState {
  APPOINTMENTS = 'appointments',
  STOCK = 'stock',
  CLIENTS = 'clients',
  FINANCE = 'finance',
  CALCULATOR = 'calculator'
}