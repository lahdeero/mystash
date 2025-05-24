import React from 'react'
import styled from 'styled-components'
import Colors from '../../layout/colors'

const ButtonComponent = styled.button`
  display: inline-block;
  background-color: ${props => props.color ?? Colors.Teal};
  color: #fff;
  width: 9rem;
  height: 3rem;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  border: none;
  border-radius: 1rem;
  margin: 1rem 1rem 1rem 0;
  text-transform: uppercase;
  overflow: visible;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2);
  font-weight: 600;
  font-size: 1.1rem;
`

const Button = ( {type, className, onClick, danger, children }: any ) => {
  const btnColor = danger ? Colors.Pink : Colors.Teal

  return (
    <ButtonComponent className={className} type={type} onClick={onClick} color={btnColor} >
      {children}
    </ButtonComponent>
  )
}

export default Button
