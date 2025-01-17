import React from "react";
import TypingTest from "./TypingTest";

const App = () => {
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Typing Speed Test</h1>
                <p style={styles.subtitle}>
                    Improve your typing speed and accuracy.
                </p>
            </header>
            <TypingTest />
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
    },
    header: {
        marginBottom: "20px",
    },
    title: {
        fontSize: "2rem",
        color: "#4CAF50",
        margin: "0 0 10px 0",
    },
    subtitle: {
        fontSize: "1rem",
        color: "#555",
    },
};

export default App;