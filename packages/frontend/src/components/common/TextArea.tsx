import styled from 'styled-components'

export const TextAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
`

interface TextAreaProps {
  id: string
  className?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  minRows?: number
}

const Textarea = (props: TextAreaProps) => {
  const { id, value, onChange, minRows = 5 } = props
  return (
    <TextAreaWrapper>
      <label htmlFor={id}>{id}</label>
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
