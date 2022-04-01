import React, { useEffect, useState } from 'react';
import ShowP from './assets/show-text.svg';
import hideP from './assets/hide-text.svg';
import LOGO from './assets/logo-transparent.png';
import Lock from './assets/lock.svg';
import RESET from './assets/auth-reset.svg';
import RESET_SUCCESS from './assets/auth-reset-success.svg';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = ({ setInnerContent, innerContent, resetEmail }) => {
    let emptyInput = { 'value': "", 'error': "", show: false };
    const [showMessage, setMessage] = useState({ 'isVisible': false, 'message': '' });
    const [showPassword, isShowPassword] = useState(false);
    const [password, setPassword] = useState(emptyInput);
    const [confirmPassword, setConfirmPassword] = useState(emptyInput);
    const [submitValue, setSubmitValue] = useState('Reset Password');
    const [header, setHeader] = useState("");
    const [requestSent, setRequestSent] = useState(false);
    
    const submitForm = (e) => {
        e.preventDefault();
        if (submitValue === 'Reset Password') {
            passwordValidation(password.value);
            confirmpasswordValidation(confirmPassword.value);
            setSubmitValue("Loading...");
        }
    }

    useEffect(async () => {
        if (submitValue === "Loading...") {

            if (!password.show && !confirmPassword.show) {
                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/auth/resetPassword',{"password":password.value},{ headers: { "Authorization": new URL(window.location.href).searchParams.get("token") } })
                .then(resp => {
                    if (resp.data.error) {
                        setMessage({ 'isVisible': true, 'message': resp.data.error });
                        setSubmitValue("Reset Password");
                        setRequestSent(false);
                    }else{
                        toast.success("Password changed Successfully");
                        setHeader('Your password has been reset successfully.');
                        setRequestSent(true);
                    }
                }).catch((err) => {
                    console.log(err);
                    setMessage({ 'isVisible': true, 'message': 'error occured' });
                    setSubmitValue("Reset Password");
                    setRequestSent(false);
                   
                })

            }else{
                setSubmitValue("Reset Password");
            }

        }

    }, [submitValue])

    const passwordValidation = (password) => {
        if (password.length < 8) {
            setPassword({ value: password, show: true })
            return;
        }
        setPassword({ value: password, show: false })
    }

    const confirmpasswordValidation = (pass) => {
        if (pass === password.value) {
            setConfirmPassword({ value: pass, show: false })
            return;
        }
        setConfirmPassword({ value: pass, show: true })
    }


    return (
        innerContent === "resetP" &&
        <div className="sign-in-from">
            <div className="text-center w-full"><img src={LOGO} className="img-fluid mb-4" width="100"
                height="100" alt="logo" /></div>
            <div className="w-full text-center">
                <img
                    src={requestSent?RESET_SUCCESS:RESET}
                    className="img-fluid mb-3" width="80" height="80" alt="reset" />
            </div>
            <p className="m-0 text-center">
                {header}</p>
            {showMessage.isVisible ? <div className="alert alert-danger alert-dismissible">
                {showMessage.message}
                <button type="button" className="close text-danger" onClick={() => { setMessage({ 'isVisible': false, 'message': '' }); }}>
                    <span >&times;</span>
                </button>
            </div> : ""}
            {!requestSent && <form className="mt-4" >

                <div className="form-group">
                    <label>Password<span className="text-danger">*</span></label>
                    <div className="input-group">
                        <input type={showPassword ? 'text' : 'password'} className={`form-control form-control-sm mb-0 ${password.show ? 'is-invalid' : ''}`} minlength="8"
                            maxlength="100" placeholder="•••••••••" name="user_password"
                            value={password.value}
                            onChange={(e) => passwordValidation(e.target.value)}
                            required maxlength="100"
                        />
                        <div className="input-group-append">
                            <span className="input-group-text cursor-pointer"
                                id="inputGroupPrepend2"><img
                                    src={showPassword ? ShowP : hideP}
                                    onClick={() => isShowPassword(!showPassword)}
                                    width="20" /></span>
                        </div>
                        {password.show ? <div className="invalid-feedback text-right">
                            Invalid Password
                        </div> : ""}
                    </div >
                    <div className="text-secondary small"><img className="mr-1" src={Lock} width="7" alt="" />Password must be
                        atleast 8 characters long</div>

                </div >
                <div className="form-group">
                    <label>Confirm Password<span className="text-danger">*</span></label>
                    <div className="input-group">
                        <input className={`form-control form-control-sm mb-0 ${confirmPassword.show ? 'is-invalid' : ''}`} type={showPassword ? 'text' : 'password'}
                            name="confirmpassword"
                            value={confirmPassword.value}
                            onChange={(e) => confirmpasswordValidation(e.target.value)}
                            placeholder="•••••••••••••" />
                        <div className="input-group-append">
                            <span className="input-group-text cursor-pointer"
                                id="inputGroupPrepend2"><img
                                    src={showPassword ? ShowP : hideP}
                                    onClick={() => isShowPassword(!showPassword)}
                                    width="20" /></span>
                        </div>
                        {confirmPassword.show ? <div className="invalid-feedback text-right"
                        >
                            Password did not match
                        </div> : ""}
                    </div >
                    <div className="form-group mt-4">
                        <button type="submit" className="btn btn-primary text-center w-full" onClick={submitForm}>
                            {submitValue}
                        </button>
                    </div>
                </div>

            </form>}
            <div className="sign-info w-full text-center  mb-4 ">
                <span className="dark-color d-inline-block line-height-2 ">
                    Remember Password? <a className="text-dark forgotp" onClick={()=>{window.location.href=process.env.REACT_APP_URL;setInnerContent("signIn")}}><strong>Login!</strong></a>
                </span>
            </div>
        </div>

    )

}

export default ResetPassword;