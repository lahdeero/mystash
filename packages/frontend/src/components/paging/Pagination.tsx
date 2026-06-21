import styled from 'styled-components'
import PageItem from './PageItem'

const PaginationButtons = styled.ul`
  display: flex;
  justify-content: center;

  li {
    background-color: ${({ theme }) => theme.NavigationButton};
    color: ${({ theme }) => theme.Text};
    margin-left: 1rem;
    cursor: pointer;
    margin: 0 0.2rem;
    padding: 0.2rem 1rem;
    border-radius: 1rem;

    &:hover,
    &:active,
    &.active {
      color: #156057;
    }
  }

  @media only screen and (max-width: 600px) {
    padding: 0;
  }
`

const Pagination = ({ itemCount, itemsPerPage, activePage, onSelect }: any) => {
  const pageCount = Math.ceil(itemCount / itemsPerPage)

  const previousPage = (current: any) => {
    if (current <= 1) {
      return 1
    }
    return current - 1
  }

  const nextPage = (current: any) => {
    if (current >= pageCount) {
      return pageCount
    }
    return current + 1
  }

  return (
    <PaginationButtons>
      <PageItem
        onClick={() => onSelect(1)}
        title={'First'}
        active={activePage === 1}
      />
      <PageItem
        onClick={() => onSelect(previousPage(activePage))}
        title={'<'}
        active={false}
      />
      <PageItem
        onClick={() => onSelect(activePage)}
        title={activePage}
        active={false}
        disabled={true}
      />
      <PageItem
        onClick={() => onSelect(nextPage(activePage))}
        title={'>'}
        active={false}
      />
      <PageItem
        onClick={() => onSelect(pageCount)}
        title={'Last'}
        active={activePage === pageCount}
      />
    </PaginationButtons>
  )
}

export default Pagination
