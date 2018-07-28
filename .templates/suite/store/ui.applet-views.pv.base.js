// PV (Pharmacovigilance) Applet Views
/*
    Types of Views/Functions to consider, with rendering options underneath:
      Page
        Markdown
      List/Search
        Grid
        Cards
      Add
        Quick
        Full
      Edit
        Quick
        Full
      Delete
      Merge
*/

module.exports = [
  {
    key: 'Pt',
    views: [
      {
        key: 'List',
        default: true,
        style: 'Cards'
      },
      {
        key: 'Add',
        style: 'Quick'
      }
    ]
  },
  {
    key: 'BV',
    views: [
      {
        key: 'Page',
        default: true,
        style: 'Markdown'
      },
      {
        key: 'Add',
        style: 'Quick'
      }
    ]
  }
];
