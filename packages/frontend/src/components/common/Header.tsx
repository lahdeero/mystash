import styled from 'styled-components'

interface Props {
  text: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const Heading = styled.h1`
  color: ${({ theme }) => theme.Text};
`

const Header = ({ text, level = 1 }: Props) => (
  <Heading as={`h${level}`}>{text}</Heading>
)

export default Header