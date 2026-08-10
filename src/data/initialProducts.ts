export interface Product {
  id: string; // Barcode / SKU
  name: string;
  category: string;
  price: number; // Precio de Venta al público
  cost: number;  // Costo de adquisición con proveedor
  stock: number;
  minStock: number;
  unit: 'pza' | 'kg' | 'paq' | 'litro';
  supplier?: string;
  expirationDate?: string;
  emoji?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'fiado';
  customerName?: string;
  customerId?: string;
  cashReceived?: number;
  change?: number;
}

export interface FiadoMovement {
  id: string;
  date: string;
  type: 'charge' | 'payment'; // cargo (compra fiada) o abono
  amount: number;
  note: string;
  ticketId?: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  currentDebt: number;
  history: FiadoMovement[];
}

export interface CashMovement {
  id: string;
  date: string;
  type: 'in' | 'out'; // Entrada manual o Gasto/Salida
  amount: number;
  concept: string;
  cashier: string;
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  rfc: string;
  phone: string;
  address: string;
  ticketFooter: string;
  taxRate: number; // 0.16 para 16% o 0
  enableTax: boolean;
  soundEnabled: boolean;
  initialCashFund: number;
}

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Miscelánea Lichita',
  ownerName: 'Alicia Mendoza R.',
  rfc: 'MERA850912HN8',
  phone: '(55) 4321-9870',
  address: 'Av. Revolución #204, Col. San Miguel, CDMX',
  ticketFooter: '¡Gracias por apoyar el comercio local! Vuelva pronto.',
  taxRate: 0.16,
  enableTax: false, // En tienditas de abarrotes los precios suelen ser ya netos con IVA incluido
  soundEnabled: true,
  initialCashFund: 500.00
};

