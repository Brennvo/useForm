import { useReducer } from "react";
import {
  validateEntireForm,
  validateInput,
  emptyObjectWithKeys,
  findFailedInputs
} from "./recursiveHelperSolution";

const reducer = (state, action) => {
  switch (action.type) {
    case "FORM_SUBMISSION":
      return {
        ...state,
        isFormSubmitted: true
      };
    case "INPUT_CHANGE":
      const validatedIncomingInput = {
        ...validateInput(
          action.input,
          action.inputValidationRules,
          { ...state.formValues, [action.input.name]: action.input.value },
          { ...state.formValidation }
        )
      };
      return {
        ...state,
        formValues: {
          ...state.formValues,
          [action.input.name]: action.input.value
        },
        formValidation: {
          ...state.formValidation,
          ...validatedIncomingInput
        },
        isFormValid: validateEntireForm({
          ...state.formValidation,
          ...validatedIncomingInput
        }),
        isFormSubmitted: false
      };
  }
};

export const useForm = (
  initialFormValues = {},
  formValidationRules = emptyObjectWithKeys(initialFormValues)
) => {
  const [
    { formValues, formValidation, isFormValid, isFormSubmitted },
    dispatch
  ] = useReducer(reducer, {
    formValues: initialFormValues,
    formValidation: Object.keys(formValidationRules).reduce((acc, currKey) => {
      acc[currKey] = emptyObjectWithKeys(formValidationRules[currKey]);
      return acc;
    }, {}),
    isFormInvalid: false,
    isFormSubmitted: false
  });

  const handleInputChange = e => {
    e.persist();
    dispatch({
      type: "INPUT_CHANGE",
      input: { name: e.target.name, value: e.target.value },
      inputValidationRules: formValidationRules[e.target.name]
    });
  };

  /**
   *
   * @param {Array} values - array of input values in which successfull submission callback is to be called with
   * @return {Object} The values from the form that the input array wants
   */
  const mapKeysToValues = values => {
    return values.reduce((acc, curr, i) => {
      acc[curr] = formValues[curr];
      return acc;
    }, {});
  };

  /**
   *
   * @param {Function} cb | function to be called when form is submitted
   * @param {Array} formValueKeys | an array of keys on the form object in which the callback will be executed with
   */
  const handleFormSubmit = (
    validFormSubmission,
    failedFormSubmission,
    formValueKeys = Object.keys(formValues)
  ) => e => {
    e.preventDefault();
    dispatch({ type: "FORM_SUBMISSION" });
    if (!isFormValid) {
      failedFormSubmission(findFailedInputs(formValidation));
    } else {
      validFormSubmission(mapKeysToValues(formValueKeys));
    }
  };

  return {
    formValues,
    formValidation,
    isFormValid,
    isFormSubmitted,
    handleInputChange,
    handleFormSubmit
  };
};
