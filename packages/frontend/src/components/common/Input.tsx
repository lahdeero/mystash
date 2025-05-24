import { useId } from 'react'
import styled from 'styled-components'
import ClearIcon from '../../assets/clear.svg'

interface InputWrapperProps {
  id?: string
  imageLeft?: string
  children?: React.ReactNode
}

const InputWrapper = styled.div<InputWrapperProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 1rem;

  input {
    width: calc(100% - 3rem);
    height: 1.8rem;
  }

  img.explainer {
    position: absolute;
    padding: .2rem .1rem .1rem .3rem;
    opacity: 0;
    left: ${props => props.imageLeft ? props.imageLeft : '5px' };
    height: 1.3rem;
    transition: opacity .5s ease-out;

    &.active {
      display: block;
      opacity: 1;
      transition: opacity 1s ease-in;
    }
  }

  button {
    position: absolute;
    right: 20px;
    background-color: transparent;
    border: 0;

    img {
      display: block;
      opacity: 1;
      transition: opacity 1s ease-in;
    }
  }
`

interface InputProps {
  type: string
  name: string
  autocomplete?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label?: string
  image?: React.ReactNode
  imageLeft?: string
  clear?: boolean
  clearCallback?: () => void
  children?: React.ReactNode
}


const Input: React.FC<InputProps> = ({
  type,
  name,
  autocomplete,
  value,
  onChange,
  label,
  image,
  imageLeft,
  clear,
  clearCallback,
  children,
}) => {
  const id = useId()

  const refreshImage = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!image) return

    const imgEl = document.getElementById(id)?.querySelector('img')
    if (!imgEl) return

    if (event.type === 'focus') {
      imgEl.classList.remove('active')
    } else if (event.type === 'blur') {
      imgEl.classList.add('active')
    }
  }

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault()
    document.getElementById(id)?.querySelector('input')?.focus()

    if (clearCallback) {
      clearCallback()
    }
  }

  return (
    <InputWrapper id={id} imageLeft={imageLeft}>
      <>
        {children}
        {label && <label>{label}</label>}
        <input
          type={type}
          name={name}
          autoComplete={autocomplete}
          value={value}
          onChange={onChange}
          onFocus={refreshImage}
          onBlur={refreshImage}
        />
        {image}
        {clear && (
          <button className="clear-input" onClick={handleClear}>
            <img src={ClearIcon} alt="Clear" />
          </button>
        )}
      </>
    </InputWrapper>
  )
}

export default Input
