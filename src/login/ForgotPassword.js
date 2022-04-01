import React, { useEffect, useState } from 'react';
import LOGO from './assets/logo-transparent.png';
import FORGOT_PASS from './assets/auth-forgot.svg';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = ({ setInnerContent, innerContent }) => {
    const [showMessage, setMessage] = useState({ 'isVisible': false, 'message': '' });
    let emptyInput = { 'value': "", 'error': "", show: false };
    const [email, setEmail] = useState(emptyInput);
    const [requestSent, setRequestSent] = useState(false);
    const [resend, setResend] = useState("Resend Link");
    const [submitValue,setSubmitValue]= useState('Send Reset Link');
    const [header, setHeader] = useState("Enter your registered email below to receive a password reset instruction.");
    const emailValidation = (value) => {
        let mailformat = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        let err;
        if (value.trim().length <= 0) {
            err = "User Email required";
        } else if (!value.match(mailformat)) {
            err = "Invalid Email";
        }
        setEmail({ 'value': value, 'error': err, show: err === undefined ? false : true });
    }
    const handleSubmit=(e)=>{
        e.preventDefault();
        if(submitValue==="Send Reset Link"){
            emailValidation(email.value);
            setSubmitValue("Loading...");
        }

        
    }

    useEffect(()=>{
        setRequestSent(false);
        setEmail(emptyInput);
        setSubmitValue('Send Reset Link');
    },[innerContent])

    useEffect(async ()=>{
        if(submitValue==="Loading..." || (requestSent && resend=== "Loading...")){
            if(!email.show){
                console.log("triggered");
                setMessage({ 'isVisible': false, 'message': '' });

                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/auth/sendLink',{"email":email.value, env: process.env.REACT_APP_URL})
                    .then(resp => {
                        if (resp.data.message) {
                            setMessage({ 'isVisible': true, 'message': resp.data.message });
                            setRequestSent(false);
                            
                        } else {
                            setRequestSent(true);
                            setHeader("Please check your inbox/spam and click in the received link to reset a password.")
                            toast.success("Email Sent Successfully");
                        }   
                        setSubmitValue("Send Reset Link");
                        setResend("Resend Link")
                        
                    }).catch((err) => {
                        console.log(err);
                        setMessage({ 'isVisible': true, 'message': 'error occured' });
                        setSubmitValue("Send Reset Link");
                        setResend("Resend Link")
                        setRequestSent(false);
                    })
                
    
            }else{
                setSubmitValue("Send Reset Link");
                setResend("Resend Link")
            }
            

        }
    },[submitValue, resend])
    return (
        innerContent === "forgotP" &&
        <div class="sign-in-from">
            <div class="text-center w-full"><img src={LOGO} class="img-fluid mb-4" width="100"
                height="100" alt="logo" /></div>
            <div class="w-full text-center">
                <img src={FORGOT_PASS} class="img-fluid mb-3" width="80" height="80" alt="reset" />
            </div>

            <h3 class="mb-0  sign-in">
            </h3>
            <p class="m-0 text-center">
                {header}
            </p>
            {showMessage.isVisible ? <div className="alert alert-danger alert-dismissible">
                {showMessage.message}
                <button type="button" className="close text-danger" onClick={() => { setMessage({ 'isVisible': false, 'message': '' }); }}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div> : ""}
            {!requestSent && <form class="mt-4" >

                <div class="form-group">
                    <label for="exampleInputEmail1">Email <span class="text-danger">*</span></label>
                    <input type="email" maxlength="200" className={`form-control form-control-sm mb-0 ${email.show ? 'is-invalid' : ''}`} name="user_email"
                        value={email.value}
                        onChange={(e) => emailValidation(e.target.value)}
                        placeholder="onebook@gmail.com" />
                    {email.show ? <div className="invalid-feedback text-right" >
                        {email.error}
                    </div> : ""}
                </div>
                <div class="sign-info w-full text-center  mb-4 ">
                    <span class="dark-color d-inline-block line-height-2 ">
                        Remember Password? <a class="text-dark forgotp" onClick={() => setInnerContent("signIn")}><strong>Login!</strong></a>
                    </span>
                </div>

                <div class="form-group">
                    <button type="submit" class="btn btn-primary text-center w-full" onClick={handleSubmit}>
                       {submitValue}
                    </button>
                </div>


            </form> }
            {requestSent && <><div class="form-group  mt-4">
                <a class="btn btn-primary text-center w-full" onClick={()=>setInnerContent("signIn")}>Login</a>
            </div>
                <div class="sign-info w-full text-center ">
                    <span class="dark-color d-inline-block line-height-2 ">
                        Didn't receive the link?<a class="text-dark forgotp" onClick={()=>setResend("Loading...")}><strong>
                        {resend}    </strong></a>
                    </span>
                </div></>}

        </div>
    );
};
export default ForgotPassword;