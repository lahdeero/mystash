import { useId } from 'react'
import styled from 'styled-components'

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
    left: ${props => props.imageLeft ? props.imageLeft : '5px'};
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
  placeholder?: string
  children?: React.ReactNode
}


const Input: React.FC<InputProps> = ({
  type,
  name,
  label,
  placeholder,
  autocomplete,
  value,
  onChange,
  children,
}) => {
  const suffix = name.replace(/[^a-zA-Z0-9]/g, '-')
  const wrapperId = useId()
  const inputId = `input-${suffix}`

  label = label ?? name
  return (
    <InputWrapper id={wrapperId}>
      <>
        {children}
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          type={type}
          name={name}
          autoComplete={autocomplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />

      </>
    </InputWrapper>
  )
}

export default Input
