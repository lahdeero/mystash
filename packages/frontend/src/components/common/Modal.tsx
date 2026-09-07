import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const Dialog = styled.div`
  background-color: ${({ theme }) => theme.Background};
  color: ${({ theme }) => theme.Text};
  border-radius: 0.5rem;
  max-width: 40rem;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.Text};
  font-size: 1.4rem;
  cursor: pointer;
  line-height: 1;
`

const Title = styled.h2`
  margin: 0;
`

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <Overlay onClick={onClose} data-testid="modal-overlay">
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <ModalHeader>
          {title && <Title>{title}</Title>}
          <CloseButton onClick={onClose} aria-label="Close modal">
            &times;
          </CloseButton>
        </ModalHeader>
        {children}
      </Dialog>
    </Overlay>,
    document.body
  )
}

export default Modal
