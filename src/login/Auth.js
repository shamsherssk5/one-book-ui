import React, { useEffect, useState } from "react";
import "./light/responsive.scss";
import "./light/typography.scss";
import "./light/style.scss";
import "./light/boot.css";
import "./light/animate.css";
import "./light/developer.css";
import "./light/variable.css";
import "./light/scss/style.scss";
import SIGNIN from "./assets/auth-login.png";
import SIGNUP from "./assets/auth-reg.png";
import FORGOTP from "./assets/auth-forgot.png";
import RESETP from "./assets/auth-reset.png";

import SignIn from "./SignIn";
import SignUpCom from "./SignUpCom";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const Auth = ({ setToken, setCurrentUser }) => {
  const slides = {
    signIn: SIGNIN,
    signUp: SIGNUP,
    forgotP: FORGOTP,
    resetP: RESETP,
  };
  const [innerContent, setInnerContent] = useState("signIn");
  window.localStorage.removeItem("token");

  useEffect(() => {
    if (window.location.pathname.includes("reset_password")) {
      let token = new URL(window.location.href).searchParams.get("token");
      if (token) {
        setInnerContent("resetP");
      }
    }
  }, []);

  return (
    <div className="auth-container">
      <section class="sign-in-page">
        <div class="container bg-white mt-4 p-0">
          <div class="row no-gutters">
            <div class="col-md-6 align-self-center">
              <SignIn
                setToken={setToken}
                setCurrentUser={setCurrentUser}
                setInnerContent={setInnerContent}
                innerContent={innerContent}
              />
              <SignUpCom
                setInnerContent={setInnerContent}
                innerContent={innerContent}
              />
              <ForgotPassword
                setInnerContent={setInnerContent}
                innerContent={innerContent}
              />
              <ResetPassword
                setInnerContent={setInnerContent}
                innerContent={innerContent}
              />
            </div>
            <div class="col-md-6 text-center auth-comic">
              <div class="sign-in-detail text-white">
                <h3
                  class="mb-5 text-dark welcome-text"
                  href="javascript:void(0);"
                >
                  Welcome to OneBook!
                </h3>
                <div class="item">
                  <img
                    src={slides[innerContent]}
                    class="img-fluid mb-4"
                    style={{
                      marginLeft: innerContent === "signIn" ? "-60px" : "0",
                    }}
                    title={innerContent}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer>
        <div class="footer w-full text-center">
          <p>Copyright © 2020 Onebook. Inc. All rights</p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
