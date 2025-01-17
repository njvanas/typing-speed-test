import React, { useState } from "react";

const TypingTest = () => {
    const sampleText = "The quick brown fox jumps over the lazy dog.";
    const [typedText, setTypedText] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [result, setResult] = useState("");

    const handleInput = (e) => {
        const text = e.target.value;
        setTypedText(text);

        if (!startTime) {
            setStartTime(new Date());
        }

        if (text === sampleText) {
            const endTime = new Date();
            const timeTaken = (endTime - startTime) / 1000; // seconds
            const wordCount = sampleText.split(" ").length;
            const wpm = Math.round((wordCount / timeTaken) * 60);

            setResult(`You typed at ${wpm} WPM in ${timeTaken.toFixed(2)} seconds!`);
        }
    };

    return (
        <div style={styles.container}>
            <p style={styles.sampleText}>{sampleText}</p>
            <textarea
                style={styles.textarea}
                value={typedText}
                onChange={handleInput}
                placeholder="Start typing here..."
                disabled={result ? true : false}
            ></textarea>
            {result && <p style={styles.result}>{result}</p>}
        </div>
    );
};

const styles = {
    container: {
        marginTop: "20px",
        textAlign: "center",
    },
    sampleText: {
        fontSize: "1.2rem",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: "#f7f9fc",
        border: "1px solid #ddd",
        borderRadius: "4px",
        display: "inline-block",
    },
    textarea: {
        width: "100%",
        height: "100px",
        marginTop: "20px",
        padding: "10px",
        fontSize: "1rem",
        border: "1px solid #ddd",
        borderRadius: "4px",
        outline: "none",
    },
    result: {
        marginTop: "20px",
        fontSize: "1.2rem",
        color: "#4CAF50",
        fontWeight: "bold",
    },
};

export default TypingTest;