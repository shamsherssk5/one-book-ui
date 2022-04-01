import ChatBox, { ChatFrame } from 'react-chat-plugin';
import React, { useState } from "react";
import axios from 'axios';

export const MessageBox = (props) => {
  let { setToken,data, handleOnSendMessage, currentUser, moduleID, heading} = props;

  const handleSendMessage=(message)=>{
    let messageData={ 
      'moduleID': moduleID, 
      'userID': currentUser.id,
      'username':currentUser.username, 
      'text': message, 
      'avatarUrl': "https://ui-avatars.com/api/name="+currentUser.username+"?background=2687D7&color=fff",
      "timestamp": +new Date(new Date().toLocaleString("en-US", {timeZone: currentUser.timeZone})),
      "timeZone": currentUser.timeZone
    };
    handleOnSendMessage(messageData);
    axios.post(process.env.REACT_APP_API_ENDPOINT + '/common/postMessage', messageData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }
            console.log("Message success");
          }).catch((err) => {
            console.log(err);
          })
  }
  
  return (
    <div className="messages task-details-container">
      <div className="message-Heading">
        {heading}
      </div>
      <div className="message-content">
        
        <ChatFrame
          chatbox={
            <ChatBox
              onSendMessage={handleSendMessage}
              userId={currentUser.id}
              messages={data.map(d=>{
                let message = {};
                message['text'] = d.text;
                message['timestamp'] = d.timestamp;
                message['type'] = 'text';
                let author = {};
                author['username'] = d.username;
                author['id'] = d.userID;
                author['avatarUrl'] = d.avatarUrl;
                message['author'] = author;
                return message;
              })}
              activeAuthor={currentUser}
            />

          }
          showChatbox={true}
        >
        </ChatFrame >
      </div>

    </div>
  );
}