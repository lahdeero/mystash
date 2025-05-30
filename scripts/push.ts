import axios from 'axios'
import notes from './notes.json'

// // print notes
// for (const note of notes) {
//   console.log(note)
// }

const apiUrl = 'https://1qmnl6hp9a.execute-api.eu-north-1.amazonaws.com/api/note'
const authToken = 'xxx'
const headers = {
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json',
}

async function pushNotes() {
  try {
    // Assuming notes.json contains an array of notes
    for (const n of notes) {
      const note = {
        title: n.title,
        content: n.content,
        tags: n.tags,
        updatedAt: n.updated_at,
      }
      const response = await axios.post(apiUrl, note, { headers })
      console.log(`Pushed note: ${response.data?.id} - Status: ${response.status}`)
    }
    console.log('All notes pushed successfully!')
  } catch (error) {
    console.error('Error pushing notes:', error)
  }
}

pushNotes()
