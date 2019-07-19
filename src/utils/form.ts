export function createForm(data, url) {
  const Formx = document.getElementById('exportForm')
  if (Formx) {
    document.body.removeChild(Formx)
  }
  const Form = document.createElement('form')
  Form.id = 'exportForm'
  Form.action = url
  Form.target = '_blank'
  Form.method = 'post'
  Form.style.display = 'hidden'
  const append = (option, preKey = []) => {
    for (const key in option) {
      if (option.hasOwnProperty(key) && option[key] !== undefined) {
        const value = option[key]

        if (Array.isArray(value)) {
          value.forEach((ele, index) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key + `[${index}]`
            input.value = ele
            Form.appendChild(input)
          })
        } else {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          Form.appendChild(input)
        }
      }
    }
  }
  append(data)
  document.body.appendChild(Form)
  Form.submit()
}
