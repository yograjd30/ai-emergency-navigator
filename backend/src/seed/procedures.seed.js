import 'dotenv/config';
import mongoose from 'mongoose';
import { setupMockMongoose } from '../lib/mockMongoose.js';

if (process.env.MOCK_DB !== 'false') {
  setupMockMongoose(mongoose);
}

import Procedure from '../models/Procedure.js';

const PROCEDURES = [
  {
    title: 'How to Dial 112 and What to Expect',
    titleLocalized: { hi: '112 कैसे डायल करें और क्या उम्मीद करें' },
    category: 'general',
    subcategory: 'emergency_call',
    difficulty: 'easy',
    timeEstimate: '2-5 minutes',
    requiredDocs: [],
    steps: [
      { stepNumber: 1, title: 'Dial 112', description: 'From any phone (mobile or landline), dial 112. This works even without a SIM card or balance.', tip: 'On most smartphones, you can also press the power button 5 times rapidly to auto-dial 112.' },
      { stepNumber: 2, title: 'Stay Calm and Speak Clearly', description: 'When connected, speak clearly. State your emergency type: Police, Fire, or Medical.', tip: '' },
      { stepNumber: 3, title: 'Provide Your Location', description: 'Give your exact location — address, nearby landmarks, or GPS coordinates if available.', tip: 'Keep GPS/location services enabled on your phone for automatic location sharing.' },
      { stepNumber: 4, title: 'Describe the Emergency', description: 'Briefly describe what happened — number of people involved, injuries, immediate dangers.', tip: '' },
      { stepNumber: 5, title: 'Follow Instructions', description: 'The operator may give you specific instructions. Follow them carefully and stay on the line until told to disconnect.', tip: 'Do not hang up until the operator says it is okay to do so.' },
    ],
    relatedLinks: [
      { label: 'ERSS 112 India', url: 'https://112.gov.in' },
    ],
  },
  {
    title: 'How to File an FIR (First Information Report)',
    titleLocalized: { hi: 'FIR (प्रथम सूचना रिपोर्ट) कैसे दर्ज करें' },
    category: 'police',
    subcategory: 'online_fir',
    difficulty: 'moderate',
    timeEstimate: '30-60 minutes',
    requiredDocs: ['Government ID (Aadhar/Voter ID/Passport)', 'Address Proof', 'Evidence (photos, receipts, messages)'],
    steps: [
      { stepNumber: 1, title: 'Visit Your Nearest Police Station', description: 'Go to the police station that has jurisdiction over the area where the incident occurred. You can also file online in many states.', tip: 'You have the legal right to file an FIR at ANY police station under Section 154 of CrPC. No police station can refuse.' },
      { stepNumber: 2, title: 'Meet the Duty Officer', description: 'Ask for the duty officer or Station House Officer (SHO). Explain that you want to file an FIR.', tip: '' },
      { stepNumber: 3, title: 'Provide Your Details', description: 'Give your full name, address, phone number, and government ID details.', tip: '' },
      { stepNumber: 4, title: 'Narrate the Incident', description: 'Describe the incident in detail — what happened, when (date and time), where (location), who was involved (descriptions of suspects), and what was lost/damaged.', tip: 'Be as specific as possible. Include registration numbers, serial numbers of stolen items, etc.' },
      { stepNumber: 5, title: 'Provide Evidence', description: 'Submit any evidence — photographs, CCTV footage, receipts, messages, or witness details.', tip: '' },
      { stepNumber: 6, title: 'Review the Written FIR', description: 'The officer will write the FIR. Read it carefully. Ensure all facts are correctly recorded. Request corrections if needed.', tip: '' },
      { stepNumber: 7, title: 'Sign and Get Your Copy', description: 'Sign the FIR after verification. Demand your free copy — this is your legal right. Note down the FIR number.', tip: 'Under Section 154(2) CrPC, you are entitled to a free copy of the FIR.' },
      { stepNumber: 8, title: 'Online FIR Option', description: 'Many states allow online FIR filing through their police department websites. Search for "[your state] online FIR" or visit the state police website.', tip: 'Online FIRs are typically available for theft, lost property, and vehicle-related crimes.' },
    ],
    relatedLinks: [
      { label: 'Delhi Police Online FIR', url: 'https://www.delhipolice.nic.in' },
      { label: 'Maharashtra Citizen Portal', url: 'https://citizen.mahapolice.gov.in' },
    ],
  },
  {
    title: 'How to Report Cybercrime Online',
    titleLocalized: { hi: 'ऑनलाइन साइबर अपराध की रिपोर्ट कैसे करें' },
    category: 'cybercrime',
    subcategory: 'online_report',
    difficulty: 'moderate',
    timeEstimate: '15-30 minutes',
    requiredDocs: ['Government ID', 'Bank/UPI transaction details', 'Screenshots of fraud messages/calls', 'Email headers if phishing'],
    steps: [
      { stepNumber: 1, title: 'Call 1930 Immediately (for Financial Fraud)', description: 'If you lost money to a scam, call the cybercrime helpline 1930 immediately. Quick reporting increases recovery chances.', tip: 'Call within the "Golden Hour" — the first hour after fraud — for the best chance of recovering your money.' },
      { stepNumber: 2, title: 'Visit cybercrime.gov.in', description: 'Go to the National Cyber Crime Reporting Portal at https://cybercrime.gov.in', tip: '' },
      { stepNumber: 3, title: 'Register / Login', description: 'Click "File a Complaint". Register with your mobile number and verify via OTP.', tip: '' },
      { stepNumber: 4, title: 'Select Complaint Category', description: 'Choose the appropriate category: Financial Fraud, Women/Child Related Crime, or Other Cybercrime.', tip: '' },
      { stepNumber: 5, title: 'Fill in Incident Details', description: 'Provide complete details: date, time, how the fraud happened, suspect details, financial loss amount, and bank/UPI details.', tip: 'Include the fraudster\'s phone number, email, UPI ID, or bank account number if available.' },
      { stepNumber: 6, title: 'Upload Evidence', description: 'Upload screenshots of messages, call recordings, bank statements, transaction IDs, and any other evidence.', tip: '' },
      { stepNumber: 7, title: 'Submit and Note Complaint Number', description: 'Submit the complaint and save your complaint acknowledgment number for tracking.', tip: 'You can track your complaint status at cybercrime.gov.in using the complaint number.' },
      { stepNumber: 8, title: 'Inform Your Bank', description: 'Contact your bank\'s fraud helpline immediately. Request them to freeze the transaction and block the compromised account/card.', tip: 'Most banks have 24/7 fraud helplines. Check the back of your debit/credit card for the number.' },
    ],
    relatedLinks: [
      { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in' },
      { label: 'RBI Guidelines on Fraud', url: 'https://www.rbi.org.in' },
    ],
  },
  {
    title: 'How to File a Missing Person Report',
    titleLocalized: { hi: 'गुमशुदगी की रिपोर्ट कैसे दर्ज करें' },
    category: 'missing_person',
    subcategory: 'missing_person_report',
    difficulty: 'moderate',
    timeEstimate: '30-45 minutes',
    requiredDocs: ['Recent photograph of missing person', 'Government ID of complainant', 'Details of last known location and clothing'],
    steps: [
      { stepNumber: 1, title: 'Call 100 or 112 Immediately', description: 'Report the missing person to the police helpline. For missing children, also call 1098 (Childline).', tip: 'There is NO mandatory waiting period. Police must register a missing person report immediately — this is the law.' },
      { stepNumber: 2, title: 'Visit the Nearest Police Station', description: 'Go to the police station nearest to where the person went missing or was last seen.', tip: '' },
      { stepNumber: 3, title: 'Provide Detailed Description', description: 'Give a complete description: full name, age, height, weight, complexion, hair color, identifying marks (scars, tattoos, birthmarks), and clothing when last seen.', tip: '' },
      { stepNumber: 4, title: 'Submit Recent Photograph', description: 'Provide the most recent clear photograph of the missing person. Multiple photos from different angles are helpful.', tip: '' },
      { stepNumber: 5, title: 'Share Last Known Details', description: 'Inform police about: last known location, time last seen, who they were with, phone number, and any recent unusual behavior.', tip: '' },
      { stepNumber: 6, title: 'Register on Track Missing Child Portal', description: 'For missing children, also register on trackthemissingchild.gov.in', tip: '' },
      { stepNumber: 7, title: 'Spread Information', description: 'Share the missing person\'s photo and details on social media. Contact local hospitals, shelters, and bus/railway stations.', tip: '' },
    ],
    relatedLinks: [
      { label: 'Track Missing Child Portal', url: 'https://trackthemissingchild.gov.in' },
    ],
  },
  {
    title: 'What to Do During a Medical Emergency',
    titleLocalized: { hi: 'चिकित्सा आपातकाल में क्या करें' },
    category: 'ambulance',
    subcategory: 'medical_first_response',
    difficulty: 'moderate',
    timeEstimate: 'Immediate',
    requiredDocs: [],
    steps: [
      { stepNumber: 1, title: 'Call for Help Immediately', description: 'Call 108 (ambulance) or 112 (unified emergency). State "medical emergency", your location, and nature of the emergency.', tip: '' },
      { stepNumber: 2, title: 'Assess the Situation', description: 'Check if the person is conscious, breathing, and has a pulse. Do not move the person unless they are in immediate danger (fire, water, traffic).', tip: '' },
      { stepNumber: 3, title: 'Perform Basic First Aid', description: 'If trained, perform CPR if the person is not breathing. Apply pressure to any bleeding wounds with a clean cloth. If choking, perform the Heimlich maneuver.', tip: 'If you\'re unsure, keep the person still and comfortable until help arrives.' },
      { stepNumber: 4, title: 'Keep the Person Comfortable', description: 'Loosen tight clothing. If conscious, keep them calm and talking. If unconscious but breathing, place in the recovery position (on their side).', tip: '' },
      { stepNumber: 5, title: 'Gather Information for Paramedics', description: 'Note: the person\'s name, age, any known medical conditions, medications they take, and allergies. Have this ready for the ambulance crew.', tip: '' },
      { stepNumber: 6, title: 'Do Not Give Food or Water', description: 'Do not give anything by mouth to an unconscious person. For conscious patients, avoid food/water until medical help arrives.', tip: '' },
      { stepNumber: 7, title: 'Guide the Ambulance', description: 'Send someone to the road/entrance to guide the ambulance to the exact location. Keep the path clear.', tip: '' },
    ],
    relatedLinks: [
      { label: 'Indian Red Cross First Aid Guide', url: 'https://www.indianredcross.org' },
    ],
  },
  {
    title: 'How to Report Domestic Violence',
    titleLocalized: { hi: 'घरेलू हिंसा की रिपोर्ट कैसे करें' },
    category: 'domestic_violence',
    subcategory: 'dv_report',
    difficulty: 'moderate',
    timeEstimate: '30-60 minutes',
    requiredDocs: ['Government ID', 'Medical reports (if applicable)', 'Photographs of injuries', 'Marriage certificate (if applicable)'],
    steps: [
      { stepNumber: 1, title: 'Ensure Your Immediate Safety', description: 'If you are in immediate danger, call 112 or 181 (Women Helpline). Leave the premises if possible and go to a trusted neighbor, friend, or shelter.', tip: '' },
      { stepNumber: 2, title: 'Call the Women Helpline', description: 'Call 181 (available 24/7) or 1091. You can speak in your preferred language. They will guide you on next steps.', tip: 'You can also reach out via WhatsApp to 7827-170-170 (NCW).' },
      { stepNumber: 3, title: 'Document the Violence', description: 'If safe to do so, photograph injuries, damaged property, and threatening messages. Keep a written record of incidents with dates.', tip: 'Store evidence in a safe place the abuser cannot access — a trusted friend\'s house or cloud storage.' },
      { stepNumber: 4, title: 'Get Medical Attention', description: 'Visit a hospital. Get your injuries documented in a medical report (MLC — Medico-Legal Case). This serves as evidence.', tip: '' },
      { stepNumber: 5, title: 'File a Police Complaint', description: 'File an FIR at your nearest police station. Under the Protection of Women from Domestic Violence Act, 2005, domestic violence is a criminal offense.', tip: 'The police cannot refuse to register your complaint. If they do, approach the SP or file online.' },
      { stepNumber: 6, title: 'Apply for Protection Order', description: 'Through a lawyer or legal aid services, apply for a protection order from the Magistrate court. This legally prevents the abuser from contacting you.', tip: 'Free legal aid is available through DLSA (District Legal Services Authority).' },
      { stepNumber: 7, title: 'Seek Shelter if Needed', description: 'Contact the One Stop Centre (181) for temporary shelter, legal aid, medical help, and counseling — all under one roof.', tip: '' },
    ],
    relatedLinks: [
      { label: 'National Commission for Women', url: 'http://ncw.nic.in' },
      { label: 'One Stop Centre Scheme', url: 'http://wcd.nic.in' },
    ],
  },
  {
    title: 'What to Do During an Earthquake',
    titleLocalized: { hi: 'भूकंप के दौरान क्या करें' },
    category: 'disaster',
    subcategory: 'earthquake',
    difficulty: 'easy',
    timeEstimate: 'Immediate',
    requiredDocs: [],
    steps: [
      { stepNumber: 1, title: 'DROP, COVER, HOLD ON', description: 'Immediately DROP to the ground, take COVER under a sturdy desk or table, and HOLD ON to it until the shaking stops.', tip: 'This is the internationally recommended response. Do NOT run outside during shaking.' },
      { stepNumber: 2, title: 'If Indoors, Stay Indoors', description: 'Stay away from windows, mirrors, heavy furniture, and objects that could fall. Move to an interior wall if no table is available. Protect your head and neck with your arms.', tip: '' },
      { stepNumber: 3, title: 'If Outdoors, Move to Open Area', description: 'Move away from buildings, power lines, trees, and walls. Drop to the ground and protect your head.', tip: '' },
      { stepNumber: 4, title: 'If Driving, Pull Over', description: 'Pull over to the side of the road, stop, and stay inside the vehicle. Avoid bridges, overpasses, and power lines.', tip: '' },
      { stepNumber: 5, title: 'After Shaking Stops — Check for Injuries', description: 'Check yourself and others for injuries. Provide first aid if needed. Do not move seriously injured persons.', tip: '' },
      { stepNumber: 6, title: 'Check for Hazards', description: 'Look for gas leaks (smell), electrical damage (sparks), and structural damage. If you smell gas, open windows and leave immediately.', tip: '' },
      { stepNumber: 7, title: 'Be Prepared for Aftershocks', description: 'Aftershocks may follow. Stay alert and be ready to DROP, COVER, HOLD ON again. Evacuate if the building is damaged.', tip: 'Aftershocks can occur minutes, hours, or even days after the main earthquake.' },
      { stepNumber: 8, title: 'Contact Authorities', description: 'Call 112 or 1078 (NDMA) if you need rescue or medical assistance. Listen to official announcements on radio/TV.', tip: '' },
    ],
    relatedLinks: [
      { label: 'NDMA Earthquake Guidelines', url: 'https://ndma.gov.in' },
    ],
  },
  {
    title: 'What to Do During a Flood',
    titleLocalized: { hi: 'बाढ़ के दौरान क्या करें' },
    category: 'disaster',
    subcategory: 'flood',
    difficulty: 'moderate',
    timeEstimate: 'Immediate',
    requiredDocs: [],
    steps: [
      { stepNumber: 1, title: 'Move to Higher Ground Immediately', description: 'If flooding is imminent or occurring, move to the highest floor of your building or to higher ground. Do not wait for instructions if water is rising.', tip: 'Just 6 inches of moving water can knock you down. 2 feet of water can float a car.' },
      { stepNumber: 2, title: 'Avoid Walking in Floodwater', description: 'Do not walk through moving water. It may contain sewage, chemicals, sharp objects, or live electrical wires.', tip: '' },
      { stepNumber: 3, title: 'Do Not Drive Through Flooded Roads', description: 'Turn around, don\'t drown. Most flood deaths occur in vehicles. If your car stalls in water, abandon it immediately and move to higher ground.', tip: '' },
      { stepNumber: 4, title: 'Disconnect Electrical Appliances', description: 'Switch off main electrical supply if safe to do so. Do not touch electrical equipment if standing in water.', tip: '' },
      { stepNumber: 5, title: 'Call for Help', description: 'Call 112 or 1078 (NDMA) for rescue. If trapped, move to the roof and signal for help. Use a torch or bright cloth.', tip: '' },
      { stepNumber: 6, title: 'Store Emergency Supplies', description: 'Keep drinking water, dry food, medicines, torch, phone charger, and important documents in a waterproof bag at height.', tip: '' },
      { stepNumber: 7, title: 'After Flood — Stay Cautious', description: 'Do not return home until authorities declare it safe. Check for structural damage before entering. Boil all drinking water. Watch for snakes and insects.', tip: '' },
    ],
    relatedLinks: [
      { label: 'NDMA Flood Guidelines', url: 'https://ndma.gov.in' },
      { label: 'India Meteorological Department', url: 'https://mausam.imd.gov.in' },
    ],
  },
  {
    title: 'How to Apply for a Duplicate Aadhar Card',
    titleLocalized: { hi: 'डुप्लीकेट आधार कार्ड के लिए कैसे आवेदन करें' },
    category: 'general',
    subcategory: 'document_reissue',
    difficulty: 'easy',
    timeEstimate: '15-30 minutes',
    requiredDocs: ['Aadhar number (if remembered)', 'Registered mobile number', 'Any other government ID for verification'],
    steps: [
      { stepNumber: 1, title: 'Visit UIDAI Website', description: 'Go to https://uidai.gov.in or https://myaadhaar.uidai.gov.in', tip: '' },
      { stepNumber: 2, title: 'Click "Order Aadhar Reprint"', description: 'Select "Order Aadhar Reprint" option. This will send a PVC Aadhar card to your registered address for ₹50.', tip: '' },
      { stepNumber: 3, title: 'Enter Aadhar Number', description: 'Enter your 12-digit Aadhar number or 16-digit Virtual ID.', tip: 'If you don\'t remember your Aadhar number, click "Retrieve Lost UID/EID" to get it via registered mobile.' },
      { stepNumber: 4, title: 'Verify via OTP', description: 'An OTP will be sent to your registered mobile number. Enter it to verify your identity.', tip: '' },
      { stepNumber: 5, title: 'Pay the Fee', description: 'Pay ₹50 via debit card, credit card, net banking, or UPI.', tip: '' },
      { stepNumber: 6, title: 'Download e-Aadhar (Immediate)', description: 'You can immediately download your e-Aadhar (PDF) from the same portal. This is legally valid as the physical card.', tip: 'The e-Aadhar PDF is password protected. Password = first 4 letters of your name (CAPS) + birth year.' },
      { stepNumber: 7, title: 'Receive PVC Card by Post', description: 'The physical PVC Aadhar card will be delivered to your registered address within 15-30 days.', tip: '' },
    ],
    relatedLinks: [
      { label: 'UIDAI Official Website', url: 'https://uidai.gov.in' },
      { label: 'Download e-Aadhar', url: 'https://myaadhaar.uidai.gov.in' },
    ],
  },
  {
    title: 'How to File a Consumer Complaint Online',
    titleLocalized: { hi: 'ऑनलाइन उपभोक्ता शिकायत कैसे दर्ज करें' },
    category: 'general',
    subcategory: 'consumer_complaint',
    difficulty: 'moderate',
    timeEstimate: '20-40 minutes',
    requiredDocs: ['Purchase receipt/invoice', 'Product/service details', 'Communication with seller/company', 'Government ID'],
    steps: [
      { stepNumber: 1, title: 'Call Consumer Helpline', description: 'First, try calling the National Consumer Helpline at 1800-11-4000 (toll-free) for guidance and mediation.', tip: 'Many complaints are resolved at this stage through mediation.' },
      { stepNumber: 2, title: 'Visit Consumer Commission Portal', description: 'Go to https://edaakhil.nic.in — the eDaakhil portal for filing consumer complaints online.', tip: '' },
      { stepNumber: 3, title: 'Register on the Portal', description: 'Create an account using your mobile number and email. Verify via OTP.', tip: '' },
      { stepNumber: 4, title: 'File Your Complaint', description: 'Click "File New Complaint". Select the appropriate Consumer Commission (District, State, or National) based on your claim amount.', tip: 'District Commission: Up to ₹1 Crore. State Commission: ₹1-10 Crore. National Commission: Above ₹10 Crore.' },
      { stepNumber: 5, title: 'Provide Complaint Details', description: 'Fill in: seller/company details, nature of complaint, product/service details, deficiency description, and relief sought.', tip: '' },
      { stepNumber: 6, title: 'Upload Evidence', description: 'Upload purchase receipts, warranty cards, communication records, photos of defective products, and any other supporting documents.', tip: '' },
      { stepNumber: 7, title: 'Pay Court Fee (if applicable)', description: 'Pay the nominal court fee online. Fee varies by claim amount (₹100 to ₹5000).', tip: '' },
      { stepNumber: 8, title: 'Track Your Complaint', description: 'Track complaint status on the portal using your case number. Attend hearings as scheduled (can be virtual).', tip: '' },
    ],
    relatedLinks: [
      { label: 'eDaakhil Consumer Portal', url: 'https://edaakhil.nic.in' },
      { label: 'Consumer Helpline', url: 'https://consumerhelpline.gov.in' },
    ],
  },
];

async function seedProcedures() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Procedure.deleteMany({});
    console.log('Cleared existing procedures');

    const result = await Procedure.insertMany(PROCEDURES);
    console.log(`✅ Seeded ${result.length} procedures`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedProcedures();
