import React, { useState } from "react";
import "../styles/navigation-buttons.scss";

export enum NavigationPageEnum {
    IMAGE = "Image",
    PREVIEW = "Preview",
    GLYPHS = "Glyphs"
}

export const NavigationButtons: React.FC = () => {
    const [activeMode, setActiveMode] = useState<NavigationPageEnum>(
        NavigationPageEnum.IMAGE
    );

    const modes = [NavigationPageEnum.IMAGE, NavigationPageEnum.PREVIEW, NavigationPageEnum.GLYPHS];

    return (
        <div className="navigation-container">
            {/* Compute activeIndex here to ensure it's always up to date */}
            {(() => {
                const activeIndex = modes.indexOf(activeMode);
                return (
                    <div
                        className="highlight"
                        style={{
                            transform: `translateX(${activeIndex * 131}px)`,
                            borderRadius: activeIndex === 0 ? "25px 0px 50px 50px"
                                : activeIndex === modes.length - 1 ? "0px 25px 50px 50px"
                                    : "25px 25px 50px 50px",
                        }}
                    />
                );
            })()}

            {modes.map((mode) => (
                <div
                    key={mode}
                    className="navigation-button"
                    onClick={() => {
                        setActiveMode(mode);
                    }}
                >
                    <span
                        className="navigation-text"
                        style={{ color: activeMode === mode ? "#181818" : "#FFFFFF" }}
                    >
                        {mode}
                    </span>
                </div>
            ))}
        </div>
    );
};
