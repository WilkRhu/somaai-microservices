export enum BusinessRole {
  OWNER = 'business_owner',
  ADMIN = 'business_admin',
  SALES = 'business_sales',
  STOCK = 'business_stock',
  MARKETING = 'business_marketing',
}

export const BUSINESS_ROLE_HIERARCHY = {
  [BusinessRole.OWNER]: 5,
  [BusinessRole.ADMIN]: 4,
  [BusinessRole.SALES]: 2,
  [BusinessRole.STOCK]: 2,
  [BusinessRole.MARKETING]: 2,
};

export const BUSINESS_ROLE_PERMISSIONS = {
  [BusinessRole.OWNER]: [
    'manage_establishment',
    'manage_users',
    'manage_settings',
    'manage_billing',
    'manage_sales',
    'manage_inventory',
    'manage_customers',
    'manage_suppliers',
    'manage_offers',
    'manage_expenses',
    'view_analytics',
    'delete_establishment',
    'manage_integrations',
  ],
  [BusinessRole.ADMIN]: [
    'manage_users',
    'manage_settings',
    'manage_sales',
    'manage_inventory',
    'manage_customers',
    'manage_suppliers',
    'manage_offers',
    'manage_expenses',
    'view_analytics',
    'manage_campaigns',
  ],
  [BusinessRole.SALES]: [
    'create_sales',
    'manage_customers',
    'emit_invoices',
    'view_inventory',
    'view_analytics_sales',
  ],
  [BusinessRole.STOCK]: [
    'manage_inventory',
    'manage_suppliers',
    'create_purchase_orders',
    'receive_goods',
    'view_analytics_stock',
  ],
  [BusinessRole.MARKETING]: [
    'manage_campaigns',
    'create_promotions',
    'view_analytics_marketing',
    'manage_customers_view',
    'access_analytics',
  ],
};

