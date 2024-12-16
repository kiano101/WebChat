import React, { useEffect, useState } from 'react';
import '../styles/styles.css';

const BootstrapAlert = ({ message, variant, duration = 1500, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <div className={`custom-alert ${visible ? 'show' : ''} ${variant}`}>
      {message}
    </div>
  );
};

export default BootstrapAlert;
