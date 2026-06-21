import styled from 'styled-components'

const ChipItem = styled.div`
  cursor: pointer;

  font-size: 0.7rem;
  max-height: 1.5rem;
  display: flex;

  margin: 0.2rem;
  padding: 0.2rem 0.3rem;

  text-transform: uppercase;
  border: 3px solid ${({ theme }) => theme.Info};
  border-radius: 2em;
  transition: transform 0.2s;
  transition-timing-function: cubic-bezier(0.45, -0.85, 0.55, -0.45);

  :hover {
    transform: scale(1.1);
    background: linear-gradient(
      to right,
      ${({ theme }) => theme.Nav},
      ${({ theme }) => theme.Background}
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`

const Chip = ({ onClick, children }: any) => {
  return <ChipItem onClick={onClick}>{children}</ChipItem>
}

export default Chip
