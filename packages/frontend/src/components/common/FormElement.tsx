import styled from 'styled-components'

const FormElement = styled.form`
  display: flex;
  flex-direction: column;
  width: 80%;

  textarea {
    width: 90vw;
  }

  @media only screen and (max-width: 600px) {
    width: 95%;
  }
`

export default FormElement
