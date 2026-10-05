import styled from "styled-components"
import Chip from "./Chip"
import { MEDIUM_SPACE } from "../../layout/spacing"

interface ChipContainerProps {
  label: string
  items: string[]
  onClick: (item: string) => void
}

const ChipWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${MEDIUM_SPACE};
`

const ChipGroup = (props: ChipContainerProps) => {
  const { label, items, onClick } = props;
  return (
    <ChipWrapper>
      <label>{label}</label>
      {
        items.map((tag: any) => (
          <Chip
            key={tag}
            onClick={() => {
              onClick(tag)
            }}
          >
            {` ${tag} `}
          </Chip>
        ))
      }
    </ChipWrapper>
  )
}

export default ChipGroup