
import { AuctionItem, User } from './types';

export const MOCK_ITEMS: AuctionItem[] = [
  {
    id: '1',
    name: 'Oukitel WP300 5G',
    brand: 'Oukitel',
    specs: '12GB/512GB',
    currentBid: 20000,
    reservePrice: 25000,
    timeLeft: '12d 3h restantes',
    imageDetails: 'rugged-phone-1'
  },
  {
    id: '2',
    name: 'Oukitel WP100 12GB',
    brand: 'Oukitel',
    specs: 'de RAM y 512GB',
    currentBid: 36500,
    reservePrice: 42000,
    timeLeft: '19d 4h restantes',
    imageDetails: 'rugged-phone-2'
  },
  {
    id: '3',
    name: 'Oukitel WP56 5G',
    brand: 'Oukitel',
    specs: '12GB/512GB',
    currentBid: 18500,
    reservePrice: 22000,
    timeLeft: '14d 23h restantes',
    imageDetails: 'rugged-phone-3'
  },
  {
    id: '4',
    name: 'Oukitel G3 4GB/128GB',
    brand: 'Oukitel',
    specs: '',
    currentBid: 7700,
    reservePrice: 9500,
    timeLeft: '11d 5h restantes',
    imageDetails: 'rugged-phone-4'
  },
  {
    id: '5',
    name: 'Oukitel WP210 5G',
    brand: 'Oukitel',
    specs: '12GB/512GB',
    currentBid: 600,
    reservePrice: 2500,
    timeLeft: '9d 4h restantes',
    imageDetails: 'rugged-phone-5'
  },
  {
    id: '6',
    name: 'Oukitel G5 4GB/64GB',
    brand: 'Oukitel',
    specs: 'Movil Rugerizado',
    currentBid: 7700,
    reservePrice: 9000,
    timeLeft: '6d 3h restantes',
    imageDetails: 'rugged-phone-6'
  },
  {
    id: '7',
    name: 'Oukitel WP55 Ultra 5G',
    brand: 'Oukitel',
    specs: '12 GB de RAM 512 GB',
    currentBid: 16000,
    reservePrice: 19500,
    timeLeft: '5d 3h restantes',
    imageDetails: 'rugged-phone-7'
  },
  {
    id: '8',
    name: 'Oukitel C62 5G',
    brand: 'Oukitel',
    specs: '16GB/512GB',
    currentBid: 7700,
    reservePrice: 11000,
    timeLeft: '23m restantes',
    imageDetails: 'rugged-phone-8'
  }
];

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Carlos Rodriguez', email: 'carlos.r@gmail.com', phone: '+18295550001', role: 'user', status: 'active', lastSeen: '2024-03-15T10:30:00', avatar: '10' },
  { id: '2', name: 'Maria Benitez', email: 'maria.b@hotmail.com', phone: '+18095550002', role: 'vip', status: 'active', lastSeen: '2024-03-15T11:45:00', avatar: '20' },
  { id: '3', name: 'Juan Perez', email: 'juan.perez@yahoo.com', phone: '+18495550003', role: 'user', status: 'pending', lastSeen: '2024-03-14T09:15:00', avatar: '30' },
  { id: '4', name: 'Luisa Martinez', email: 'luisa.mtz@gmail.com', phone: '+18295550004', role: 'user', status: 'active', lastSeen: '2024-03-15T12:00:00', avatar: '40' },
  { id: '5', name: 'Pedro Sanchez', email: 'pedro.s@outlook.com', phone: '+18095550005', role: 'user', status: 'banned', lastSeen: '2024-02-28T14:20:00', avatar: '50' },
  { id: '6', name: 'Ana Gomez', email: 'ana.gomez@gmail.com', phone: '+18295550006', role: 'vip', status: 'active', lastSeen: '2024-03-15T12:10:00', avatar: '60' },
  { id: '7', name: 'Roberto Diaz', email: 'roberto.d@gmail.com', phone: '+18495550007', role: 'user', status: 'active', lastSeen: '2024-03-15T08:00:00', avatar: '70' },
  { id: '8', name: 'Elena Torres', email: 'elena.t@hotmail.com', phone: '+18095550008', role: 'user', status: 'pending', lastSeen: '2024-03-13T16:45:00', avatar: '80' },
];