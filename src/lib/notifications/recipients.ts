export type RecipientKey = 'peter' | 'leena' | 'eric' | 'erron';
export type RecipientRole = 'patient' | 'caregiver';

export interface Recipient {
  key: RecipientKey;
  name: string;
  phone: string;
  email?: string;
  role: RecipientRole;
  /** Maps to patients.name in Supabase (Father / Mother) */
  patientName?: string;
}

/** Fixed allowlist — only these contacts can receive notifications. */
export const RECIPIENTS: Record<RecipientKey, Recipient> = {
  peter: {
    key: 'peter',
    name: 'Peter',
    phone: '+919825707117',
    role: 'patient',
    patientName: 'Father',
  },
  leena: {
    key: 'leena',
    name: 'Leena',
    phone: '+919925025173',
    role: 'patient',
    patientName: 'Mother',
  },
  eric: {
    key: 'eric',
    name: 'Eric',
    phone: '+919727715703',
    email: 'ericpeterthomas15@gmail.com',
    role: 'caregiver',
  },
  erron: {
    key: 'erron',
    name: 'Erron',
    phone: '+919723126911',
    role: 'caregiver',
  },
};

export const PATIENT_RECIPIENTS = Object.values(RECIPIENTS).filter(r => r.role === 'patient');
export const CAREGIVER_RECIPIENTS = Object.values(RECIPIENTS).filter(r => r.role === 'caregiver');

export function getRecipientByPatientName(patientName: string): Recipient | undefined {
  return PATIENT_RECIPIENTS.find(r => r.patientName === patientName);
}
