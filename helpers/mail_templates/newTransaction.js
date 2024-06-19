const NEW_TRANSACTION_MAIL =

`
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Transaction Initiated</title>
      </head>
      <body>
      <h1>New Transaction Initiated</h1>
      <p>Dear User,</p>
      <p>A new transaction has been initiated with the following details:</p>
      <ul>
          <li><strong>Email:</strong>%TRANSACTION_INITIATOR_EMAIL%</li>
          <li><strong>Amount:</strong> NGN %TRANSACTION_AMOUNT%</li>
          <li><strong>Description:</strong> %TRANSACTION_DESCRIPTION%</li>
      </ul>
      <p>Please review the transaction details and take necessary actions.</p>
      </body>
      </html>
`

const newTransactionValues = (
    initiatorEmail,
    transactionAmount,
    transactionDescription
) => {
    return {
        "%TRANSACTION_INITIATOR_EMAIL%": initiatorEmail,
        "%TRANSACTION_AMOUNT%": transactionAmount,
        "%TRANSACTION_DESCRIPTION%": transactionDescription
    }
}


module.exports = {
    NEW_TRANSACTION_MAIL,
    newTransactionValues
}