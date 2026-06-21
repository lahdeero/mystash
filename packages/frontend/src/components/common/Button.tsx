import React from 'react'
import styled from 'styled-components'

interface ButtonProps {
  danger?: boolean
}

interface Props {
  type?: 'button' | 'submit' | 'reset'
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  danger?: boolean
  children: React.ReactNode
  form?: string
}

const ButtonComponent = styled.button<ButtonProps>`
  display: inline-block;
  background-color: ${({ theme, danger }) =>
    danger ? theme.ButtonDanger : theme.ButtonDefault};
  color: ${({ theme }) => theme.ButtonText};

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
  box-shadow:
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  font-size: 1.1rem;
`

const Button = ({
  type = 'button',
  className,
  onClick,
  danger = false,
  children,
}: Props) => (
  <ButtonComponent
    type={type}
    className={className}
    onClick={onClick}
    danger={danger}
  >
    {children}
  </ButtonComponent>
)

export default Button
