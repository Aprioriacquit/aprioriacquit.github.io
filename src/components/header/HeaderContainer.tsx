import React from "react";
import FastAccessButtonsContainer from "./FastAccessButtonsContainer";
import LogoContainer from "./LogoContainer";

interface Props {
    onReset: () => void;
}
const HeaderContainer: React.FC<Props> = ({ onReset }) => {
    return (
        <div className="header-container">
            <LogoContainer />
            <FastAccessButtonsContainer onReset={onReset} />
        </div>
    );
};

export default HeaderContainer;
