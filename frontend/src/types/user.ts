export interface User {
  _id: string;
  displayName: string;
  email: string;
  avatar: string;
  preferredLang: string;
  location: {
    state: string;
    city: string;
  };
  emergencyContacts: EmergencyContact[];
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}
