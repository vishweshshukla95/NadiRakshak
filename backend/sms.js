const axios = require('axios');
require('dotenv').config();

async function sendSMS(phoneNumber, message) {
  try {
    console.log('Sending SMS to:', phoneNumber)
    const response = await axios({
      method: 'POST',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phoneNumber,
      },
      timeout: 10000,
    });
    console.log('Fast2SMS response:', JSON.stringify(response.data))
    if (response.data.return === true) {
      console.log('SMS sent successfully to', phoneNumber)
      return { success: true, messageId: response.data.request_id }
    } else {
      console.log('SMS failed:', response.data)
      return { success: false, error: JSON.stringify(response.data) }
    }
  } catch (err) {
    console.error('SMS error:', err.response?.data || err.message)
    return { success: false, error: err.response?.data?.message || err.message }
  }
}

async function sendAlertToMunicipality(ward, city, risk, hindi, english, phones) {
  const message = english + " Risk: " + risk + "%. -NadiRakshak AI"
  const results = []
  for (const phone of phones) {
    const result = await sendSMS(phone, message)
    results.push({ phone, ...result })
  }
  return results
}

module.exports = { sendSMS, sendAlertToMunicipality }
