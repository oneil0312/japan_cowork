import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { TripPlan } from '../types';

export interface CloudTripSummary {
  id: string;
  title: string;
  dateRange: string;
  daysCount: number;
  ownerId: string;
  ownerEmail?: string;
  ownerName?: string;
  members?: string[];
  memberEmails?: string[];
  isPublic?: boolean;
  updatedAt: string;
}

// Save or Update trip in Firestore
export async function saveTripToCloud(trip: TripPlan, user: User, makePublic?: boolean): Promise<void> {
  const tripId = trip.id;
  const path = `trips/${tripId}`;

  const isOwner = !trip.ownerId || trip.ownerId === user.uid;

  // 只有建立者可以異動成員名單；一般成員儲存時保持名單原樣（否則會被安全規則拒絕）
  let updatedMembers = trip.members || [];
  let updatedMemberEmails = trip.memberEmails || [];
  if (isOwner) {
    if (!updatedMembers.includes(user.uid)) updatedMembers = [user.uid, ...updatedMembers];
    const userEmail = user.email ? user.email.toLowerCase().trim() : '';
    if (userEmail && !updatedMemberEmails.includes(userEmail)) {
      updatedMemberEmails = [userEmail, ...updatedMemberEmails];
    }
  }

  const payload: TripPlan = {
    ...trip,
    ownerId: trip.ownerId || user.uid,
    ownerEmail: trip.ownerEmail || user.email || '',
    ownerName: trip.ownerName || user.displayName || user.email?.split('@')[0] || '旅人',
    members: updatedMembers,
    memberEmails: updatedMemberEmails,
    isPublic: isOwner && makePublic !== undefined ? makePublic : (trip.isPublic ?? false),
    createdAt: trip.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'trips', tripId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load a specific trip by ID from Firestore
export async function getTripFromCloud(tripId: string): Promise<TripPlan | null> {
  const path = `trips/${tripId}`;
  try {
    const snap = await getDoc(doc(db, 'trips', tripId));
    if (snap.exists()) {
      return snap.data() as TripPlan;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Load all trips where the user is an owner or invited member
export async function getUserTrips(user: User): Promise<TripPlan[]> {
  const path = 'trips';
  const tripMap = new Map<string, TripPlan>();

  try {
    // 1. Trips owned by the user
    const qOwner = query(
      collection(db, 'trips'),
      where('ownerId', '==', user.uid)
    );
    const snapOwner = await getDocs(qOwner);
    snapOwner.forEach((d) => {
      const data = d.data() as TripPlan;
      tripMap.set(data.id, data);
    });

    // 2. Trips where user's UID is in members array
    try {
      const qMemberUid = query(
        collection(db, 'trips'),
        where('members', 'array-contains', user.uid)
      );
      const snapMemberUid = await getDocs(qMemberUid);
      snapMemberUid.forEach((d) => {
        const data = d.data() as TripPlan;
        tripMap.set(data.id, data);
      });
    } catch (e) {
      // ignore if index not needed
    }

    // 3. Trips where user's email is in memberEmails array
    if (user.email) {
      try {
        const userEmail = user.email.toLowerCase().trim();
        const qMemberEmail = query(
          collection(db, 'trips'),
          where('memberEmails', 'array-contains', userEmail)
        );
        const snapMemberEmail = await getDocs(qMemberEmail);
        snapMemberEmail.forEach((d) => {
          const data = d.data() as TripPlan;
          tripMap.set(data.id, data);
        });
      } catch (e) {
        // ignore if index not needed
      }
    }

    const trips = Array.from(tripMap.values());
    trips.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return trips;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Delete a trip from cloud (Owner only)
export async function deleteTripFromCloud(tripId: string): Promise<void> {
  const path = `trips/${tripId}`;
  try {
    await deleteDoc(doc(db, 'trips', tripId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sync user profile
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      displayName: user.displayName || '',
      email: user.email ? user.email.toLowerCase().trim() : '',
      photoURL: user.photoURL || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
