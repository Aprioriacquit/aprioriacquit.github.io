import React from "react";
import deleteIcon from "../../assets/images/vector/delete.svg";
import downloadIcon from "../../assets/images/vector/download.svg";
import uploadIcon from "../../assets/images/vector/upload.svg";

interface Props {
    onReset: () => void;
}

const FastAccessButtonsContainer: React.FC<Props> = ({ onReset }) => {
    return (
        <div className="fast-access-buttons-container">
            <button onClick={onReset} id="delete-button" className="icon-button">
                <img src={deleteIcon} alt="Delete" />
            </button>
            <button id="download-button" className="icon-button" disabled>
                <img src={downloadIcon} alt="Download" />
            </button>
            <button  onClick={() => window.dispatchEvent(new CustomEvent("trigger-upload"))} id="upload-button" className="icon-button">
                <img src={uploadIcon} alt="Upload" />
                <span>Upload</span>
            </button>
        </div>
    );
};

export default FastAccessButtonsContainer;
