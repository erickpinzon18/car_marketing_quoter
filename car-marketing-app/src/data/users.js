export const USERS = [
  { 
    email: 'admin@carmarketing.mx', 
    password: 'admin123', 
    role: 'admin', 
    name: 'Administrador Global', 
    id: 'user_admin', 
    storeId: 'store_001' 
  },
  { 
    email: 'gerente@carmarketing.mx', 
    password: 'gerente123', 
    role: 'manager', 
    name: 'Gerente Tienda 1', 
    id: 'user_manager', 
    storeId: 'store_001' 
  },
  { 
    email: 'vendedor@carmarketing.mx', 
    password: 'vendedor123', 
    role: 'vendor', 
    name: 'Vendedor Estrella', 
    id: 'user_vendor', 
    storeId: 'store_001' 
  },
  // Additional users for testing filtering
  { 
    email: 'vendedor2@carmarketing.mx', 
    password: 'vendedor123', 
    role: 'vendor', 
    name: 'Vendedor Novato', 
    id: 'user_vendor_2', 
    storeId: 'store_001' 
  },
  { 
    email: 'gerente2@carmarketing.mx', 
    password: 'gerente123', 
    role: 'manager', 
    name: 'Gerente Tienda 2', 
    id: 'user_manager_2', 
    storeId: 'store_002' 
  },
  { 
    email: 'vendedor3@carmarketing.mx', 
    password: 'vendedor123', 
    role: 'vendor', 
    name: 'Vendedor Tienda 2', 
    id: 'user_vendor_3', 
    storeId: 'store_002' 
  }
];

export const STORES = {
  'store_001': { name: 'Sucursal Polanco', city: 'CDMX' },
  'store_002': { name: 'Sucursal Satélite', city: 'Edo. Mex' }
};
