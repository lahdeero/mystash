import styled from 'styled-components'

interface ContentSpanProps {
  isClickable?: boolean
}

const ContentSpan = styled.span<ContentSpanProps>`
  color: ${({ theme, isClickable }) => (isClickable ? theme.Link : theme.Text)};
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
`

export default ContentSpan
