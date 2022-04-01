import React, { useEffect, useState } from 'react';
import LOGO from './assets/logo-transparent.png';
import Lock from './assets/lock.svg';
import ShowP from './assets/show-text.svg';
import hideP from './assets/hide-text.svg';
import axios from 'axios';
import toast from 'react-hot-toast';

const SignUpCom = ({ setInnerContent, innerContent }) => {
    const [signUpvalue, setSignUpValue] = useState('Sign Up');
    const [showPassword, isShowPassword] = useState(false);
    let emptyInput = { 'value': "", 'error': "", show: false };
    const [showMessage, setMessage] = useState({ 'isVisible': false, 'message': '' });
    const [fName, setFname] = useState(emptyInput);
    const [lName, setLname] = useState(emptyInput);
    const [email, setEmail] = useState(emptyInput);
    const [mobNo, setMobNo] = useState(emptyInput);
    const [password, setPassword] = useState(emptyInput);
    const [confirmPassword, setConfirmPassword] = useState(emptyInput);
    const [tncChecked, isTncChecked] = useState(true);

    useEffect(() => {
        setFname(emptyInput);
        setLname(emptyInput);
        setEmail(emptyInput);
        setMobNo(emptyInput);
        setPassword(emptyInput);
        setConfirmPassword(emptyInput);
        isShowPassword(false);
        if (innerContent === "signUp") {
            document.getElementById('customCheck1').checked = true;
        }
    }, [innerContent]);

    useEffect(async () => {
        if (signUpvalue === 'Signing Up...') {
            if (!fName.show && !lName.show && !email.show && !mobNo.show && !password.show && !confirmPassword.show && tncChecked) {
                let data = {
                    "first_name": fName.value,
                    "last_name": lName.value,
                    "email": email.value,
                    "mobile_num": mobNo.value,
                    "password": password.value
                }
                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/auth/signup', data)
                    .then(resp => {
                        if (resp.data.message) {
                            setMessage({ 'isVisible': true, 'message': resp.data.message });
                        } else {
                            toast.success("User Created Successfully");
                            setInnerContent("signIn");
                        }
                        setSignUpValue("Sign Up");
                    }).catch((err) => {
                        console.log(err);
                        setMessage({ 'isVisible': true, 'message': 'error occured' });
                        setSignUpValue("Sign Up");
                    })

            } else {
                setSignUpValue("Sign Up");
            }

        }
    }, [signUpvalue])

    const handleSignUp = (e) => {
        e.preventDefault();
        if (signUpvalue === "Sign Up") {
            setMessage({ 'isVisible': false, 'message': '' });
            mobileValidation(mobNo.value)
            namesvalidation(fName.value, 2, 100, setFname);
            namesvalidation(lName.value, 2, 100, setLname);
            emailValidation(email.value);
            passwordValidation(password.value);
            confirmpasswordValidation(confirmPassword.value);
            setSignUpValue("Signing Up...");
        }
    }

    const namesvalidation = (name, min, max, setName) => {
        let rg = /^(?![0-9._])(?!.*[0-9._]$)(?!.*\d_)(?!.*_\d)[a-zA-Z0-9_]+$/;
        let err;
        if (name.length <= 0) {
            err = "Field required";
        } else if (name.length < min || name.length > max) {
            err = "Characters length must be 2-100";
        } else if (!name.match(rg)) {
            err = "Must not contain Special/Numeric Characters";
        } else {
            err = undefined
        }
        setName({ 'value': name, 'error': err, show: err === undefined ? false : true });
    }

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

    const mobileValidation = (number) => {
        let mob = /^\d{10}$/;
        let err;
        if (!number.match(mob)) {

            err = "Invalid Mobile Number";
        }
        setMobNo({ 'value': number, 'error': err, show: err === undefined ? false : true });
    }

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
        innerContent === "signUp" &&
        <div className="sign-in-from">
            <div className="text-center w-full sign-up-logo">
                <img src={LOGO} className="img-fluid"
                    width="80" height="100" alt="logo" />
            </div>

            <h3 className="mb-0 text-dark sign-in">Sign Up</h3>
            <p className="m-0">Create an Account.</p>

            <form className="mt-4" novalidate>
                {showMessage.isVisible ? <div className="alert alert-danger alert-dismissible">
                    {showMessage.message}
                    <button type="button" className="close text-danger" onClick={() => { setMessage({ 'isVisible': false, 'message': '' }); }}>
                        <span >&times;</span>
                    </button>
                </div> : ""}
                <div className="form-group">
                    <div className="row">
                        <div className="col-md-6">
                            <label>First Name<span className="text-danger">*</span></label>
                            <input type="text" className={`form-control form-control-sm mb-0 ${fName.show ? 'is-invalid' : ''}`} name="user_fname" minLength="2" maxLength="100"
                                value={fName.value}
                                onChange={(e) => namesvalidation(e.target.value, 2, 100, setFname)}
                                placeholder="First Name" />
                            {fName.show ? <div className="invalid-feedback text-right">
                                {fName.error}
                            </div> : ""}
                        </div>
                        <div className="col-md-6">
                            <label>Last Name<span className="text-danger">*</span></label>
                            <input type="text" className={`form-control form-control-sm mb-0 ${lName.show ? 'is-invalid' : ''}`} name="user_lname" minlength="1" maxlength="100"
                                value={lName.value}
                                onChange={(e) => namesvalidation(e.target.value, 1, 100, setLname)}
                                placeholder="Last Name" />
                            {lName.show ? <div className="invalid-feedback text-right" >
                                {lName.error}
                            </div> : ""}
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label>Email<span className="text-danger">*</span></label>
                    <input type="text" className={`form-control form-control-sm mb-0 ${email.show ? 'is-invalid' : ''}`} name="user_email" maxlength="200"
                        value={email.value}
                        onChange={(e) => emailValidation(e.target.value)}
                        placeholder="Enter Email" />
                    {email.show ? <div className="invalid-feedback text-right" >
                        {email.error}
                    </div> : ""}
                </div >
                <div className="form-group">
                    <label>Mobile Number<span className="text-danger">*</span></label>
                    <input type="number" className={`form-control form-control-sm mb-0 ${mobNo.show ? 'is-invalid' : ''}`} maxlength="50" minlength="12" name="user_mobno"
                        value={mobNo.value}
                        onChange={(e) => mobileValidation(e.target.value)}
                        placeholder="971 ** ** *****" />
                    {mobNo.show ? <div className="invalid-feedback text-right" >
                        {mobNo.error}
                    </div> : ""}
                </div >
                <div className="form-group">
                    <label>Password<span className="text-danger">*</span></label>
                    <div className="input-group">
                        <input type={showPassword ? 'text' : 'password'} className={`form-control form-control-sm mb-0 ${password.show ? 'is-invalid' : ''}`} minlength="8"
                            maxlength="100" placeholder="•••••••••" name="user_password"
                            value={password.value}
                            onChange={(e) => passwordValidation(e.target.value)}
                            required maxLength={100}
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

                </div >

                <div className="d-inline-block w-100">
                    <div className="custom-control custom-checkbox d-inline-block">

                        <input type="checkbox" className={`custom-control-input ${!tncChecked ? 'is-invalid' : ''}`} id="customCheck1" onChange={() => isTncChecked(!tncChecked)} />
                        <label className="custom-control-label " for="customCheck1"><span style={{marginTop:"0.17rem",marginLeft:"-0.5rem",position:"relative"}}>Agree with <a className="strong"
                            href="javascript:void(0);">Terms and
                            Conditions</a></span></label>
                    </div>
                </div>
                <div className="form-group mt-2">
                    <button type="submit" className="btn btn-primary text-center w-full" onClick={handleSignUp}>
                        {signUpvalue}
                    </button>
                </div >
                <div className="sign-info blockline w-full text-center">
                    <span className="dark-color d-inline-block line-height-2 ">
                        Already have an account?<a className="text-dark forgotp" onClick={() => setInnerContent("signIn")} ><strong> Log in </strong></a>
                    </span>
                </div>
            </form >
        </div >
    );
};


export default SignUpCom;