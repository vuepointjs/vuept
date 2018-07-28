// PV (Pharmacovigilance) Applets
/*
    Requirements:
      key: Exactly 2 characters, unique (case-insensitive)
      name: Max 30 characters
      shortName: Max 12 characters
*/
module.exports = [
  {
    key: 'Pt',
    ord: 1,
    name: 'Patients',
    shortName: 'Patients',
    iconColor: null
  },
  {
    key: 'BV',
    ord: 2,
    name: 'Benefit Verification',
    shortName: 'Benefit Ver.',
    iconColor: null
  },
  {
    key: 'AE',
    ord: 3,
    name: 'Adverse Events',
    shortName: 'Adv. Events',
    iconColor: null
  },
  {
    key: 'PA',
    ord: 4,
    name: 'Patient Assistance',
    shortName: 'Pt. Assist',
    iconColor: null
  },
  {
    key: 'AT',
    ord: 5,
    name: 'Adherence Training',
    shortName: 'Adherence',
    iconColor: null
  }
];
