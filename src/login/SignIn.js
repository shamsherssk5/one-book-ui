import React, { useEffect, useState } from "react";
import LOGO from "./assets/logo-transparent.png";
import ShowP from "./assets/show-text.svg";
import hideP from "./assets/hide-text.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = ({
  setInnerContent,
  innerContent,
  setToken,
  setCurrentUser,
}) => {
  const [signInValue, setSignInValue] = useState("Login");
  const [showPassword, isShowPassword] = useState(false);
  const [showMessage, setMessage] = useState({ isVisible: false, message: "" });
  const [formData, setFormdata] = useState({
    user_email: "",
    user_password: "",
    errorInEmail: false,
    errorInPassWord: false,
    emailError: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    isShowPassword(false);
    setMessage({ isVisible: false, message: "" });
    setFormdata({
      user_email: "",
      user_password: "",
      errorInEmail: false,
      errorInPassWord: false,
      emailError: "",
    });
  }, [innerContent]);

  const handleFormChange = (e) => {
    if (formData.errorInEmail && e.target.name == "user_email")
      setFormdata({
        ...formData,
        user_email: e.target.value,
        errorInEmail: false,
        emailError: "",
      });
    else if (formData.errorInPassWord && e.target.name == "user_password")
      setFormdata({
        ...formData,
        user_password: e.target.value,
        errorInPassWord: false,
      });
    else setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    let emailValid = validateEmail();
    let passwordValid = formData.user_password.trim().length > 0;
    if (emailValid === "valid" && passwordValid) {
      setMessage({ isVisible: false, message: "" });
      setSignInValue("Signing In...");
      await axios
        .post(process.env.REACT_APP_API_ENDPOINT + "/auth/signin", formData)
        .then((resp) => {
          if (resp.data.message) {
            setMessage({ isVisible: true, message: resp.data.message });
            setSignInValue("Login");
          } else {
            window.localStorage.setItem("token", resp.data.token);
            window.localStorage.setItem(
              "currentUser",
              JSON.stringify(resp.data.user)
            );
            setToken(resp.data.token);
            setCurrentUser(resp.data.user);
            navigate("/");
          }
        })
        .catch((err) => {
          console.log(err);
          setMessage({
            isVisible: true,
            message:
              "Something went wrong. Please contact Sytem Administrator.",
          });
          setSignInValue("Login");
        });
    } else if (emailValid === "valid" && !passwordValid) {
      setFormdata({ ...formData, errorInPassWord: true });
    } else if (emailValid !== "valid" && !passwordValid) {
      setFormdata({
        ...formData,
        errorInEmail: true,
        emailError: emailValid,
        errorInPassWord: true,
      });
    } else if (emailValid !== "valid" && passwordValid) {
      setFormdata({ ...formData, errorInEmail: true, emailError: emailValid });
    }
  };
  const validateEmail = () => {
    let mailformat =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (formData.user_email.trim().length <= 0) {
      return "User Email required";
    } else if (!formData.user_email.match(mailformat)) {
      return "Invalid Email";
    }
    return "valid";
  };

  return (
    innerContent === "signIn" && (
      <div className="sign-in-from">
        <div className="text-center w-full">
          <img
            src={LOGO}
            className="img-fluid"
            width="80"
            height="100"
            alt="logo"
          />
        </div>
        <h3 className="mb-0 text-dark sign-in">Log In</h3>
        <p className="m-0">Please login with your user information.</p>
        <div>
          <form className="mt-4" novalidate>
            {showMessage.isVisible ? (
              <div className="alert alert-danger alert-dismissible">
                {showMessage.message}
                <button
                  type="button"
                  className="close text-danger"
                  onClick={() => {
                    setMessage({ isVisible: false, message: "" });
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            ) : (
              ""
            )}
            <div className="form-group">
              <label>
                Email address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control form-control-sm mb-0 ${
                  formData.errorInEmail ? "is-invalid" : ""
                }`}
                placeholder="Onebook@gmail.com"
                name="user_email"
                maxlength="200"
                value={formData.user_email}
                onChange={handleFormChange}
              />
              {formData.errorInEmail ? (
                <div className="invalid-feedback text-right">
                  {formData.emailError}
                </div>
              ) : (
                ""
              )}
            </div>
            <div
              className="form-group"
              style={{ marginBottom: " 2px !important" }}
            >
              <label>
                Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control form-control-sm mb-0 ${
                    formData.errorInPassWord ? "is-invalid" : ""
                  } `}
                  placeholder="•••••••••"
                  name="user_password"
                  required
                  maxlength="100"
                  value={formData.user_password}
                  onChange={handleFormChange}
                />
                <div className="input-group-append">
                  <span
                    className="input-group-text cursor-pointer"
                    id="inputGroupPrepend2"
                  >
                    <img
                      src={showPassword ? ShowP : hideP}
                      width="20"
                      onClick={() => isShowPassword(!showPassword)}
                    />
                  </span>
                </div>
                {formData.errorInPassWord ? (
                  <div className="invalid-feedback text-right">
                    Password required
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="d-inline-block w-100">
              <div className="custom-control custom-checkbox d-inline-block">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="customCheck1"
                  checked
                />
                <label
                  className="custom-control-label text-secondary"
                  for="customCheck1"
                >
                  {" "}
                  <span
                    style={{
                      marginTop: "0.17rem",
                      marginLeft: "-0.5rem",
                      position: "relative",
                    }}
                  >
                    Remember Me
                  </span>
                </label>
              </div>
              <a
                className="float-right text-dark forgotp"
                onClick={() => setInnerContent("forgotP")}
              >
                Forgot password?
              </a>
            </div>
            <div className="form-group mt-4 ">
              <label>Select a Language</label>
              <select className="form-control form-control-sm mb-0">
                <option>English</option>
              </select>
            </div>
            <div className="form-group mt-4 login-but">
              <button
                type="submit"
                className="btn btn-primary text-center w-full"
                onClick={handleSignIn}
              >
                {signInValue}
              </button>
            </div>
            <div className="sign-info blockline w-full text-center">
              <span className="dark-color d-inline-block line-height-2 ">
                Don't have an account?{" "}
                <a
                  className="text-dark forgotp"
                  onClick={() => setInnerContent("signUp")}
                >
                  <strong>Sign Up Now!</strong>
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default SignIn;
