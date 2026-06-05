export interface Helpline {
  _id: string;
  name: string;
  nameLocalized?: Record<string, string>;
  number: string;
  altNumbers?: string[];
  category: string;
  agency: string;
  description: string;
  descLocalized?: Record<string, string>;
  hours: string;
  state: string;
  priority: number;
  isEmergency: boolean;
  active: boolean;
  localizedName?: string;
  localizedDesc?: string;
}
