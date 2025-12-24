import React from 'react';
import { useParams } from 'react-router-dom';

function Chat() {
  const { chatId } = useParams();
  
  return (
    <div>
      <h1>Chat: {chatId}</h1>
      <p>Coming soon...</p>
    </div>
  );
}

export default Chat;