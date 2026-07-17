export interface ProductType {
  id: string;
  slug: string;
  name: string;
  platform: string;
  lowestPrice: number;
  warrantyPrice: number;
  channelCount: number;
  updatedAt: string | null;
  shortDesc?: string;
  searchKeywords?: string[];
  sort_order: number;
  display_id?: string;
}

export interface ProductDetail {
  id: string;
  typeId: string;
  status: 'in_stock' | 'out_of_stock' | 'offline';
  channel: string;
  channelType: string;
  includedTime: string;
  operateTime: string;
  originalName: string;
  price: number;
  url?: string;
  updateTime: string;
  risk: 'low' | 'medium' | 'high';
  inventory?: number | null;
}
