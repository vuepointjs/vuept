// PV (Pharmacovigilance) Applets
/*
    Requirements:
      key: Exactly 2 characters, unique (case-insensitive)
      longName: Max 30 characters
      name: Max 12 characters
*/
module.exports = [
  {
    key: 'Pt',
    ord: 1,
    longName: 'Patients',
    name: 'Patients',
    iconColor: null
  },
  {
    key: 'BV',
    ord: 2,
    longName: 'Benefit Verification',
    name: 'Benefit Ver.',
    iconColor: null
  },
  {
    key: 'AE',
    ord: 3,
    longName: 'Adverse Events',
    name: 'Adv. Events',
    iconColor: null
  },
  {
    key: 'PA',
    ord: 4,
    longName: 'Patient Assistance',
    name: 'Pt. Assist',
    iconColor: null
  },
  {
    key: 'AT',
    ord: 5,
    longName: 'Adherence Training',
    name: 'Adherence',
    iconColor: null
  }
];
