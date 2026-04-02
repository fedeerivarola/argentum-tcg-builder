import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, serverTimestamp, increment, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Card, CardStatus, CardFormData, Vote, SortOption } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const cardService = {
  async createCard(userId: string, formData: CardFormData, imageUrl: string): Promise<string> {
    const cardsRef = collection(db, 'cards');
    const docRef = await addDoc(cardsRef, {
      userId, title: formData.title, type: formData.type, subtype: formData.subtype,
      description: formData.description, attack: formData.attack ?? null, life: formData.life ?? null,
      manaCost: formData.manaCost, artist: formData.artist, status: CardStatus.PENDING,
      designId: null, imageUrl: imageUrl, createdAt: serverTimestamp(), averageRating: 0, voteCount: 0
    });
    await updateDoc(doc(db, 'users', userId), { cardCount: increment(1) });
    return docRef.id;
  },
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Error al subir la imagen');
    }
    
    const data = await response.json();
    return data.url;
  },
  async getMyCards(userId: string): Promise<Card[]> {
    const q = query(collection(db, 'cards'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Card))
      .filter(card => card.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async getPendingCards(): Promise<Card[]> {
    const q = query(collection(db, 'cards'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Card))
      .filter(card => card.status === CardStatus.PENDING)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  async getApprovedCards(sortBy: SortOption = 'date', page = 0): Promise<Card[]> {
    const q = query(collection(db, 'cards'));
    const snapshot = await getDocs(q);
    let cards = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Card))
      .filter(card => card.status === CardStatus.APPROVED || card.status === CardStatus.PUBLISHED);
    
    switch (sortBy) {
      case 'rating': cards.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)); break;
      case 'votes': cards.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)); break;
      default: cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    const pageSize = 20;
    return cards.slice(page * pageSize, (page + 1) * pageSize);
  },
  async approveCard(cardId: string): Promise<void> { await updateDoc(doc(db, 'cards', cardId), { status: CardStatus.APPROVED, approvedAt: serverTimestamp() }); },
  async rejectCard(cardId: string, comment: string): Promise<void> { await updateDoc(doc(db, 'cards', cardId), { status: CardStatus.REJECTED, rejectionComment: comment }); },
  async deleteCard(cardId: string): Promise<void> { await deleteDoc(doc(db, 'cards', cardId)); }
};

export const voteService = {
  async vote(cardId: string, voterId: string, rating: number, comment?: string): Promise<void> {
    const voteId = `${cardId}_${voterId}`;
    const voteRef = doc(db, 'votes', voteId);
    const existingVote = await getDoc(voteRef);
    const isNewVote = !existingVote.exists();
    
    if (isNewVote) {
      await setDoc(voteRef, { cardId, voterId, rating, comment: comment || null, createdAt: serverTimestamp() });
    } else {
      await updateDoc(voteRef, { rating, comment: comment || null, createdAt: serverTimestamp() });
    }
    
    await updateCardRatings(cardId, isNewVote ? 1 : 0, rating, existingVote.exists() ? existingVote.data().rating : 0);
  },
  async getVote(cardId: string, voterId: string): Promise<Vote | null> {
    const voteRef = doc(db, 'votes', `${cardId}_${voterId}`);
    const voteSnap = await getDoc(voteRef);
    if (voteSnap.exists()) return { id: voteSnap.id, ...voteSnap.data() } as Vote;
    return null;
  }
};

async function updateCardRatings(cardId: string, newVoteCount: number, newRating: number, oldRating: number): Promise<void> {
  const cardRef = doc(db, 'cards', cardId);
  const cardSnap = await getDoc(cardRef);
  if (cardSnap.exists()) {
    const cardData = cardSnap.data();
    const currentVoteCount = cardData.voteCount || 0;
    const currentTotal = (cardData.averageRating || 0) * currentVoteCount;
    const newTotal = currentTotal - oldRating + newRating;
    const finalCount = currentVoteCount + newVoteCount;
    const newAverage = finalCount > 0 ? newTotal / finalCount : 0;
    const updateData: Record<string, unknown> = { averageRating: newAverage, voteCount: finalCount };
    if (newAverage >= 4.0) { updateData.status = CardStatus.PUBLISHED; updateData.publishedAt = serverTimestamp(); }
    await updateDoc(cardRef, updateData);
  }
}
