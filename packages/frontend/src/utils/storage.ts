export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('app-state')
    if (serializedState === null) return undefined
    return JSON.parse(serializedState)
  } catch {
    return undefined
  }
}

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      notes: state.notes,
    })
    localStorage.setItem('app-state', serializedState);
  } catch {}
}
