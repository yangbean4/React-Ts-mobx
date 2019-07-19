export function createForm(option, url) {
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
  for (const key in option) {
    if (option.hasOwnProperty(key)) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = option[key]
      Form.appendChild(input)
    }
  }
  document.body.appendChild(Form)
  Form.submit()
}
