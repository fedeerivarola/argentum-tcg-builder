export enum CardType {
  CREATURE = 'criatura',
  SPELL = 'hechizo',
  ENCHANTMENT = 'encantamiento',
  ARTIFACT = 'artefacto',
  PLANESWALKER = 'planeswalker',
  LAND = 'tierra'
}

export const CARD_TYPES = [
  { value: CardType.CREATURE, label: 'Criatura' },
  { value: CardType.SPELL, label: 'Hechizo' },
  { value: CardType.ENCHANTMENT, label: 'Encantamiento' },
  { value: CardType.ARTIFACT, label: 'Artefacto' },
  { value: CardType.PLANESWALKER, label: 'Planeswalker' },
  { value: CardType.LAND, label: 'Tierra' },
];

export const SUBTYPES: Record<CardType, string[]> = {
  [CardType.CREATURE]: ['Guerrero', 'Mago', 'Bestia', 'No-muerto', 'Dragón', 'Ángel', 'Demonio'],
  [CardType.SPELL]: ['Instantáneo', 'Conjuración'],
  [CardType.ENCHANTMENT]: ['Aura', 'Saga'],
  [CardType.ARTIFACT]: ['Equipo', 'Tesoro'],
  [CardType.PLANESWALKER]: ['Azorius', 'Dimir', 'Rakdos', 'Gruul', 'Selesnya', 'Orzhov', 'Izzet', 'Golgari', 'Boros', 'Simic'],
  [CardType.LAND]: ['Básico', 'Dual'],
};

export enum CardStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published'
}

export interface User {
  uid: string;
  nickname: string;
  email: string;
  publicName?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  cardCount: number;
}

export interface Card {
  id: string;
  userId: string;
  designId: string;
  title: string;
  type: CardType;
  subtype: string;
  description: string;
  attack?: number;
  life?: number;
  manaCost: number;
  artist: string;
  status: CardStatus;
  rejectionComment?: string;
  finalImageUrl?: string;
  createdAt: Date;
  approvedAt?: Date;
  publishedAt?: Date;
  imageUrl?: string;
  averageRating?: number;
  voteCount?: number;
}

export interface Vote {
  id: string;
  cardId: string;
  voterId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface CardFormData {
  title: string;
  type: CardType;
  subtype: string;
  description: string;
  attack?: number;
  life?: number;
  manaCost: number;
  artist: string;
  image?: File;
  imageUrl?: string;
}

export type SortOption = 'date' | 'rating' | 'votes';
