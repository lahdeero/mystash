import styled from 'styled-components'
import Colors from '../../layout/colors'

const ChipItem = styled.div`
  cursor: pointer;

  font-size: .7rem;
  max-height: 1.5rem;
  display: flex;

  margin: .2rem;
  padding: .2rem .3rem;

  text-transform: uppercase;
  border: 3px solid ${Colors.Info};
  border-radius: 2em;
  transition: transform 0.2s;
  transition-timing-function: cubic-bezier(0.45, -0.85, 0.55, -0.45);

  :hover {
    transform: scale(1.1);
    background: linear-gradient(to right, ${Colors.Nav}, ${Colors.Black});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`

const Chip = ( { onClick, children }: any ) => {
  return (
    <ChipItem onClick={onClick}>
      { children }
    </ChipItem>
  )
}

export default Chip
