import { useEffect } from "react";
import "../styles/base/theme.css"; //     ✅ Theme styles
import "../styles/base/fonts.css"; //     ✅ Font imports
import "../styles/base/variables.css"; // ✅ Variables imports
import "../styles/base/main.css";
import "../styles/layout.css";
import "../styles/navigation-buttons.css";
import "../styles/fast-access-buttons.css";
import PreviewContainer from "./preview/PreviewContainer";
import HeaderContainer from "./header/HeaderContainer";
import {useTheme} from "../hooks/useTheme";

function App() {
    useEffect(() => {
        document.body.classList.add("loaded");
    }, []);

    const { toggleTheme } = useTheme(); // dark/light mode

    const handleReset = () => {
        const event = new CustomEvent("reset-shirt");
        window.dispatchEvent(event);
    };

    return (
        <div className="app">
            <HeaderContainer onReset={handleReset}/>
            <div className="main-content">
                <PreviewContainer />
            </div>
        </div>
    );
}

export default App;
