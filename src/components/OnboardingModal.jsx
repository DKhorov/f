import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const cards = [
  {
    title: 'Добро пожаловать!',
    text: 'Это ваш личный кабинет. Здесь вы можете управлять своим профилем и настройками.'
  },
  {
    title: 'Меню слева',
    text: 'В левом меню находятся основные разделы сайта: лента, музыка, чат, настройки и другое.'
  },
  {
    title: 'Правый сайдбар',
    text: 'В правом сайдбаре — дополнительные функции. Открывайте его по кнопке в левом меню.'
  },
  {
    title: 'Настройки',
    text: 'В настройках можно включить тёмную тему, полноэкранный режим и другие опции.'
  },
  {
    title: 'Готово!',
    text: 'Теперь вы знаете, как пользоваться сайтом. Приятного использования!'
  }
];

const OnboardingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < cards.length - 1) setStep(step + 1);
  };
  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };
  const handleClose = () => {
    localStorage.setItem('onboardingSeen', 'true');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="onboarding-modal-overlay" onClick={e => e.target.className === 'onboarding-modal-overlay' && handleClose()}>
      <div className="onboarding-modal-window">
        <h2 className="onboarding-modal-title">{cards[step].title}</h2>
        <div className="onboarding-modal-text">{cards[step].text}</div>
        <div className="onboarding-modal-controls">
          {step > 0 && <button className="onboarding-btn" onClick={handlePrev}>Назад</button>}
          {step === 0 && <button className="onboarding-btn primary" onClick={handleNext}>Я знаю</button>}
          {step > 0 && step < cards.length - 1 && <button className="onboarding-btn primary" onClick={handleNext}>Далее</button>}
          {step === cards.length - 1 && <button className="onboarding-btn primary" onClick={handleClose}>Я понял</button>}
        </div>
        <div className="onboarding-modal-dots">
          {cards.map((_, i) => (
            <span key={i} className={i === step ? 'active' : ''} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingModal; 