export const INITIAL_PRODUCTS: Product[] = [
  // 🥤 Refrescos, Jugos y Aguas
  { id: '7501055300018', name: 'Coca-Cola 600ml No Retornable', category: 'Bebidas', price: 19.00, cost: 14.50, stock: 36, minStock: 8, unit: 'pza', supplier: 'Coca-Cola FEMSA', emoji: '🥤' },
  { id: '7501055312345', name: 'Coca-Cola 2.5L No Retornable', category: 'Bebidas', price: 38.00, cost: 29.50, stock: 14, minStock: 4, unit: 'pza', supplier: 'Coca-Cola FEMSA', emoji: '🥤' },
  { id: '7501055398765', name: 'Coca-Cola 3L Desechable', category: 'Bebidas', price: 47.00, cost: 37.00, stock: 8, minStock: 3, unit: 'pza', supplier: 'Coca-Cola FEMSA', emoji: '🥤' },
  { id: '7501005101010', name: 'Pepsi 600ml Regular', category: 'Bebidas', price: 16.00, cost: 12.00, stock: 20, minStock: 6, unit: 'pza', supplier: 'Gepp', emoji: '🥤' },
  { id: '7501011100012', name: 'Refresco Jarritos Mandarina 600ml', category: 'Bebidas', price: 14.00, cost: 9.50, stock: 18, minStock: 5, unit: 'pza', supplier: 'Jarritos', emoji: '🍊' },
  { id: '7501011100029', name: 'Refresco Jarritos Tamarindo 600ml', category: 'Bebidas', price: 14.00, cost: 9.50, stock: 12, minStock: 5, unit: 'pza', supplier: 'Jarritos', emoji: '🧃' },
  { id: '7501031301014', name: 'Agua Mineral Peñafiel 600ml', category: 'Bebidas', price: 16.50, cost: 11.80, stock: 24, minStock: 6, unit: 'pza', supplier: 'Keurig Dr Pepper', emoji: '💧' },
  { id: '7501050123456', name: 'Jugo del Valle Naranja 1L Tetra', category: 'Bebidas', price: 26.00, cost: 19.50, stock: 10, minStock: 4, unit: 'pza', supplier: 'Jugos del Valle', emoji: '🧃' },
  { id: '7501020500111', name: 'Agua Purificada Bonafont 1L', category: 'Bebidas', price: 15.00, cost: 9.00, stock: 22, minStock: 6, unit: 'pza', supplier: 'Bonafont', emoji: '💧' },
  { id: '7501040099881', name: 'Suero Electrolit Fresa 625ml', category: 'Bebidas', price: 32.00, cost: 23.50, stock: 9, minStock: 3, unit: 'pza', supplier: 'Pisa Farmacéutica', emoji: '🍓' },
  { id: '7501040099882', name: 'Suero Electrolit Mora Azul 625ml', category: 'Bebidas', price: 32.00, cost: 23.50, stock: 15, minStock: 3, unit: 'pza', supplier: 'Pisa Farmacéutica', emoji: '🫐' },

  // 🥔 Botanas y Frituras
  { id: '7501011115893', name: 'Papas Sabritas Originales 45g', category: 'Botanas', price: 23.00, cost: 16.50, stock: 20, minStock: 6, unit: 'pza', supplier: 'PepsiCo Sabritas', emoji: '🥔' },
  { id: '7501011115894', name: 'Doritos Nachos Sabritas 62g', category: 'Botanas', price: 23.00, cost: 16.50, stock: 25, minStock: 6, unit: 'pza', supplier: 'PepsiCo Sabritas', emoji: '🔺' },
  { id: '7501011115895', name: 'Ruffles con Queso 50g', category: 'Botanas', price: 23.00, cost: 16.50, stock: 16, minStock: 5, unit: 'pza', supplier: 'PepsiCo Sabritas', emoji: '🧀' },
  { id: '7501011115896', name: 'Cheetos Torciditos Queso y Chile 55g', category: 'Botanas', price: 18.00, cost: 13.00, stock: 22, minStock: 6, unit: 'pza', supplier: 'PepsiCo Sabritas', emoji: '🐆' },
  { id: '7501000109988', name: 'Takis Fuego Barcel 62g', category: 'Botanas', price: 22.00, cost: 15.50, stock: 30, minStock: 8, unit: 'pza', supplier: 'Grupo Bimbo/Barcel', emoji: '🌶️' },
  { id: '7501000109989', name: 'Chips Jalapeño Barcel 55g', category: 'Botanas', price: 24.00, cost: 17.00, stock: 14, minStock: 4, unit: 'pza', supplier: 'Grupo Bimbo/Barcel', emoji: '🥔' },
  { id: '7501060987654', name: 'Cacahuates Japoneses Nishiyama 100g', category: 'Botanas', price: 15.00, cost: 9.50, stock: 18, minStock: 5, unit: 'pza', supplier: 'Nishiyama', emoji: '🥜' },
  { id: '7501060987655', name: 'Cacahuates Salados Hot Nuts 50g', category: 'Botanas', price: 17.00, cost: 11.00, stock: 12, minStock: 4, unit: 'pza', supplier: 'Barcel', emoji: '🥜' },

  // 🍞 Panadería y Galletas
  { id: '7501000111223', name: 'Pan Dulce Bimbo Conchas 2 pzs', category: 'Panadería', price: 26.00, cost: 19.00, stock: 8, minStock: 3, unit: 'pza', supplier: 'Grupo Bimbo', emoji: '🥐' },
  { id: '7501000111224', name: 'Pan Dulce Bimbo Donas Azucaradas 6 pzs', category: 'Panadería', price: 27.50, cost: 20.00, stock: 7, minStock: 3, unit: 'pza', supplier: 'Grupo Bimbo', emoji: '🍩' },
  { id: '7501000111225', name: 'Pan de Caja Blanco Bimbo Grande 680g', category: 'Panadería', price: 49.00, cost: 39.00, stock: 9, minStock: 3, unit: 'pza', supplier: 'Grupo Bimbo', emoji: '🍞' },
  { id: '7501000111226', name: 'Gansito Marinela 50g', category: 'Panadería', price: 19.00, cost: 13.50, stock: 24, minStock: 6, unit: 'pza', supplier: 'Marinela', emoji: '🦆' },
  { id: '7501000111227', name: 'Chocoroles Marinela 2 pzs 80g', category: 'Panadería', price: 24.00, cost: 17.50, stock: 15, minStock: 4, unit: 'pza', supplier: 'Marinela', emoji: '🍰' },
  { id: '7501000111228', name: 'Galletas Emperador Chocolate Gamesa 101g', category: 'Panadería', price: 21.00, cost: 14.50, stock: 28, minStock: 6, unit: 'pza', supplier: 'Gamesa', emoji: '🍪' },
  { id: '7501000111229', name: 'Galletas Marías Gamesa Rollo 170g', category: 'Panadería', price: 20.00, cost: 14.00, stock: 25, minStock: 5, unit: 'pza', supplier: 'Gamesa', emoji: '🍪' },
  { id: '7501000111230', name: 'Galletas Chokis Clásicas 57g', category: 'Panadería', price: 19.50, cost: 13.50, stock: 19, minStock: 5, unit: 'pza', supplier: 'Gamesa', emoji: '🍪' },

  // 🥛 Lácteos, Salchichonería y Huevo
  { id: '7501020512249', name: 'Leche Lala Entera Pasteurizada 1L', category: 'Lácteos', price: 28.00, cost: 22.00, stock: 16, minStock: 5, unit: 'litro', supplier: 'Grupo Lala', emoji: '🥛' },
  { id: '7501020512250', name: 'Leche Lala Deslactosada 1L', category: 'Lácteos', price: 29.50, cost: 23.50, stock: 12, minStock: 4, unit: 'litro', supplier: 'Grupo Lala', emoji: '🥛' },
  { id: '7501020512251', name: 'NutriLeche Producto Lácteo 1L', category: 'Lácteos', price: 23.00, cost: 17.50, stock: 20, minStock: 5, unit: 'litro', supplier: 'Grupo Lala', emoji: '🥛' },
  { id: '7501011199991', name: 'Crema Alpura Ácida Clásica 200ml', category: 'Lácteos', price: 22.00, cost: 16.00, stock: 10, minStock: 3, unit: 'pza', supplier: 'Alpura', emoji: '🍶' },
  { id: '7501011199992', name: 'Queso Panela FUD 200g', category: 'Lácteos', price: 39.00, cost: 29.00, stock: 6, minStock: 2, unit: 'pza', supplier: 'Sigma Alimentos', emoji: '🧀' },
  { id: '7501011199993', name: 'Salchicha de Pavo FUD Paquete 500g', category: 'Lácteos', price: 44.00, cost: 33.00, stock: 5, minStock: 2, unit: 'paq', supplier: 'Sigma Alimentos', emoji: '🌭' },
  { id: '7501011199994', name: 'Huevo Blanco San Juan 1kg (Aproximado)', category: 'Lácteos', price: 46.00, cost: 38.00, stock: 18, minStock: 5, unit: 'kg', supplier: 'Avícola San Juan', emoji: '🥚' },
  { id: '7501011199995', name: 'Yoghurt Yoplait Fresa para Beber 242g', category: 'Lácteos', price: 15.50, cost: 10.50, stock: 14, minStock: 4, unit: 'pza', supplier: 'Sigma Alimentos', emoji: '🍓' },

  // 🥫 Abarrotes y Despensa
  { id: '7501030456123', name: 'Aceite Vegetal Nutrioli 850ml', category: 'Abarrotes', price: 43.50, cost: 34.00, stock: 11, minStock: 4, unit: 'pza', supplier: 'Ragasa', emoji: '🌻' },
  { id: '7501030456124', name: 'Aceite 1-2-3 Mixto 1L', category: 'Abarrotes', price: 39.00, cost: 30.50, stock: 15, minStock: 4, unit: 'pza', supplier: 'Sánchez y Martín', emoji: '🍳' },
  { id: '7501000199001', name: 'Arroz Súper Extra Verde Valle 900g', category: 'Abarrotes', price: 29.50, cost: 22.00, stock: 14, minStock: 4, unit: 'pza', supplier: 'Verde Valle', emoji: '🍚' },
  { id: '7501000199002', name: 'Frijol Negro Verde Valle 900g', category: 'Abarrotes', price: 38.00, cost: 29.00, stock: 12, minStock: 4, unit: 'pza', supplier: 'Verde Valle', emoji: '🫘' },
  { id: '7501000199003', name: 'Frijoles Refritos Negros Isadora 430g', category: 'Abarrotes', price: 21.00, cost: 15.00, stock: 16, minStock: 4, unit: 'pza', supplier: 'Verde Valle', emoji: '🫘' },
  { id: '7501000199004', name: 'Atún Dolores en Agua Lata 140g', category: 'Abarrotes', price: 22.50, cost: 16.50, stock: 25, minStock: 6, unit: 'pza', supplier: 'Pinsa', emoji: '🐟' },
  { id: '7501000199005', name: 'Chiles Jalapeños La Costeña 220g', category: 'Abarrotes', price: 16.00, cost: 11.00, stock: 18, minStock: 5, unit: 'pza', supplier: 'La Costeña', emoji: '🌶️' },
  { id: '7501000199006', name: 'Pasta de Sopa Espagueti La Moderna 200g', category: 'Abarrotes', price: 11.50, cost: 7.50, stock: 35, minStock: 8, unit: 'pza', supplier: 'La Moderna', emoji: '🍝' },
  { id: '7501000199007', name: 'Puré de Tomate Del Fuerte 210g', category: 'Abarrotes', price: 10.50, cost: 6.80, stock: 28, minStock: 6, unit: 'pza', supplier: 'Del Fuerte', emoji: '🍅' },
  { id: '7501000199008', name: 'Mayonesa McCormick con Limón 390g', category: 'Abarrotes', price: 46.00, cost: 36.00, stock: 8, minStock: 3, unit: 'pza', supplier: 'McCormick', emoji: '🥪' },
  { id: '7501000199009', name: 'Café Soluble Nescafé Clásico 120g', category: 'Abarrotes', price: 74.00, cost: 58.00, stock: 6, minStock: 2, unit: 'pza', supplier: 'Nestlé', emoji: '☕' },
  { id: '7501000199010', name: 'Azúcar Estándar Granel 1kg', category: 'Abarrotes', price: 32.00, cost: 25.00, stock: 20, minStock: 5, unit: 'kg', supplier: 'Central de Abastos', emoji: '🧂' },

  // 🧹 Limpieza y Cuidado del Hogar
  { id: '7501040789012', name: 'Detergente en Polvo Roma 1kg', category: 'Limpieza', price: 39.50, cost: 29.50, stock: 8, minStock: 3, unit: 'pza', supplier: 'Fábrica La Corona', emoji: '🧼' },
  { id: '7501040789013', name: 'Jabón de Lavandería Zote Rosa 400g', category: 'Limpieza', price: 23.00, cost: 16.50, stock: 15, minStock: 4, unit: 'pza', supplier: 'Fábrica La Corona', emoji: '🧼' },
  { id: '7501040789014', name: 'Cloro Blanqueador Cloralex 950ml', category: 'Limpieza', price: 19.50, cost: 13.80, stock: 14, minStock: 4, unit: 'pza', supplier: 'Alen', emoji: '🧴' },
  { id: '7501040789015', name: 'Suavizante Suavitel Fresca Primavera 850ml', category: 'Limpieza', price: 26.00, cost: 19.00, stock: 10, minStock: 3, unit: 'pza', supplier: 'Colgate-Palmolive', emoji: '🌸' },
  { id: '7501040789016', name: 'Papel Higiénico Pétalo 4 Rollos', category: 'Limpieza', price: 34.00, cost: 25.00, stock: 12, minStock: 4, unit: 'paq', supplier: 'Kimberly-Clark', emoji: '🧻' },

  // 🍬 Dulces y Golosinas
  { id: '7501000888111', name: 'Paleta Payaso Ricolino 45g', category: 'Dulces', price: 18.00, cost: 12.00, stock: 18, minStock: 5, unit: 'pza', supplier: 'Ricolino/Mondelēz', emoji: '🤡' },
  { id: '7501000888112', name: 'Mazapán de la Rosa Gigante 50g', category: 'Dulces', price: 10.00, cost: 6.00, stock: 40, minStock: 10, unit: 'pza', supplier: 'Dulces de la Rosa', emoji: '🌹' },
  { id: '7501000888113', name: 'Gomitas Panditas Ricolino 65g', category: 'Dulces', price: 18.50, cost: 12.50, stock: 22, minStock: 6, unit: 'pza', supplier: 'Ricolino', emoji: '🐼' },
  { id: '7501000888114', name: 'Skwinkles Salsagheti Sandía 24g', category: 'Dulces', price: 15.00, cost: 9.80, stock: 25, minStock: 6, unit: 'pza', supplier: 'Mars Wrigley', emoji: '🍉' },
  { id: '7501000888115', name: 'Goma de Mascar Bubbaloo Mora 5 pzs', category: 'Dulces', price: 8.00, cost: 4.50, stock: 35, minStock: 8, unit: 'paq', supplier: 'Mondelēz', emoji: '🫧' }
];

