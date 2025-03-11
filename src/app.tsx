import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.scss';
import { Root } from "./components/Root";
import {NavigationButtons} from "./components/NavigationButtons";

const App: React.FC = () => {
    return (
        <>
            <Root />
            <NavigationButtons />
        </>
    );
};

const rootElement = document.getElementById('app-container');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App/>);
}