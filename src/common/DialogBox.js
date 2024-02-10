import React from "react";
import { confirm } from "react-confirm-box";
import { confirmationBox, proceedBox } from "../common/ConfirmationBox";
export const getConfirmation = async (message, callback, failed) => {
  const result = await confirm(message, confirmationBox);
  if (result) {
    callback();
  } else {
    if (failed) {
      failed();
    }
  }
};

export const getProceed = async (message, callback, failed) => {
  const result = await confirm(message, proceedBox);
  if (result) {
    callback();
  } else {
    if (failed) {
      failed();
    }
  }
};
