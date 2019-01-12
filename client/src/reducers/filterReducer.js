const filterReducer = (store = '', action) => {
  if (action.type === 'FILTER') {
    const filter = action.filter
    store = filter
  }

  return store
}

export const actionForFilter = (filter) => {
  return {
    type: 'FILTER',
    filter
  }
}

export default filterReducer
