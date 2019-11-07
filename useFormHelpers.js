const isStringMinLength = (string, minCharacterLength = 0) => {
  return string.length >= minCharacterLength;
};

export const emptyObjectWithKeys = object => {
  return Object.keys(object).reduce((acc, curr) => {
    acc[curr] = "";
    return acc;
  }, {});
};

export const validateInput = (
  input,
  inputValidationRules = {},
  referenceForm = {},
  referenceValidation = {},
  equalInput = {}
) => {
  // Iterate over each input's validation rules
  return Object.keys(inputValidationRules).reduce(
    (acc, currValidationRule) => {
      switch (currValidationRule) {
        case "minLength":
          acc[input.name][currValidationRule] = isStringMinLength(
            input.value,
            inputValidationRules[currValidationRule]
          );
          return {
            ...equalInput,
            ...acc
          };

        case "equality":
          const isEqual =
            referenceForm[inputValidationRules.equality] === input.value;

          acc[input.name][currValidationRule] = isEqual;

          // Checking if the opposite input is not the current validation status of the one it should be equal to
          if (
            referenceValidation[inputValidationRules.equality].equality !==
            isEqual
          ) {
            return validateInput(
              {
                name: inputValidationRules.equality,
                value: referenceForm[inputValidationRules.equality]
              },
              {
                ...inputValidationRules,
                equality: input.name // have to override the inputValidationRules with the name of the current input (since they are opposite and equal)
              },
              referenceForm,
              { ...referenceValidation, ...acc }, // update the current status of our inputs with the accumulated status
              { ...acc }
            );
          }
          return {
            ...equalInput,
            ...acc
          };

        default:
          return {
            ...equalInput,
            ...acc
          };
      }
    },
    {
      [input.name]: {}
    }
  );
};

/**
 *
 * @param {Object} formValidation - the form's validation status to be iterated through
 * @return {Boolean} True/false as to the entire form being valid or invalid
 */
export const validateEntireForm = formValidation => {
  const isFormInvalid = Object.keys(formValidation)
    .map(inputName => {
      return !Object.values(formValidation[inputName]).includes(false);
    })
    .includes(false);

  return !isFormInvalid;
};

/**
 *
 * @param {Object} inputValidationValues - Object with nested objects containg true/false values
 * @return Objet with only child objects with false values
 */
export const findFailedInputs = inputValidationValues => {
  const failedInputs = Object.keys(inputValidationValues).reduce(
    (acc, currInputName) => {
      let failedValidationsOnInput = Object.entries(
        inputValidationValues[currInputName]
      ).reduce((acc, curr, i) => {
        if (curr[1] === false) {
          acc[curr[0]] = false;
        }
        return acc;
      }, {});
      if (Object.keys(failedValidationsOnInput).length > 0) {
        acc[currInputName] = failedValidationsOnInput;
      }
      return acc;
    },
    {}
  );
  return failedInputs;
};
