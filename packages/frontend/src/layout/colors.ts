export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export const themes = {
  [Theme.Light]: {
    Link: '#1976d2',
    Nav: '#3f51b5',
    Background: '#E2E8F0',
    Text: '#1a202c',
    Info: '#81d4fa',
    NotificationBackground: '#00796b',
    ButtonText: '#fff',
    ButtonDefault: '#00796b',
    ButtonDanger: '#ad1457',
    Border: '#2d3748',
    NoteBackground: '#cfd6f5',
    NavigationButton: '#b39ddb',
    FooterText: '#fff',
    FooterBackground: '#3f51b5',
  },
  [Theme.Dark]: {
    Link: '#81d4fa',
    Nav: '#3f51b5',
    Background: '#1a202c',
    Text: '#E2E8F0',
    Info: '#81d4fa',
    NotificationBackground: '#00796b',
    ButtonText: '#fff',
    ButtonDefault: '#3f51b5',
    ButtonDanger: '#ad1457',
    Border: '#2d3748',
    NoteBackground: '#2d3748',
    NavigationButton: '#b39ddb',
    FooterText: '#fff',
    FooterBackground: '#3f51b5',
  },
}
