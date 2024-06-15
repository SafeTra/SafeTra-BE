const  FORGOT_PASSWORD = 
`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap" rel="stylesheet">
  <title>SafeTra | Email Template</title>
  <style>
    .grid{display: grid; place-items: center; grid-template-columns: 1fr;}
    .flex{display: flex; justify-content: space-between; gap: 1rem; align-items: center;}
    .btn{font-weight: 700; border-radius: 0.3125rem; border: 0; color: #fff;
      transition: background-color .3s ease-in; display: inline-block;
      background: linear-gradient(90deg, rgba(229, 78, 12, .7) 0%, #e54e0c, rgba(229, 78, 12, .7) 100%);
      margin-block: 1.31rem; padding: 1rem; cursor: pointer; font-size: 1rem; letter-spacing: 1px;
    }
    .btn:hover, .btn:focus{background-color: #EA580C;}
  </style>
</head>
<body class="grid" style="background-color: #F0F3F8; color: #1E1E1E; font-size: 1.25rem; min-height: 100vh; max-width: 760px; margin: 0 auto; width: 90%">
  <div>
    <div class="flex">
      <img src="https://theupfolio.com/assets/img/icons/safetra-logo.svg" alt="SafeTra">
      <div>
        <div style="font-size: 14px;">08085952266 <span style="font-size: 12px; margin-left: .3rem;">Toll free (Nigeria)</span></div>
        <span style="font-size: 14px;">+234 907 774 6616 <span style="font-size: 12px; margin-left: .3rem;">(International)</span></span>
      </div>
    </div>
    <main style="background-color: #fff; margin-top: 1.25rem;">
      <div class="flex" style="background-color: #FB923C; color: #fff; padding-inline: 3rem;">
        <h1 style="font-size: 1.5rem;">Welcome to <br> safeTra!</h1>
        <img height="50" src="https://theupfolio.com/assets/img/icons/safetra-security.svg" alt="security icon">
      </div>
      <p style="padding: 2rem 3rem;">Click the button below to reset your password</p>
      <div style="text-align: center; padding-bottom: 2rem;">
        <a style="text-decoration: none; padding-inline: 4rem;" class="btn" href="%PASSWORD_RESET_LINK%" target="_blank">Reset Password</a>
      </div>
    </main>
  </div>
</body>
</html>
`

const forgotPasswordValues = (
    passwordResetLink,
) => {
    return {
        "%PASSWORD_RESET_LINK%": passwordResetLink
    }
}

module.exports = {
    FORGOT_PASSWORD,
    forgotPasswordValues
}