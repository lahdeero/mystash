import styled from 'styled-components'
import { SMALL_SPACE } from '../../layout/spacing'

const TextAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;

  textarea {
    width: 100%;
    margin-top: ${SMALL_SPACE};
`

interface TextareaProps {
  id: string
  label: string
  className?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  minRows?: number
}

const Textarea = (props: TextareaProps) => {
  const { id, label, value, onChange, minRows = 5 } = props
  return (
    <TextAreaWrapper>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={minRows}
        style={{ resize: 'vertical', width: '100%' }}
      />
    </TextAreaWrapper>
  )
}

export default Textarea
