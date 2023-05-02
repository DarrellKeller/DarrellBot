import React, { useEffect, useMemo, useRef, useState } from 'react';
import sendIcon from './assets/SendButton.svg';
import './assets/App.css';

const axios = require('axios');
const cuid = require('cuid');

function App() {

  const [formValue, setFormValue] = useState('');
  const [messages, setMessages] = useState([]);
  const messageRef = useRef(null);

  // Callback to scroll to current message when a new one is displayed.
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const apiKey = '{apikey}';

  const userID = useMemo(() => cuid(), []);

  // Handle voiceflow request.
  async function voiceflowInteract(body) {
    // Send request.
    const response = await axios({
      method: 'POST',
      baseURL: 'https://general-runtime.voiceflow.com',
      url: `/state/user/${userID}/interact`,
      headers: {
        Authorization: apiKey,
      },
      data: body,
    });

    // Add the response(s) to messages.
    for (let datIndex in response.data) {
      if (response.data[datIndex].type === 'text'){
        for (let contentIndex in response.data[datIndex].payload.slate.content) {
          for (let childIndex in response.data[datIndex].payload.slate.content[contentIndex].children) {
            if(response.data[datIndex].payload.slate.content[contentIndex].children[childIndex].text.trim() ===''){
              continue;
            }
            console.log(response.data[datIndex].payload.slate.content[contentIndex].children[childIndex].text);
            setMessages(prev => [...prev, {id: prev.length, text: response.data[datIndex].payload.slate.content[contentIndex].children[childIndex].text, type: 'bot'}]);
            
          }
        }
      }
    }
  }
  
  // Handle sending message.
  const sendMessage = async (e) => {
    e.preventDefault();

    const text = formValue;
    
    setMessages(prev => [...prev, {id: prev.length, text: text, type: 'user'}]);

    voiceflowInteract({
      action: {
        type: 'text',
        payload: text
      }
    }).catch((error) => console.error(error));
    setFormValue('');
  }

  // Callback to initialize Voiceflow interaction when the page loads. 
  useEffect(() => {
    console.log('Run Once');
    voiceflowInteract({
      action: {
        type: 'launch',
        payload: null
      }
    });
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Display content.
  return ( 
    <div className="App">   
    <head>
      <meta name="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"></meta> 
    </head>
      
      <img className="bg-image" src="https://dkdoes.us/wp-content/uploads/2022/09/Spiral-Chaos.svg" alt=""></img>
      
      <main>
        <ul className="chat-region">
          <div className="spacer"></div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} inputRef={messageRef}/>)}
        </ul>
      </main>

      <footer>
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Chat with Darrell Bot" />

          <button type="submit" disabled={!formValue}><img src={sendIcon} alt="Submit"/></button>
        </form>
        <div className="disclaimer">
          <p>Darrell Bot is a work in progress <wbr/>and currently suffers from <a href="https://www.youtube.com/watch?v=-3WpqPZgWAk">goldfish memory</a>.</p>
        </div>
      </footer>
      
    </div>
  );
}

// Create frontend for chat message.
function ChatMessage(props) {
  const {text, type} = props.message;

  if (type === 'bot'){
    return (<>
      <li ref={props.inputRef} className={`message ${type}`}>
        <img src="https://dkdoes.us/wp-content/uploads/2020/08/IMG_4484-scaled-800x800.jpg" alt=""/>
        <p>{text}</p>
      </li>
    </>)
  }
  
  return (<>
      <li ref={props.inputRef} className={`message ${type}`}>
        <p>{text}</p>
      </li>
    </>)
}

export default App;
