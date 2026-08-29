import styled from 'styled-components'

const TermsContent = styled.div`
  line-height: 1.5;
`

export const TermsText = () => (
  <TermsContent>
    <p>
      Welcome to mystash. Please read these terms carefully before using the
      service.
    </p>
    <p>
      This site and its application are <strong>experimental</strong> and
      provided on an &quot;as is&quot; basis. Things may change, break, or
      disappear at any time without notice. Use it at your own risk.
    </p>
    <p>
      The owner and operators of this service are <strong>free from any
      responsibility</strong> for errors, data loss, interruptions, or any other
      issues arising from the use of the application. You are solely responsible
      for the content you create and for backing up your own data.
    </p>
    <p>
      By continuing you acknowledge that you understand the experimental nature
      of the service and accept these terms.
    </p>
  </TermsContent>
)
