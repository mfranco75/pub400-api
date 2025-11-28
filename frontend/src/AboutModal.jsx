import React from 'react';
import './AboutModal.css';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <h2 className="modal-title">About This Demo</h2>

                <div className="modal-body">
                    <section className="info-section">
                        <h3>🚀 Architecture</h3>
                        <p>
                            This application demonstrates a modern <strong>Full Stack</strong> architecture integrating
                            legacy systems with modern web technologies:
                        </p>
                        <ul className="tech-list">
                            <li><strong>Frontend:</strong> React.js + Vite (Modern UI/UX)</li>
                            <li><strong>Backend:</strong> Node.js + Express (REST API)</li>
                            <li><strong>Database:</strong> IBM i (AS/400) via Pub400.com</li>
                        </ul>
                    </section>

                    <section className="info-section">
                        <h3>✨ Features</h3>
                        <ul>
                            <li>Real-time connection status with the IBM i server.</li>
                            <li>Full CRUD (Create, Read, Update, Delete) operations on DB2 files.</li>
                            <li>Secure Admin Login for write operations.</li>
                            <li>Responsive and interactive modern design.</li>
                        </ul>
                    </section>

                    <section className="developer-section">
                        <h3>👨‍💻 Developed by</h3>
                        <div className="developer-card">
                            <div className="dev-info">
                                <h4>Mariano Franco</h4>
                                <p>Full Stack Developer | IBM i Specialist</p>
                            </div>
                            <a
                                href="https://www.linkedin.com/in/mariano-franco-1975-mdq/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linkedin-button"
                            >
                                Connect on LinkedIn
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
