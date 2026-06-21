import styled from 'styled-components'

const Info = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  background-color: ${({ theme }) => theme.Info};
  color: ${({ theme }) => theme.Text};
  border-radius: 1rem;
`

export default Info
