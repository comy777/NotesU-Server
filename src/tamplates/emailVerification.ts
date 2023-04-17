export const emailTemplate = (token: string, resetPassword?: boolean) => {
  const url = resetPassword 
    ? `http://localhost:5050/auth/reset-password-user?token=${token}`
    : `http://localhost:5050/auth/verify-account?token=${token}`
  const message = resetPassword ? 'Reestablecer contasena' : 'Verifique su cuenta'
  const title = resetPassword ? 'Restaurar contrasena' : 'Verifique su cuenta de correo electronico'
  return ` 
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NotesU</title>
    </head>
    <body>
      <div>
        <h1>${title}</h1>
        <a href=${url}>${message}</a>
      </div>
    </body>
    </html>
  `
}
