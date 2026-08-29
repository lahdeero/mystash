import styled from 'styled-components'

import { hideNotification } from '../reducers/notificationReducer'
import { useAppDispatch, useAppSelector } from '../store'
import ContentSpan from './common/ContentSpan'
import ClearIcon from '../assets/clear.svg'

const NotificationWrapper = styled.div`
  background-color: ${({ theme }) => theme.NotificationBackground};
  color: ${({ theme }) => theme.Text};

  max-height: 4rem;
  overflow: hidden;

  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin: 0.1rem;
  padding: 0.1rem 0.2rem;
  font-size: 1.4rem;
  border-radius: 5px;

  &.hidden {
    max-height: 0;
    transition: max-height 0.7s ease-out;
    overflow: hidden;
  }
`

const HideButton = styled.button`
  cursor: pointer;
  background-color: transparent;
  flex-shrink: 0;
  border: 0;
  outline: 0;

  svg {
    background-color: transparent;
  }
`

const Notification = () => {
  const dispatch = useAppDispatch()
  const notification = useAppSelector((state) => state.notification)
  const text = notification[0]
  if (typeof text !== 'string' || text.length < 2) {
    return <div />
  }

  const handleClear = (event: any) => {
    event.preventDefault()
    event.target.closest('div.notification-wrapper').classList.add('hidden')
    setTimeout(() => {
      dispatch(hideNotification())
    }, 1000)
  }

  return (
    <NotificationWrapper className="notification-wrapper">
      <ContentSpan>{text}</ContentSpan>
      <HideButton className="hide-notification" onClick={handleClear}>
        <img src={ClearIcon} alt="Clear" />
      </HideButton>
    </NotificationWrapper>
  )
}

export default Notification