export const INITIAL_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'CLI-001',
    name: 'Doña Mary (Casa Verde #12)',
    phone: '55-1234-5678',
    address: 'Calle Juárez #12',
    creditLimit: 500.00,
    currentDebt: 184.50,
    history: [
      { id: 'MOV-1', date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'charge', amount: 124.50, note: 'Coca 2.5L, Pan Bimbo y Huevo' },
      { id: 'MOV-2', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'charge', amount: 60.00, note: 'Aceite Nutrioli y Leche Lala' },
      { id: 'MOV-3', date: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'payment', amount: 0, note: 'Pendiente de abono' }
    ]
  },
  {
    id: 'CLI-002',
    name: 'Don Beto el Mecánico',
    phone: '55-9876-5432',
    address: 'Taller Mecánico El Pistón #45',
    creditLimit: 800.00,
    currentDebt: 340.00,
    history: [
      { id: 'MOV-4', date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'charge', amount: 440.00, note: 'Refrescos para el taller y botanas' },
      { id: 'MOV-5', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'payment', amount: 100.00, note: 'Abono en efectivo' }
    ]
  },
  {
    id: 'CLI-003',
    name: 'Familia Ramírez',
    phone: '55-5555-1122',
    address: 'Depto 4B',
    creditLimit: 300.00,
    currentDebt: 0.00,
    history: [
      { id: 'MOV-6', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'charge', amount: 200.00, note: 'Despensa quincenal' },
      { id: 'MOV-7', date: new Date(Date.now() - 86400000 * 4).toISOString(), type: 'payment', amount: 200.00, note: 'Liquidó cuenta total' }
    ]
  }
];

