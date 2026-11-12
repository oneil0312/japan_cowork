export type ItemCategory = 'spot' | 'food' | 'transport' | 'hotel' | 'shopping' | 'experience' | 'note';

export interface ItineraryItem {
  id: string;
  time: string;
  location: string;
  notes: string;
  category?: ItemCategory;
  isMustVisit?: boolean;
  cost?: string;
  mapQuery?: string;
  completed?: boolean;
}

export interface DayPlan {
  id: string;
  date: string;
  week: string;
  title: string;
  desc: string;
  stamp?: string;
  mapRegions: string[];
  stops: ItineraryItem[];
}

export interface FlightInfo {
  id: string;
  type: 'outbound' | 'inbound';
  label: string;
  route: string;
  flightNumber: string;
  notes?: string;
}

export interface Accommodation {
  id: string;
  name: string;
  dates: string;
  notes: string;
  symbol: string;
  link?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MapNode {
  x: number;
  y: number;
  label: string;
}

export interface EmergencyInfo {
  passportNumber?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insuranceEmergencyPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface TripPlan {
  id: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
  members?: string[];
  memberEmails?: string[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  poem: string;
  dateRange: string;
  startDate: string; // ISO format or string
  departureTime: string; // for countdown
  arrivalTime: string;
  description: string;
  sealText: string;
  flights: FlightInfo[];
  days: DayPlan[];
  stays: Accommodation[];
  checklist: ChecklistItem[];
  winterNote: string;
  mapNodes: Record<string, MapNode>;
  emergencyInfo?: EmergencyInfo;
  weatherCityKey?: string;
}
