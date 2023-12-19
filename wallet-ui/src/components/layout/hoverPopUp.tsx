import React, { useState } from 'react';
import styled from 'styled-components';
import { CopyToClipboardFromPopUp } from './copyToClipboard';

interface PopUpProps {
  isVisible: boolean;
}

const ContainerPopUp = styled.div`
  position: relative;
  display: inline-block;
`;

const PopUp = styled.div<PopUpProps>`
  position: absolute;
  top: -200%;
  left: 50%;
  color: black;
  transform: translateX(-50%);
  background-color: #f8f8f8;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.isVisible ? 'auto' : 'none')};
  transition: opacity 0.3s ease-in-out;
  white-space: nowrap;
`;

interface HoverPopUpProps {
  triggerText: string;
  popUpContent: React.ReactNode;
}

const HoverPopUp: React.FC<HoverPopUpProps> = ({ triggerText, popUpContent }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ContainerPopUp onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <span>{triggerText}</span>
      <PopUp isVisible={isHovered}>{<CopyToClipboardFromPopUp paramToCopy={popUpContent}   />}</PopUp>
    </ContainerPopUp>
  );
};

export default HoverPopUp;