export const INITIAL_CASH_MOVEMENTS: CashMovement[] = [
  {
    id: 'CAJ-001',
    date: new Date(Date.now() - 3600000 * 7).toISOString(),
    type: 'in',
    amount: 500.00,
    concept: 'Apertura de turno - Fondo de cambio inicial',
    cashier: 'Alicia'
  },
  {
    id: 'CAJ-002',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'out',
    amount: 140.00,
    concept: 'Pago a repartidor de Pan Bimbo (factura #412)',
    cashier: 'Alicia'
  },
  {
    id: 'CAJ-003',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'out',
    amount: 45.00,
    concept: 'Compra de 2 bolsas de hielo para hielera',
    cashier: 'Alicia'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'VTA-823901',
    date: new Date(Date.now() - 3600000 * 6).toISOString(),
    items: [
      { productId: '7501055300018', name: 'Coca-Cola 600ml No Retornable', quantity: 2, price: 19.00, cost: 14.50 },
      { productId: '7501011115893', name: 'Papas Sabritas Originales 45g', quantity: 1, price: 23.00, cost: 16.50 }
    ],
    subtotal: 61.00,
    tax: 0,
    discount: 0,
    total: 61.00,
    paymentMethod: 'cash',
    cashReceived: 100.00,
    change: 39.00
  },
  {
    id: 'VTA-823902',
    date: new Date(Date.now() - 3600000 * 3).toISOString(),
    items: [
      { productId: '7501020512249', name: 'Leche Lala Entera Pasteurizada 1L', quantity: 2, price: 28.00, cost: 22.00 },
      { productId: '7501030456123', name: 'Aceite Vegetal Nutrioli 850ml', quantity: 1, price: 43.50, cost: 34.00 },
      { productId: '7501000111225', name: 'Pan de Caja Blanco Bimbo Grande 680g', quantity: 1, price: 49.00, cost: 39.00 }
    ],
    subtotal: 148.50,
    tax: 0,
    discount: 0,
    total: 148.50,
    paymentMethod: 'card'
  },
  {
    id: 'VTA-823903',
    date: new Date(Date.now() - 3600000 * 1).toISOString(),
    items: [
      { productId: '7501000109988', name: 'Takis Fuego Barcel 62g', quantity: 2, price: 22.00, cost: 15.50 },
      { productId: '7501005101010', name: 'Pepsi 600ml Regular', quantity: 2, price: 16.00, cost: 12.00 }
    ],
    subtotal: 76.00,
    tax: 0,
    discount: 0,
    total: 76.00,
    paymentMethod: 'cash',
    cashReceived: 100.00,
    change: 24.00
  }
];
