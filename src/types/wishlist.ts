export interface GiftItem {
  id: string;
  title: string;
  storeName: string;
  category: string;
  productUrl: string;
  imageUrl: string;
  price?: number | null;
  note?: string;
}

export interface WishlistConfig {
  brandTitle: string;
  recipientName: string;
  occasionLabel: string;
  greetingTitle: string;
  greetingMessage: string;
  heroImageUrl: string;
}

export interface WishlistData {
  config: WishlistConfig;
  items: GiftItem[];
}
