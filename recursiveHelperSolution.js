const isStringMinLength = (string, minCharacterLength = 0) => {
  return string.length >= minCharacterLength
}

export const emptyObjectWithKeys = object => {
  return Object.keys(object).reduce((acc, curr) => {
    acc[curr] = ""
    return acc
  }, {})
}

export const validateInput = (
  input,
  inputValidationRules = {},
  referenceForm = {},
  recurse = false
) => {
  //console.log("oh hello again...", input)
  // Iterate over each input's validation rules
  return Object.keys(inputValidationRules).reduce(
    (acc, currValidationRule) => {
      switch (currValidationRule) {
        case "minLength":
          acc[input.name][currValidationRule] = isStringMinLength(
            input.value,
            inputValidationRules[currValidationRule]
          )
          return acc

        case "equality":
          const isEqual =
            referenceForm[inputValidationRules.equality] === input.value
          // acc[currValidationRule] = isEqual

          acc[input.name][currValidationRule] = isEqual
          if (isEqual && recurse) {
            //console.log("recursing...")
            validateInput(
              {
                name: inputValidationRules.equality,
                value: referenceForm[inputValidationRules.equality],
              },
              inputValidationRules,
              referenceForm,
              false
            )
          }
          //console.log("acc: ", acc, input.name)
          console.log("returning: ", acc)
          return acc

        default:
          return acc
      }
    },
    { [input.name]: {} }
  )
}

export const validateEntireForm = formValidation => {
  const isFormInvalid = Object.keys(formValidation)
    .map(inputName => {
      return !Object.values(formValidation[inputName]).includes(false)
    })
    .includes(false)

  return !isFormInvalid
}
