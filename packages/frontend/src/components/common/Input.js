import React, { useId } from 'react'
import styled from 'styled-components'
import ClearIcon from '../../assets/clear.svg'

const InputWrapper = styled.div`
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

const Input = ( { type, name, autocomplete, value, onChange, label, image, imageLeft, clear, clearCallback } ) => {
  const id = useId()

  const refreshImage = (event) => {
    if (!image) return

    const imgEl = document.getElementById(id)?.querySelector('img')
    if (!imgEl) return

    if (event.type === 'focus') {
      imgEl.classList.remove('active')
    } else if (event.type === 'blur') {
      imgEl.classList.add('active')
    }
  }

  const handleClear = (event) => {
    event.preventDefault()
    document.getElementById(id)?.querySelector('input')?.focus()

    if (clearCallback) {
      clearCallback()
    }
  }

  return (
    <InputWrapper id={id} imageLeft={imageLeft}>
      <label>{label}</label>
      <input
        type={type}
        name={name}
        autoComplete={autocomplete}
        value={value}
        onChange={onChange}
        onFocus={refreshImage}
        onBlur={refreshImage}
      />
      { image }
      { clear && <button className="clear-input" onClick={handleClear}>
        <img alt="clear filter" src={ClearIcon} />
      </button> }
    </InputWrapper>
  )
}

export default Input
