const signatures = {
  JVBERi0: 'application/pdf',
  R0lGODdh: 'image/gif',
  R0lGODlh: 'image/gif',
  iVBORw0KGgo: 'image/png',
  '/9j/': 'image/jpg'
}

const detectMimeType = (b64) => {
  for (var s in signatures) {
    if (b64.indexOf(s) === 0) {
      return signatures[s]
    }
  }
}

export default detectMimeType
