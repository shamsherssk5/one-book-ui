import React, { PureComponent, useState } from 'react'
import data from "./data.json"
import "./Discussion.css"
import 'react-comments-section/dist/index.css'
import { CommentSection } from 'react-comments-section'
import  CustomInput  from './CustomInputt'

const Discussion = () => {
  const [comment, setComment] = useState(data)
  const userId = "01a"
  const avatarUrl = "https://ui-avatars.com/api/name=Shamsher&background=random"
  const name = "xyz"
  const signinUrl = "/signin"
  const signupUrl = "/signup"
  let count = 0
  comment.map(i => { count += 1; i.replies && i.replies.map(i => count += 1) })

  return <div className="commentSection">
    <div>{count} Comments</div>

    <CommentSection currentUser={userId && { userId: userId, avatarUrl: avatarUrl, name: name }} commentsArray={comment}
      setComment={setComment} signinUrl={signinUrl} signupUrl={signupUrl} customInput={CustomInput}/>
  </div>
}

export default Discussion
